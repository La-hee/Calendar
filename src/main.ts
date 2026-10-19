
import { app, BrowserWindow, ipcMain } from 'electron';
import started from 'electron-squirrel-startup';
import dotenv from 'dotenv';
import path from 'path';
import Database from 'better-sqlite3';

let db: Database.Database;
let mainWindow: BrowserWindow | null = null;
let isWindowLocked = false;

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// 설치 및 제거 처리
if (started) {
  app.quit();
}

// 데이터베이스 초기화
const initDatabase = () => {
  const dbPath = path.join(app.getPath('userData'), 'calendar.db');

  db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT '',
      alarm INTEGER NOT NULL DEFAULT 0,
      repeat TEXT NOT NULL DEFAULT '',
      memo TEXT NOT NULL DEFAULT '',
      completed INTEGER NOT NULL DEFAULT 0
    )
  `);
};

// 창 생성
const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: 580,
    height: 440,
    transparent: true,
    frame: false,
    resizable: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    alwaysOnTop: false,
    skipTaskbar: true,

    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // 현재 고정 상태 적용
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // 개발자 도구
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};


// 창 고정 상태 변경
ipcMain.handle('window:set-locked', (_event, locked: boolean) => {
  isWindowLocked = Boolean(locked);
  return isWindowLocked;
});

// 창 고정 상태 조회
ipcMain.handle('window:get-locked', () => {
  return isWindowLocked;
});


// 일정 목록 불러오기
ipcMain.handle('schedules:get-all', () => {
  return db.prepare(`
    SELECT * FROM schedules ORDER BY date, time
  `).all();
});

// 일정 추가하기
ipcMain.handle('schedules:add', (_event, schedule) => {
  const result = db.prepare(`
    INSERT INTO schedules
      (title, date, time, color, alarm, repeat, memo, completed)
    VALUES
      (@title, @date, @time, @color, @alarm, @repeat, @memo, @completed)
  `).run({
    title: schedule.title,
    date: schedule.date,
    time: schedule.time ?? '',
    color: schedule.color ?? '',
    alarm: schedule.alarm ?? '없음',
    repeat: schedule.repeat ?? '반복 안 함',
    memo: schedule.memo ?? '',
    completed: schedule.completed ? 1 : 0,
  });

  return Number(result.lastInsertRowid);
});

// 일정 수정하기
ipcMain.handle('schedules:update', (_event, schedule) => {
  db.prepare(`
    UPDATE schedules
    SET title = @title,
        date = @date,
        time = @time,
        color = @color,
        alarm = @alarm,
        repeat = @repeat,
        memo = @memo,
        completed = @completed
    WHERE id = @id
  `).run({
    ...schedule,
    time: schedule.time ?? '',
    color: schedule.color ?? '',
    alarm: schedule.alarm ?? '없음',
    repeat: schedule.repeat ?? '반복 안 함',
    memo: schedule.memo ?? '',
    completed: schedule.completed ? 1 : 0,
  });

  return true;
});

// 완료 상태 변경하기
ipcMain.handle(
  'schedules:toggle-completed',
  (_event, id: number, completed: boolean) => {
    db.prepare(`
      UPDATE schedules SET completed = ? WHERE id = ?
    `).run(completed ? 1 : 0, id);

    return true;
  },
);

// 환경변수 불러오기
dotenv.config({
  path: path.join(app.getAppPath(), '.env'),
});

// 공휴일 API
ipcMain.handle(
  'get-holidays',
  async (_event, year: number, month: number) => {
    const serviceKey = process.env.HOLIDAY_API_KEY;

    if (!serviceKey) {
      throw new Error(
        '.env 파일에서 HOLIDAY_API_KEY를 찾을 수 없습니다.',
      );
    }

    const response = await fetch(
      'https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?' +
        new URLSearchParams({
          serviceKey,
          solYear: String(year),
          solMonth: String(month).padStart(2, '0'),
          _type: 'json',
          numOfRows: '100',
        }),
    );

    if (!response.ok) {
      throw new Error(`공휴일 API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    const items = data?.response?.body?.items?.item;

    if (!items) return [];

    return (Array.isArray(items) ? items : [items])
      .filter((item: any) => item.isHoliday === 'Y')
      .map((item: any) => ({
        date: String(item.locdate),
        name: item.dateName,
      }));
  },
);

// 앱 초기화 완료 후 실행
app.whenReady().then(() => {
  initDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 모든 창이 닫혔을 때 처리
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
