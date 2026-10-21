import { useEffect, useState, useRef } from 'react';

type Schedule = {
  id: number;
  title: string;
  date: string;
  endDate: string;
  time: string;
  color: string;
  alarm: string;
  memo: string;
  completed: boolean;
};

type Holiday = {
  date: string;
  name: string;
};

const colors = [
  { name: '파랑', value: '#8DB8FF' },
  { name: '민트', value: '#8EDCC5' },
  { name: '분홍', value: '#FFA6BB' },
  { name: '노랑', value: '#F4D477' },
  { name: '보라', value: '#BBA3F5' },
  { name: '회색', value: '#B7BBC4' },
];

const pad = (n: number) => String(n).padStart(2, '0');

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;



const occursOnDate = (
  schedule: Schedule,
  currentDate: Date,
): boolean => {
  const [year, month, day] = schedule.date.split('-').map(Number);
  const startDate = new Date(year, month - 1, day);

  const [endYear, endMonth, endDay] =
    (schedule.endDate || schedule.date).split('-').map(Number);

  const endDate = new Date(endYear, endMonth - 1, endDay);

  const current = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
  );

  return current >= startDate && current <= endDate;
};


export default function App() {
  const [viewDate, setViewDate] = useState(new Date());
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [checkingApiKey, setCheckingApiKey] = useState(true);
  const [showApiKeySetup, setShowApiKeySetup] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savingApiKey, setSavingApiKey] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [color, setColor] = useState(colors[0].value);
  const apiKeyInputRef = useRef<HTMLInputElement>(null);
  
  
  useEffect(() => {
  let cancelled = false;

  window.holidayAPI
    .hasApiKey()
    .then((exists) => {
      if (cancelled) return;

      setApiKeyReady(exists);
      setShowApiKeySetup(!exists);
    })
    .catch((error) => {
      console.error('API 키 확인 실패:', error);

      if (!cancelled) {
        setApiKeyError('API 키 설정 상태를 확인하지 못했어.');
        setShowApiKeySetup(true);
      }
    })
    .finally(() => {
      if (!cancelled) {
        setCheckingApiKey(false);
      }
    });

  return () => {
    cancelled = true;
  };
}, []);


  // 사용자가 추가한 색상 목록
  const [customColors, setCustomColors] = useState<
    { name: string; value: string }[]
  >(() => {
    try {
      const saved = localStorage.getItem('calendar-custom-colors');
      if (!saved) return [];

      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) return [];

      return parsed.filter(
        (item) =>
          typeof item.name === 'string' &&
          typeof item.value === 'string' &&
          /^#[0-9a-fA-F]{6}$/.test(item.value),
      );
    } catch {
      return [];
    }
  });

  // 숨겨진 색상 선택기
  const [pendingColor, setPendingColor] = useState('#F4A261');
  const [hexInput, setHexInput] = useState('F4A261');
  const [showColorPicker, setShowColorPicker] = useState(false);

  // 사용자 지정 색상을 저장
  useEffect(() => {
    localStorage.setItem(
      'calendar-custom-colors',
      JSON.stringify(customColors),
    );
  }, [customColors]);

  // 기본 색상과 사용자 지정 색상 합치기
  const allColors = [...colors, ...customColors];

  // 새 색상 추가
  const addCustomColor = (value: string) => {
    const normalized = value.toUpperCase();

    const existing = allColors.find(
      (item) => item.value.toUpperCase() === normalized,
    );

    if (existing) {
      setColor(existing.value);
      return;
    }

    const newColor = {
      name: `사용자 색상 ${customColors.length + 1}`,
      value: normalized,
    };

    setCustomColors((current) => [...current, newColor]);
    setColor(normalized);
  };

  // 사용자 지정 색상 삭제
  const removeCustomColor = (value: string) => {
    const confirmed = window.confirm(
      '이 색상을 팔레트에서 삭제할까?\n이미 저장된 일정의 색상은 바뀌지 않아.',
    );

    if (!confirmed) return;

    setCustomColors((current) =>
      current.filter((item) => item.value !== value),
    );
  };

  const [alarm, setAlarm] = useState('없음');
  const [memo, setMemo] = useState('');
  const [isWindowLocked, setIsWindowLocked] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // 달력을 7일씩 나눠 화면에 배치하기 위한 날짜 배열
const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

