
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
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [color, setColor] = useState(colors[0].value);
  const [alarm, setAlarm] = useState('없음');
  const [repeat, setRepeat] = useState('반복 안 함');
  const [memo, setMemo] = useState('');

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

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
  };

  const saveSchedule = () => {
    if (!title.trim() || !selectedDate) return;

    setSchedules((current) => [
      ...current,
      {
        id: Date.now(),
        title: title.trim(),
        date: selectedDate,
        time,
        color,
        alarm,
        repeat,
        memo,
      },
    ]);

    setSelectedDate('');
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
          {['일', '월', '화', '수', '목', '금', '토'].map(
            (day, index) => (
              <div
                key={day}
                className={index === 0 ? 'sun' : index === 6 ? 'sat' : ''}
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
                <span
                  className={[
                    'day-number',
                    weekday === 0 ? 'sun' : '',
                    weekday === 6 ? 'sat' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {day}
                </span>

                <span className="event-list">
                  {daySchedules.map((schedule) => (
                    <span
                      className="event-dot"
                      key={schedule.id}
                      style={{
                        backgroundColor: `${schedule.color}22`,
                        borderLeft: `3px solid ${schedule.color}`,
                      }}
                      title={schedule.title}
                    >
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
                <h2 id="modal-title">새 일정</h2>
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
