import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { questions } from '../../data/initialQuestions';
import styles from './CvoExam.module.css';

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const CvoExam = () => {
  const { state, dispatch } = useAppContext();
  const [ticketSize, setTicketSize] = useState(3);
  const [commissionSize, setCommissionSize] = useState(2);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [useTimer, setUseTimer] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30);

  const [stage, setStage] = useState('ticket');
  const [ticketQuestions, setTicketQuestions] = useState([]);
  const [commissionQuestions, setCommissionQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState({ ticket: 0, commission: 0 });
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
  const [timerStarted, setTimerStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);

  const topics = useMemo(() => {
    const set = new Set(questions.map(q => q.topic));
    return ['all', ...set];
  }, []);

  const generateTicket = () => {
    let pool = [...questions];
    if (selectedTopic !== 'all') {
      pool = pool.filter(q => q.topic === selectedTopic);
    }
    const shuffled = shuffleArray(pool);
    const selected = shuffled.slice(0, Math.min(ticketSize, shuffled.length));
    const processed = selected.map(q => {
      const correctAnswer = q.options[q.correct];
      const shuffledOptions = shuffleArray(q.options);
      const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);
      return { ...q, options: shuffledOptions, correct: newCorrectIndex };
    });
    setTicketQuestions(processed);
    setCurrentIndex(0);
    setAnswers(processed.map(() => ({ selected: null, correct: false })));
    setScore({ ticket: 0, commission: 0 });
    setStage('ticket');
    setExamFinished(false);
    setTimeLeft(timeLimit * 60);
    setTimerStarted(false);
  };

  const generateCommission = () => {
    const ticketIds = new Set(ticketQuestions.map(q => q.id));
    let pool = questions.filter(q => !ticketIds.has(q.id));
    if (selectedTopic !== 'all') {
      pool = pool.filter(q => q.topic === selectedTopic);
    }
    const shuffled = shuffleArray(pool);
    const selected = shuffled.slice(0, Math.min(commissionSize, shuffled.length));
    const processed = selected.map(q => {
      const correctAnswer = q.options[q.correct];
      const shuffledOptions = shuffleArray(q.options);
      const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);
      return { ...q, options: shuffledOptions, correct: newCorrectIndex };
    });
    setCommissionQuestions(processed);
    setCurrentIndex(0);
    setAnswers(processed.map(() => ({ selected: null, correct: false })));
    setStage('commission');
  };

  useEffect(() => {
    let timer;
    if (useTimer && timerStarted && !examFinished && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && useTimer && !examFinished) {
      setExamFinished(true);
      setStage('final');
    }
    return () => clearTimeout(timer);
  }, [useTimer, timerStarted, timeLeft, examFinished]);

  const handleOptionClick = (index) => {
    if (answers[currentIndex] && answers[currentIndex].selected !== null) return;
    if (!timerStarted && useTimer) setTimerStarted(true);
    const currentQuestions = stage === 'ticket' ? ticketQuestions : commissionQuestions;
    const current = currentQuestions[currentIndex];
    if (!current) return;
    const isCorrect = (index === current.correct);
    const newAnswers = [...answers];
    newAnswers[currentIndex] = { selected: index, correct: isCorrect };
    setAnswers(newAnswers);
    dispatch({
      type: 'UPDATE_PROGRESS',
      payload: { id: current.id, isCorrect, rating: isCorrect ? 4 : 2 }
    });
    if (stage === 'ticket') {
      setScore(prev => ({ ...prev, ticket: prev.ticket + (isCorrect ? 1 : 0) }));
    } else {
      setScore(prev => ({ ...prev, commission: prev.commission + (isCorrect ? 1 : 0) }));
    }
  };

  const goToNext = () => {
    const total = stage === 'ticket' ? ticketQuestions.length : commissionQuestions.length;
    if (currentIndex + 1 < total) {
      setCurrentIndex(prev => prev + 1);
    } else {
      if (stage === 'ticket') {
        setStage('ticketResults');
      } else if (stage === 'commission') {
        setStage('final');
        setExamFinished(true);
      }
    }
  };

  const startCommission = () => {
    generateCommission();
  };

  const resetExam = () => {
    generateTicket();
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (stage === 'ticket' && ticketQuestions.length === 0) {
    return (
      <div className={styles.container}>
        <h2>🎓 Экзамен в ЦВО</h2>
        <div className={styles.settings}>
          <div className={styles.setting}>
            <label>Вопросов в билете:</label>
            <select value={ticketSize} onChange={(e) => setTicketSize(Number(e.target.value))}>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </div>
          <div className={styles.setting}>
            <label>Вопросов от комиссии:</label>
            <select value={commissionSize} onChange={(e) => setCommissionSize(Number(e.target.value))}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>
          <div className={styles.setting}>
            <label>Тема:</label>
            <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value))}>
              {topics.map(t => (
                <option key={t} value={t}>{t === 'all' ? 'Все темы' : t}</option>
              ))}
            </select>
          </div>
          <div className={styles.setting}>
            <label>
              <input type="checkbox" checked={useTimer} onChange={(e) => setUseTimer(e.target.checked)} />
              Таймер ({timeLimit} мин)
            </label>
          </div>
          {useTimer && (
            <div className={styles.setting}>
              <label>Время (мин):</label>
              <input type="number" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} min={5} max={60} />
            </div>
          )}
        </div>
        <button onClick={generateTicket} className={styles.startBtn}>Начать экзамен</button>
      </div>
    );
  }

  if (stage === 'ticketResults') {
    const total = ticketQuestions.length;
    const correct = score.ticket;
    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <div className={styles.container}>
        <h2>📄 Результаты билета</h2>
        <div className={styles.resultStats}>
          <p>Правильных: {correct} из {total} ({percent}%)</p>
          <p>
            {percent === 100 && '✅ Отлично! Переходим к комиссии.'}
            {percent >= 70 && percent < 100 && '👍 Хорошо, но будьте внимательнее.'}
            {percent < 70 && '⚠️ Стоит повторить материал перед комиссией.'}
          </p>
        </div>
        <div className={styles.wrongList}>
          <h4>Детали:</h4>
          <ul>
            {ticketQuestions.map((q, idx) => {
              const ans = answers[idx];
              return (
                <li key={q.id}>
                  <strong>{q.question}</strong>
                  <div>Ваш ответ: {ans && q.options[ans.selected]}</div>
                  <div>Правильный ответ: {q.options[q.correct]}</div>
                  {!ans.correct && <div className={styles.explanation}>{q.explanation}</div>}
                </li>
              );
            })}
          </ul>
        </div>
        <button onClick={startCommission} className={styles.commissionBtn}>Перейти к комиссии →</button>
      </div>
    );
  }

  const currentQuestions = stage === 'ticket' ? ticketQuestions : commissionQuestions;
  const current = currentQuestions[currentIndex];
  const total = currentQuestions.length;
  const currentAnswer = answers[currentIndex];

  if (!current) {
    return <div>Ошибка: вопрос не найден</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.stageLabel}>
          {stage === 'ticket' ? '🎫 Билет' : '👨‍⚖️ Комиссия'}
        </div>
        {useTimer && (
          <div className={styles.timer}>⏱ {formatTime(timeLeft)}</div>
        )}
        <div className={styles.progress}>Вопрос {currentIndex + 1} из {total}</div>
      </div>

      <div className={styles.questionBlock}>
        <h3>{current.question}</h3>
        <div className={styles.options}>
          {current.options.map((opt, idx) => {
            let className = styles.option;
            if (currentAnswer && currentAnswer.selected !== null) {
              if (idx === current.correct) className += ' ' + styles.correct;
              else if (idx === currentAnswer.selected && idx !== current.correct) className += ' ' + styles.wrong;
              className += ' ' + styles.disabled;
            }
            return (
              <button
                key={idx}
                className={className}
                onClick={() => handleOptionClick(idx)}
                disabled={currentAnswer && currentAnswer.selected !== null}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {currentAnswer && currentAnswer.selected !== null && (
          <div className={styles.explanation}>
            <strong>{currentAnswer.correct ? '✅ Верно!' : '❌ Неверно!'}</strong>
            <p>{current.explanation}</p>
            <div className={styles.lawRef}>
              📚 Источник: {current.lawRef}
              {current.lawRef && (
                <span> (<a href={`https://yandex.ru/search/?text=${encodeURIComponent(current.lawRef)}`} target="_blank" rel="noopener noreferrer">открыть в Яндексе</a>)</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={styles.nav}>
        <button
          onClick={() => {
            if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
          }}
          disabled={currentIndex === 0}
          className={styles.navBtn}
        >
          ← Назад
        </button>
        {currentAnswer && currentAnswer.selected !== null && (
          <button onClick={goToNext} className={styles.navBtn}>
            {currentIndex === total - 1 ? 'Завершить этап →' : 'Далее →'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CvoExam;