const calendarCells: (Date | null)[] = Array.from(
  { length: totalCells },
  (_, index) => {
    const day = index - firstDay + 1;

    if (day < 1 || day > daysInMonth) {
      return null;
    }

    return new Date(year, month, day);
  },
);

const calendarWeeks = Array.from(
  { length: totalCells / 7 },
  (_, index) => calendarCells.slice(index * 7, index * 7 + 7),
);

  useEffect(() => {
  window.scheduleAPI
    .getAll()
    .then((rows) => {
      setSchedules(
        rows.map((row) => ({
          ...row,
          endDate: row.endDate || row.date,
          alarm: String(row.alarm ?? '없음'),
          completed: Boolean(row.completed),
        })),
      );
    })
    .catch((error) => {
      console.error('일정 불러오기 실패:', error);
    });
}, []);

  useEffect(() => {
  window.windowAPI
    .getLocked()
    .then(setIsWindowLocked)
    .catch((error) => {
      console.error('창 이동 잠금 상태 조회 실패:', error);
    });
  }, []);

  useEffect(() => {
  window.windowAPI
    .setEditing(Boolean(selectedDate))
    .catch((error) => {
      console.error('창 편집 상태 변경 실패:', error);
    });
}, [selectedDate, isWindowLocked]);

  useEffect(() => {
  if (!apiKeyReady) {
    setHolidays([]);
    return;
  }

  let cancelled = false;

  window.holidayAPI
    .getHolidays(year, month + 1)
    .then((data) => {
      if (!cancelled) {
        setHolidays(data);
      }
    })
    .catch((error) => {
      console.error('공휴일 조회 실패:', error);

      if (!cancelled) {
        setHolidays([]);
      }
    });

  return () => {
    cancelled = true;
  };
}, [year, month, apiKeyReady]);

  const now = new Date();
  const today = dateKey(now);

  const monthLabel = `${year}년 ${month + 1}월`;

  const todayWeekday = now.toLocaleDateString('ko-KR', {
    weekday: 'long',
  });

  const todayFullLabel = now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    weekday: 'long',
  });

  const openDay = (date: string) => {
  setSelectedDate(date);
  setEndDate(date);
  setTitle('');
  setTime('09:00');
  setColor(colors[0].value);
  setAlarm('없음');
  setMemo('');
  setEditingId(null);
};

const openSchedule = (schedule: Schedule) => {
  setSelectedDate(schedule.date);
  setEndDate(schedule.endDate || schedule.date);
  setEditingId(schedule.id);
  setTitle(schedule.title);
  setTime(schedule.time);
  setColor(schedule.color);
  setAlarm(schedule.alarm);
  setMemo(schedule.memo);
};



const toggleScheduleCompleted = async (id: number) => {
  const schedule = schedules.find((item) => item.id === id);
  if (!schedule) return;

  const completed = !schedule.completed;

  try {
    await window.scheduleAPI.toggleCompleted(id, completed);

    setSchedules((current) =>
      current.map((item) =>
        item.id === id ? { ...item, completed } : item,
      ),
    );
  } catch (error) {
    console.error('완료 상태 저장 실패:', error);
  }
};


  
const saveSchedule = async () => {
  if (!title.trim() || !selectedDate) return;

  const schedule = {
    title: title.trim(),
    date: selectedDate,
    endDate: endDate || selectedDate,
    time,
    color,
    alarm,
    memo,
    completed: false,
  };

  try {
    if (editingId !== null) {
      const existing = schedules.find((item) => item.id === editingId);
      if (!existing) return;

      const updated = { ...existing, ...schedule };
      await window.scheduleAPI.update(updated);

      setSchedules((current) =>
        current.map((item) =>
          item.id === editingId ? updated : item,
        ),
      );
    } else {
      const id = await window.scheduleAPI.add(schedule);

      setSchedules((current) => [
        ...current,
        { ...schedule, id },
      ]);
    }

    setSelectedDate('');
    setEditingId(null);
  } catch (error) {
    console.error('일정 저장 실패:', error);
    alert('일정을 저장하지 못했어. 터미널 오류를 확인해 줘!');
  }
};

