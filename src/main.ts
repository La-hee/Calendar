import { app, BrowserWindow, ipcMain } from 'electron';
import started from 'electron-squirrel-startup';
import dotenv from 'dotenv';
import path from 'path';
import Database from 'better-sqlite3';


let db: Database.Database;

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

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


const createWindow = (): void => {
  // Create the browser window.
const mainWindow = new BrowserWindow({
  width: 580,
  height: 440,

  transparent: true,
  frame: false,
  resizable: true,
  hasShadow: false,
  backgroundColor: '#00000000',

  webPreferences: {
    preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
  },
});

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// 일정 목록 불러오기
ipcMain.handle('schedules:get-all', () => {
  return db.prepare(`
    SELECT * FROM schedules ORDER BY date, time
  `).all();
});

// 일정 추가하기

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


// API 처리

dotenv.config({ path: path.join(app.getAppPath(), '.env') });

ipcMain.handle('get-holidays', async (_event, year: number, month: number) => {
  const serviceKey = process.env.HOLIDAY_API_KEY;

  if (!serviceKey) {
    throw new Error('.env 파일에서 HOLIDAY_API_KEY를 찾을 수 없습니다.');
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
});


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  initDatabase();
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
