
import {app, BrowserWindow, ipcMain, Notification, screen} from 'electron';
import * as fs from 'fs';
import started from 'electron-squirrel-startup';
import dotenv from 'dotenv';
import path from 'path';
import Database from 'better-sqlite3';

let db: Database.Database;
let mainWindow: BrowserWindow | null = null;
let isWindowLocked = false;
let isEditingSchedule = false;

// 이미 울린 알람을 중복해서 표시하지 않기 위한 목록
const firedAlarms = new Set<string>();

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// 날짜를 YYYY-MM-DD 형식으로 변환
const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

// 반복 일정이 해당 날짜에 실행되는지 확인
const isScheduleToday = (
  schedule: any,
  date: Date,
): boolean => {
  const start = new Date(`${schedule.date}T00:00:00`);

  const current = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  if (Number.isNaN(start.getTime()) || current < start) {
    return false;
  }

  const repeat = schedule.repeat || '반복 안 함';

  switch (repeat) {
    case '매일':
      return true;

    case '매주':
      return start.getDay() === current.getDay();

    case '매월':
      return start.getDate() === current.getDate();

    case '매년':
      return (
        start.getMonth() === current.getMonth() &&
        start.getDate() === current.getDate()
      );

    default:
      return getDateKey(start) === getDateKey(current);
  }
};

// 알람 확인
const checkAlarms = () => {
  if (!Notification.isSupported()) return;

  const now = new Date();

  const schedules = db.prepare(`
    SELECT * FROM schedules
    WHERE completed = 0
      AND alarm != '없음'
      AND alarm != ''
  `).all() as any[];

  // 각 알람 설정에 따른 시간 차이
  const offsets: Record<string, number> = {
    '마감 시간에 알림': 0,
    '10분 전': 10 * 60 * 1000,
    '1시간 전': 60 * 60 * 1000,
    '하루 전': 24 * 60 * 60 * 1000,
  };

  for (const schedule of schedules) {
    if (!schedule.time) continue;

    const offset = offsets[schedule.alarm];

    if (offset === undefined) continue;

    // 알람 시각으로부터 일정 실행 날짜를 계산
    const occurrenceDate = new Date(
      now.getTime() + offset,
    );

    if (!isScheduleToday(schedule, occurrenceDate)) {
      continue;
    }

    const [hour, minute] = schedule.time
      .split(':')
      .map(Number);

    if (
      !Number.isInteger(hour) ||
      !Number.isInteger(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      continue;
    }

    // 일정 실행 시각
    const target = new Date(occurrenceDate);
    target.setHours(hour, minute, 0, 0);

    // 실제 알람이 울려야 하는 시각
    const alarmTime = target.getTime() - offset;
    const difference = now.getTime() - alarmTime;

    // 15초 간격 확인을 고려한 허용 범위
    if (difference < 0 || difference > 20_000) {
      continue;
    }

    // 동일한 일정의 알람이 중복 표시되지 않도록 확인
    const alarmKey =
      `${schedule.id}:${getDateKey(target)}:${schedule.alarm}`;

    if (firedAlarms.has(alarmKey)) continue;

    firedAlarms.add(alarmKey);

    const notification = new Notification({
      title: '📅 일정 알림 📅',
      body: `${schedule.title}\n${schedule.time} 일정`,
    });

    notification.on('click', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show();
        mainWindow.focus();
      }
    });

    notification.show();
  }
};

// 설치 및 제거 처리
if (started) {
  app.quit();
}

// 데이터베이스 초기화
const initDatabase = () => {
  const dbPath = path.join(
    app.getPath('userData'),
    'calendar.db',
  );

  db = new Database(dbPath);
  db.pragma('foreign_keys = ON');


  // 일정 테이블 생성
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

  // 기존 데이터베이스에 endDate 열이 없으면 추가
  const columns = db.prepare(
    `PRAGMA table_info(schedules)`,
  ).all() as { name: string }[];

  if (!columns.some((column) => column.name === 'endDate')) {
    db.exec(`
      ALTER TABLE schedules
      ADD COLUMN endDate TEXT NOT NULL DEFAULT ''
    `);
  }


  
db.exec(`
  CREATE TABLE IF NOT EXISTS schedule_occurrences (
    schedule_id INTEGER NOT NULL,
    occurrence_date TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (schedule_id, occurrence_date),
    FOREIGN KEY (schedule_id) REFERENCES schedules(id)
      ON DELETE CASCADE
  )
`);

};

// 창 위치 저장 파일
const boundsPath = path.join(
  app.getPath('userData'),
  'window-bounds.json',
);

// 창 고정 상태 저장 파일
const lockPath = path.join(
  app.getPath('userData'),
  'window-lock.json',
);

// 저장된 창 고정 상태 불러오기
const getSavedLockState = (): boolean => {
  try {
    if (!fs.existsSync(lockPath)) {
      return false;
    }

    const saved = JSON.parse(
      fs.readFileSync(lockPath, 'utf-8'),
    );

    return saved.locked === true;
  } catch {
    return false;
  }
};

// 창 고정 상태 저장하기
const saveLockState = (locked: boolean) => {
  try {
    fs.writeFileSync(
      lockPath,
      JSON.stringify({ locked }, null, 2),
      'utf-8',
    );
  } catch (error) {
    console.error('창 고정 상태 저장 실패:', error);
  }
};