const deleteSchedule = async () => {
  if (editingId === null) return;

  const existing = schedules.find(
    (item) => item.id === editingId,
  );

  if (!existing) return;

  const confirmed = window.confirm(
    `"${existing.title}" 을 삭제할까?\n삭제한 일정은 복구할 수 없어.`,
  );

  if (!confirmed) return;

  try {
    await window.scheduleAPI.remove(editingId);

    setSchedules((current) =>
      current.filter((item) => item.id !== editingId),
    );

    setSelectedDate('');
    setEditingId(null);
  } catch (error) {
    console.error('일정 삭제 실패:', error);
    alert('일정을 삭제하지 못했어. 다시 시도해 줘!');
  }
};

useEffect(() => {
  if (!showApiKeySetup || checkingApiKey) return;

  const input = apiKeyInputRef.current;
  if (!input) return;

  input.focus();
}, [showApiKeySetup, checkingApiKey]);



  const handleSaveApiKey = async () => {
    const key = apiKeyInput.trim();

    if (!key) {
      setApiKeyError('공휴일 API 키를 입력해 줘.');
      return;
    }

    setSavingApiKey(true);
    setApiKeyError('');

    try {
      await window.holidayAPI.saveApiKey(key);

      setApiKeyInput('');
      setApiKeyReady(true);
      setShowApiKeySetup(false);
    } catch (error) {
      console.error('API 키 저장 실패:', error);
      setApiKeyError('API 키를 저장하지 못했어. 다시 시도해 줘!');
    } finally {
      setSavingApiKey(false);
    }
  };



  return (
    <main className="app">
    
      {showApiKeySetup && !checkingApiKey && (
        <div
          className="api-key-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            background: 'rgba(25, 30, 40, 0.45)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="api-key-title"
            style={{
              width: '100%',
              maxWidth: 380,
              padding: 24,
              borderRadius: 20,
              background: '#fff',
              color: '#333',
              boxShadow: '0 16px 50px rgba(0,0,0,0.18)',
            }}
          >
            <h2
              id="api-key-title"
              style={{ margin: '0 0 10px' }}
            >
              📅 공휴일 설정
            </h2>

            <p style={{ lineHeight: 1.6, fontSize: 14 }}>
              공휴일을 표시하려면 공공데이터포털에서 발급받은
              공휴일 API 키를 입력해 줘.
              <br />
              키는 이 컴퓨터에 저장돼.
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleSaveApiKey();
              }}
            >
              <label
                htmlFor="holiday-api-key"
                style={{
                  display: 'block',
                  marginBottom: 8,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                공휴일 API 키
              </label>

              <input
                ref={apiKeyInputRef}
                id="holiday-api-key"
                type="password"
                autoComplete="off"
                value={apiKeyInput}
                onChange={(event) =>
                  setApiKeyInput(event.target.value)
                }
                placeholder="발급받은 API 키 입력"
                autoFocus
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  border: '1px solid #d8dce5',
                  borderRadius: 10,
                  fontSize: 13,
                  marginBottom: 12,
                }}
              />

              {apiKeyError && (
                <p
                  role="alert"
                  style={{
                    color: '#d64545',
                    fontSize: 13,
                    margin: '0 0 12px',
                  }}
                >
                  {apiKeyError}
                </p>
              )}

              <button
                type="submit"
                disabled={savingApiKey || !apiKeyInput.trim()}
                style={{
                  width: '100%',
                  padding: 12,
                  border: 0,
                  borderRadius: 10,
                  background: '#7198ee',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity:
                    savingApiKey || !apiKeyInput.trim()
                      ? 0.6
                      : 1,
                }}
              >
                {savingApiKey ? '저장 중...' : '저장하고 시작하기'}
              </button>
            </form>
          </section>
        </div>
      )}

      
    
<header
  className={`calendar-header ${
    isWindowLocked ? 'no-drag' : 'drag-area'
  }`}
>
  <div className="today-info">
    <strong className="today-date">
      <span className="today-prefix">오늘은</span>
      {now.getFullYear()}.{now.getMonth() + 1}.{now.getDate()}
      <span className="today-weekday">{todayWeekday}</span>
    </strong>
  </div>

  <div className="month-title">
    <div className="month-arrows">
      <button
        className="nav-btn"
        onClick={() => setViewDate(new Date(year, month - 1, 1))}
        aria-label="이전 달"
      >
        ‹
      </button>

      <button
        className="nav-btn"
        onClick={() => setViewDate(new Date(year, month + 1, 1))}
        aria-label="다음 달"
      >
        ›
      </button>
    </div>

    <div className="month-label">
      <strong className="month-number">{month + 1}월</strong>
      <span className="month-year">{year}년</span>
    </div>
  </div>

  <button
  type="button"
  className="pin-btn no-drag"
  aria-label={isWindowLocked ? '창 이동 잠금 해제' : '창 이동 잠금'}
  aria-pressed={isWindowLocked}
  title={isWindowLocked ? '창 이동 잠금 해제' : '창 이동 잠금'}
  onClick={async (event) => {
    event.stopPropagation();

    try {
      const locked = await window.windowAPI.setLocked(!isWindowLocked);
      setIsWindowLocked(locked);
    } catch (error) {
      console.error('창 이동 잠금 변경 실패:', error);
    }
  }}
