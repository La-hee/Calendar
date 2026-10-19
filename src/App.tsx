import { useEffect, useState } from 'react';

type Schedule = {
  id: number;
  title: string;
  date: string;
  time: string;
  color: string;
  alarm: string;
  repeat: string;
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

export default function App() {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [color, setColor] = useState(colors[0].value);
  const [alarm, setAlarm] = useState('없음');
  const [repeat, setRepeat] = useState('반복 안 함');
  const [memo, setMemo] = useState('');

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  useEffect(() => {
  window.scheduleAPI
    .getAll()
    .then((rows) => {
      setSchedules(
        rows.map((row) => ({
          ...row,
          alarm: String(row.alarm ?? '없음'),
          repeat: String(row.repeat ?? '반복 안 함'),
          completed: Boolean(row.completed),
        })),
      );
    })
    .catch((error) => {
      console.error('일정 불러오기 실패:', error);
    });
}, []);


  useEffect(() => {
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
}, [year, month]);

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
    setTitle('');
    setTime('09:00');
    setColor(colors[0].value);
    setAlarm('없음');
    setRepeat('반복 안 함');
    setMemo('');
    setEditingId(null);
  };
const openSchedule = (schedule: Schedule) => {
  setSelectedDate(schedule.date);
  setEditingId(schedule.id);
  setTitle(schedule.title);
  setTime(schedule.time);
  setColor(schedule.color);
  setAlarm(schedule.alarm);
  setRepeat(schedule.repeat);
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
    time,
    color,
    alarm,
    repeat,
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


  return (
    <main className="app">
      <header className="calendar-header">
        <button
          className="nav-btn"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          aria-label="이전 달"
        >
          ‹
        </button>

        <div className="today-info">
          <strong className="today-date"> <span className="today-prefix">오늘은</span>
            {year}.{month+1}.{now.getDate()} 
            <span className = "today-weekday"> {todayWeekday} </span></strong>
        </div>

        <div className="month-title">
          <span className ="month-year">{year}년</span>
          <strong className="month-number">{month+1}월</strong>
        </div>

        <button
          className="nav-btn"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          aria-label="다음 달"
        >
          ›
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
          {Array.from({ length: firstDay }, (_, i) => (
            <div className="empty-day" key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const currentDate = new Date(year, month, day);
            const key = dateKey(currentDate);
            const daySchedules = schedules.filter(
              (schedule) => schedule.date === key,
            );

            const weekday = currentDate.getDay();

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
                onClick={() => openDay(key)}
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


                <span className="event-list">
                 
              {daySchedules.map((schedule) => (
               <span
                 className="event-dot"
                  key={schedule.id}
                  style={{
                   backgroundColor: `${schedule.color}22`,
                   borderLeft: `3px solid ${schedule.color}`,
                   cursor: 'pointer',
                   textDecoration: schedule.completed ? 'line-through' : 'none',
                   opacity: schedule.completed ? 0.65 : 1,
                  }}
                  title={`${schedule.title} - 클릭해서 수정`}
                  onClick={(event) => {
                    event.stopPropagation();
                    openSchedule(schedule);
                  }}
  >
                  <span
                   role="checkbox"
                    aria-checked={schedule.completed}
                   aria-label={`${schedule.title} 완료`}
                   tabIndex={0}
                    onClick={(event) => {
                     event.stopPropagation();
                     toggleScheduleCompleted(schedule.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                       event.preventDefault();
                        event.stopPropagation();
                        toggleScheduleCompleted(schedule.id);
                     }
                    }}
                   style={{
                     display: 'inline-block',
                     marginRight: '3px',
                     cursor: 'pointer',
                    }}
    >
                    {schedule.completed ? '☑' : '□'}
                 </span>
                 {schedule.title}
                </span>
              ))}

                </span>
              </button>
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
                  {editingId !== null ? '일정 수정' : '새 일정'}
                </h2>
                <p>{selectedDate}</p>
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
                마감 날짜
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
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
                {colors.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    title={item.name}
                    aria-label={item.name}
                    aria-pressed={color === item.value}
                    className={`color-choice ${
                      color === item.value ? 'active' : ''
                    }`}
                    style={{ backgroundColor: item.value }}
                    onClick={() => setColor(item.value)}
                  />
                ))}
              </div>
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
              반복 주기
              <select
                value={repeat}
                onChange={(event) => setRepeat(event.target.value)}
              >
                <option>반복 안 함</option>
                <option>매일</option>
                <option>매주</option>
                <option>매월</option>
                <option>매년</option>
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