// 저장된 창 위치 불러오기
const getSavedBounds = () => {
  try {
    if (!fs.existsSync(boundsPath)) {
      return { width: 580, height: 440 };
    }

    const saved = JSON.parse(
      fs.readFileSync(boundsPath, 'utf-8'),
    );

    if (
      !Number.isFinite(saved.x) ||
      !Number.isFinite(saved.y) ||
      !Number.isFinite(saved.width) ||
      !Number.isFinite(saved.height)
    ) {
      return { width: 580, height: 440 };
    }

    // 저장된 위치가 현재 모니터에 보이는지 확인
    const displays = screen.getAllDisplays();
    const isVisible = displays.some((display) => {
      const area = display.workArea;

      return (
        saved.x < area.x + area.width &&
        saved.x + saved.width > area.x &&
        saved.y < area.y + area.height &&
        saved.y + saved.height > area.y
      );
    });

    if (!isVisible) {
      return { width: saved.width, height: saved.height };
    }

    return saved;
  } catch {
    return { width: 580, height: 440 };
  }
};


 // 현재 창 위치 저장
const saveWindowBounds = () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isMinimized() || mainWindow.isMaximized()) return;

  try {
    const bounds = mainWindow.getBounds();

    fs.writeFileSync(
      boundsPath,
      JSON.stringify(bounds, null, 2),
      'utf-8',
    );
  } catch (error) {
    console.error('창 위치 저장 실패:', error);
  }
};


// 창 생성
const createWindow = (): void => {
  const savedBounds = getSavedBounds();
  isWindowLocked = getSavedLockState();

  mainWindow = new BrowserWindow({
    ...savedBounds,
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


  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // 창 위치 저장 이벤트
  mainWindow.on('move', () => {
    saveWindowBounds();
  });

  //창 크기 변경 감지
  mainWindow.on('resize', () => {
    saveWindowBounds();
  });

  //창 닫기 감지
  mainWindow.on('close', () => {
    saveWindowBounds();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};



// 창 이동 잠금 상태 변경
ipcMain.handle(
  'window:set-locked',
  (_event, locked: boolean) => {
    isWindowLocked = Boolean(locked);

    // 고정 상태 저장
    saveLockState(isWindowLocked);

    mainWindow?.setFocusable(
      !isWindowLocked || isEditingSchedule,
    );

    return isWindowLocked;
  },
);

// 일정 편집 상태 변경
ipcMain.handle(
  'window:set-editing',
  (_event, editing: boolean) => {
    if (!mainWindow) return false;

    isEditingSchedule = Boolean(editing);

    mainWindow.setFocusable(
      !isWindowLocked || isEditingSchedule,
    );

    if (isEditingSchedule) {
      mainWindow.show();
      mainWindow.setSkipTaskbar(true);
      mainWindow.focus();
    } else if (isWindowLocked) {
      mainWindow.blur();
    }

    return true;
  },
);

// 창 이동 잠금 상태 조회
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
// 일정 추가하기
ipcMain.handle('schedules:add', (_event, schedule) => {
  const result = db.prepare(`
    INSERT INTO schedules
      (title, date, endDate, time, color, alarm, repeat, memo, completed)
    VALUES
      (@title, @date, @endDate, @time, @color, @alarm, @repeat, @memo, @completed)
  `).run({
    title: schedule.title,
    date: schedule.date,
    endDate: schedule.endDate || schedule.date,
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
// 일정 수정하기
ipcMain.handle('schedules:update', (_event, schedule) => {
  db.prepare(`
    UPDATE schedules
    SET title = @title,
        date = @date,
        endDate = @endDate,
        time = @time,
        color = @color,
        alarm = @alarm,
        repeat = @repeat,
        memo = @memo,
        completed = @completed
    WHERE id = @id
  `).run({
    ...schedule,
    endDate: schedule.endDate || schedule.date,
    time: schedule.time ?? '',
    color: schedule.color ?? '',
    alarm: schedule.alarm ?? '없음',
    repeat: schedule.repeat ?? '반복 안 함',
    memo: schedule.memo ?? '',
    completed: schedule.completed ? 1 : 0,
  });

  return true;
});

// 일정 삭제하기
ipcMain.handle('schedules:delete', (_event, id: number) => {
  db.prepare(`
    DELETE FROM schedules WHERE id = ?
  `).run(id);

  return true;
});

// 일정 완료 상태 변경하기
ipcMain.handle(
  'schedules:toggle-completed',
  (_event, id: number, completed: boolean) => {
    db.prepare(`
      UPDATE schedules SET completed = ? WHERE id = ?
    `).run(completed ? 1 : 0, id);

    return true;
  },
);


ipcMain.handle('schedules:get-occurrence-completions', () => {
  return db.prepare(`
    SELECT schedule_id, occurrence_date, completed
    FROM schedule_occurrences
  `).all();
});

ipcMain.handle(
  'schedules:toggle-occurrence-completed',
  (_event, id: number, date: string, completed: boolean) => {
    db.prepare(`
      INSERT INTO schedule_occurrences
        (schedule_id, occurrence_date, completed)
      VALUES (?, ?, ?)
      ON CONFLICT(schedule_id, occurrence_date)
      DO UPDATE SET completed = excluded.completed
    `).run(id, date, completed ? 1 : 0);

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
      throw new Error(
        `공휴일 API 요청 실패: ${response.status}`,
      );
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

    // 설치된 프로그램만 윈도우 로그인 시 자동 실행
  if (app.isPackaged && process.platform === 'win32') {
    app.setLoginItemSettings({
      openAtLogin: true,
      path: process.execPath,
    });
  }

  createWindow();

  // 앱 실행 직후 알람 확인
  checkAlarms();

  // 이후 15초마다 알람 확인
  setInterval(checkAlarms, 15_000);

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