>
  {isWindowLocked ? '📌' : '📍'}
</button>

<button
  type="button"
  className="pin-btn no-drag quit-btn"
  aria-label="앱 종료"
  title="앱 종료"
  onClick={() => {
    const confirmed = window.confirm(
      '이대로 완전히 종료하시겠어요?',
    );

    if (confirmed) {
      void window.windowAPI.quitApp();
    }
  }}
  style={{
    color: '#D94A4A',
    marginLeft: 6,
  }}
>
  ×
</button>

</header>



      <section className="calendar" aria-label={`${monthLabel} 달력`}>
        <div className="weekdays">
          {['월', '화', '수', '목', '금', '토', '일'].map(
            (day, index) => (
              <div
                key={day}
                className={index === 5 ? 'sat' : index === 6 ? 'sun' : ''}
              >
                {day}
              </div>
            ),
          )}
        </div>

        <div className="calendar-days">
  {calendarWeeks.map((week, weekIndex) => {
    const weekStart = new Date(
      year,
      month,
      1 - firstDay + weekIndex * 7,
    );

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekStartKey = dateKey(weekStart);
    const weekEndKey = dateKey(weekEnd);

    // 여러 날짜에 걸친 반복 없는 일정만 막대로 표시
    const barSchedules = schedules
      .filter((schedule) => {
        const start = schedule.date;
        const end = schedule.endDate || schedule.date;

        return (
          start !== end &&
          start <= weekEndKey &&
          end >= weekStartKey
        );
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    // 막대가 서로 겹치지 않도록 행을 배정
    const laneEnds: number[] = [];

    const bars = barSchedules.map((schedule) => {
      const startDate = new Date(`${schedule.date}T00:00:00`);
      const endDate = new Date(
        `${schedule.endDate || schedule.date}T00:00:00`,
      );

      const startCol = Math.max(
        0,
        Math.round(
          (startDate.getTime() - weekStart.getTime()) /
            86400000,
        ),
      );

      const endCol = Math.min(
        6,
        Math.round(
          (endDate.getTime() - weekStart.getTime()) /
            86400000,
        ),
      );

      let lane = laneEnds.findIndex(
        (lastCol) => lastCol < startCol,
      );

      if (lane === -1) {
        lane = laneEnds.length;
      }

      laneEnds[lane] = endCol;

      return {
        schedule,
        startCol,
        endCol,
        lane,
        isStart:
          schedule.date >= weekStartKey &&
          schedule.date <= weekEndKey,
        isEnd:
          (schedule.endDate || schedule.date) >= weekStartKey &&
          (schedule.endDate || schedule.date) <= weekEndKey,
      };
    });

    const laneCount = laneEnds.length;

    return (
      <div
        className="calendar-week"
        key={`week-${weekIndex}`}
      >
        {week.map((currentDate, columnIndex) => {
          if (!currentDate) {
            return (
              <div
                className="empty-day"
                key={`empty-${weekIndex}-${columnIndex}`}
              />
            );
          }

          const day = currentDate.getDate();
          const key = dateKey(currentDate);
          const weekday = currentDate.getDay();

          // 여러 날짜에 걸친 일정은 아래 목록에서 제외
          // 막대 레이어에서만 표시한다.
          const daySchedules = schedules.filter((schedule) => {
            if (!occursOnDate(schedule, currentDate)) {
              return false;
            }

            const isMultiDay =

              (schedule.endDate || schedule.date) !==
                schedule.date;

            return !isMultiDay;
          });

          const holiday = holidays.find(
            (item) => item.date === key.replaceAll('-', ''),
          );

          return (
            <button
              key={key}
              className={[
                'calendar-day',
                key === today ? 'today' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => {
                if (!isWindowLocked) {
                  openDay(key);
                }
              }}
              onDoubleClick={() => {
                if (isWindowLocked) {
                  openDay(key);
                }
              }}
              aria-label={`${key} 일정 추가`}
            >
              <span className="day-heading">
                <span
                  className={[
                    'day-number',
                    holiday || weekday === 0 ? 'sun' : '',
                    !holiday && weekday === 6 ? 'sat' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {day}
                </span>

                {holiday && (
                  <span className="holiday-name">
                    {holiday.name}
                  </span>
                )}
              </span>

              <span
                className="event-list"
                style={{
                  marginTop: `${8 + laneCount * 23}px`,
                }}
              >
                {daySchedules.map((schedule) => {

                  const isCompleted = schedule.completed;

                  return (
                    <span
                      className="event-dot"
                      key={schedule.id}
                      style={{
                        backgroundColor: `${schedule.color}22`,
                        borderLeft: `3px solid ${schedule.color}`,
                        cursor: 'pointer',
                        textDecoration: isCompleted
                          ? 'line-through'
                          : 'none',
                        opacity: isCompleted ? 0.65 : 1,
                      }}
                      title={`${schedule.title} - 클릭해서 수정`}
                      onClick={(event) => {
                        event.stopPropagation();
                        openSchedule(schedule);
                      }}
                    >
                      <span
                        role="checkbox"
                        aria-checked={isCompleted}
                        aria-label={`${schedule.title} 완료`}
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation();
                          void toggleScheduleCompleted(schedule.id);
                        }}
                        onKeyDown={(event) => {
                          if (
                            event.key === 'Enter' ||
                            event.key === ' '
                          ) {
                            event.preventDefault();
                            event.stopPropagation();
                            void toggleScheduleCompleted(schedule.id);
                          }
                        }}
                        style={{
                          display: 'inline-block',
                          marginRight: '3px',
                          cursor: 'pointer',
                        }}
                      >
                        {isCompleted ? '☑' : '□'}
                      </span>

                      {schedule.title}
                    </span>
                  );
                })}
              </span>
            </button>
          );
        })}

        {/* 날짜 칸 위에 그리는 다중 날짜 일정 막대 */}
        <div className="week-bars">
          {bars.map((bar) => {
            const schedule = bar.schedule;
            const showTitle = bar.isStart || bar.startCol === 0;

            return (
              <button
                type="button"
                key={schedule.id}
                className={[
                  'multi-day-bar',
                  bar.isStart ? 'bar-start' : '',
                  bar.isEnd ? 'bar-end' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{
                  gridColumn: `${bar.startCol + 1} / ${bar.endCol + 2}`,
                  gridRow: bar.lane + 1,
                  backgroundColor: `${schedule.color}55`,
                  borderLeft: bar.isStart
                    ? `3px solid ${schedule.color}`
                    : 'none',
                  textDecoration: schedule.completed
                    ? 'line-through'
                    : 'none',
                  opacity: schedule.completed ? 0.65 : 1,
                }}
                title={`${schedule.title} - 클릭해서 수정`}
                onClick={(event) => {
                  event.stopPropagation();
                  openSchedule(schedule);
                }}
              >
                {showTitle && (
                  <>
                    {bar.isStart && (
                      <span
                        role="checkbox"
                        aria-checked={schedule.completed}
                        aria-label={`${schedule.title} 완료`}
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation();
                          void toggleScheduleCompleted(schedule.id);
                        }}
                        onKeyDown={(event) => {
                          if (
                            event.key === 'Enter' ||
                            event.key === ' '
                          ) {
                            event.preventDefault();
                            event.stopPropagation();
                            void toggleScheduleCompleted(schedule.id);
                          }
                        }}
                        style={{
                          display: 'inline-block',
                          marginRight: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        {schedule.completed ? '☑' : '□'}
                      </span>
                    )}

                    {schedule.title}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  })}
</div>
      </section>

      {selectedDate && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setSelectedDate('')}
        >
          <section
            className="event-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <h2 id="modal-title">
                  {editingId !== null ? title || '일정 수정' : '새 일정'}
                </h2>
              </div>

              <button
                className="close-btn"
                onClick={() => setSelectedDate('')}
                aria-label="닫기"
              >
                ×
              </button>
            </header>

            <label className="field">
              일정 이름
              <input
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="어떤 일정인가요?"
                maxLength={100}
              />
            </label>

            <div className="field-row">
                <label className="field">
  시작 날짜
  <input
    type="date"
    value={selectedDate}
    onChange={(event) => setSelectedDate(event.target.value)}
  />
</label>

<label className="field">
  마감 날짜
  <input
    type="date"
    value={endDate}
    min={selectedDate}
    onChange={(event) => setEndDate(event.target.value)}
  />
</label>

              <label className="field">
                마감 시간
                <input
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                />
              </label>
            </div>

            
            
<div className="field">
  일정 색상

  <div className="color-options">
    {allColors.map((item) => {
      const isCustom = customColors.some(
        (custom) => custom.value === item.value,
      );

      return (
        <button
          key={item.value}
          type="button"
          title={
            isCustom
              ? `${item.name} (더블클릭해서 삭제)`
              : item.name
          }
          aria-label={item.name}
          aria-pressed={color === item.value}
          className={`color-choice ${
            color === item.value ? 'active' : ''
          }`}
          style={{ backgroundColor: item.value }}
          onClick={() => setColor(item.value)}
          onDoubleClick={() => {
            if (isCustom) {
              removeCustomColor(item.value);
            }
          }}
        />
      );
    })}

   <button
    type="button"
    className="color-choice color-add-button"
    title="새 색상 추가"
    aria-label="새 색상 추가"
    onClick={() => {
    setPendingColor('#F4A261');
    setHexInput('F4A261');
    setShowColorPicker(true);
  }}
>
  <span className="color-add-plus">+</span>
</button>
  </div>

  
{showColorPicker && (
  <div className="color-picker-popup">
    <div className="color-popup-heading">
      <div>
        <strong>새 색상 추가</strong>
        <p>색상 코드로 원하는 색 추가</p>
      </div>
      <div
        className="color-preview"
        style={{ backgroundColor: pendingColor }}
      />
    </div>

    <label className="hex-label">
      HEX 색상 코드
      <div className="hex-input-wrap">
        <span>#</span>
        <input
          type="text"
          value={hexInput}
          maxLength={7}
          placeholder="F4A261"
          onChange={(event) => {
            const value = event.target.value
              .replace(/^#/, '')
              .replace(/[^0-9a-fA-F]/g, '')
              .slice(0, 6);

            setHexInput(value);

            if (/^[0-9a-fA-F]{6}$/.test(value)) {
              setPendingColor(`#${value.toUpperCase()}`);
            }
          }}
        />
      </div>
    </label>

    <div className="quick-colors">
      {[
        '#8DB8FF',
        '#8EDCC5',
        '#FFA6BB',
        '#F4D477',
        '#BBA3F5',
        '#F4A261',
      ].map((value) => (
        <button
          key={value}
          type="button"
          className="quick-color"
          title={value}
          aria-label={value}
          style={{ backgroundColor: value }}
          onClick={() => {
            setPendingColor(value);
            setHexInput(value.slice(1));
          }}
        />
      ))}
    </div>

    <div className="color-popup-actions">
      <button
        type="button"
        className="color-cancel-btn"
        onClick={() => setShowColorPicker(false)}
      >
        취소
      </button>

      <button
        type="button"
        className="color-confirm-btn"
        disabled={!/^#[0-9A-F]{6}$/.test(pendingColor)}
        onClick={() => {
          addCustomColor(pendingColor);
          setShowColorPicker(false);
        }}
      >
        추가하기
      </button>
    </div>
  </div>
)}

</div>



            <label className="field">
              알람
              <select
                value={alarm}
                onChange={(event) => setAlarm(event.target.value)}
              >
                <option>없음</option>
                <option>마감 시간에 알림</option>
                <option>10분 전</option>
                <option>1시간 전</option>
                <option>하루 전</option>
              </select>
            </label>



            <label className="field">
              메모
              <textarea
                value={memo}
                onChange={(event) => setMemo(event.target.value)}
                placeholder="메모를 입력하세요 (최대 200자)"
                maxLength={200}
                rows={3}
              />
            </label>

            <footer className="modal-actions">

              {editingId !== null && (
                    <button
                     type="button"
                      className="delete-btn"
                     onClick={deleteSchedule}
                    >
                     삭제
                      </button>
                  )}

              <button
                className="cancel-btn"
                onClick={() => setSelectedDate('')}
              >
                취소
              </button>

              <button
                className="save-btn"
                onClick={saveSchedule}
                disabled={!title.trim()}
              >
                저장
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}