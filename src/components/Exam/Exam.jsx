import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { questions } from '../../data/initialQuestions';
import styles from './Exam.module.css';

const Exam = () => {
    const { state, dispatch } = useAppContext();
    const [questionCount, setQuestionCount] = useState(50);
    const [selectedTopic, setSelectedTopic] = useState('all');
    const [timeLimit, setTimeLimit] = useState(90); // минут

    const [examQuestions, setExamQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]); // массив с ответами: { selected, correct }
    const [examFinished, setExamFinished] = useState(false);
    const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
    const [timerStarted, setTimerStarted] = useState(false);

    const topics = useMemo(() => {
        const set = new Set(questions.map(q => q.topic));
        return ['all', ...set];
    }, []);

    // Подготовка вопросов
    const startExam = () => {
        let pool = [...questions];
        if (selectedTopic !== 'all') {
            pool = pool.filter(q => q.topic === selectedTopic);
        }
        // Перемешиваем
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        const selected = pool.slice(0, Math.min(questionCount, pool.length));
        setExamQuestions(selected);
        setCurrentIndex(0);
        setAnswers(selected.map(() => ({ selected: null, correct: false })));
        setExamFinished(false);
        setTimeLeft(timeLimit * 60);
        setTimerStarted(true);
    };

    // Таймер
    useEffect(() => {
        let timer;
        if (timerStarted && !examFinished && timeLeft > 0) {
            timer = setTimeout(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && timerStarted && !examFinished) {
            setExamFinished(true);
        }
        return () => clearTimeout(timer);
    }, [timerStarted, examFinished, timeLeft]);

    const handleOptionClick = (index) => {
        if (answers[currentIndex] && answers[currentIndex].selected !== null) return;
        const isCorrect = (index === examQuestions[currentIndex].correct);
        const newAnswers = [...answers];
        newAnswers[currentIndex] = { selected: index, correct: isCorrect };
        setAnswers(newAnswers);

        // Обновляем прогресс (без рейтинга, для экзамена)
        dispatch({ type: 'UPDATE_PROGRESS', payload: { id: examQuestions[currentIndex].id, isCorrect, rating: isCorrect ? 4 : 2 } });
    };

    const goNext = () => {
        if (currentIndex < examQuestions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setExamFinished(true);
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // Результаты
    if (examFinished) {
        const total = examQuestions.length;
        const correctCount = answers.filter(a => a.correct).length;
        const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
        const wrongQuestions = examQuestions.filter((q, idx) => !answers[idx].correct);

        return (
            <div className={styles.container}>
                <h2>🏁 Экзамен завершён!</h2>
                <div className={styles.resultStats}>
                    <p>Правильных: {correctCount} из {total} ({percent}%)</p>
                    <p>
                        {percent === 100 && '🏆 Отлично! Вы готовы!'}
                        {percent >= 80 && percent < 100 && '👍 Хорошо, но есть пробелы.'}
                        {percent < 80 && '📖 Нужно серьёзно повторить материал.'}
                    </p>
                </div>
                {wrongQuestions.length > 0 && (
                    <div className={styles.wrongList}>
                        <h3>❌ Ошибки:</h3>
                        <ul>
                            {wrongQuestions.map((q, idx) => (
                                <li key={q.id}>
                                    <strong>{q.question}</strong>
                                    <div>Правильный ответ: {q.options[q.correct]}</div>
                                    <div className={styles.explanation}>{q.explanation}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <button onClick={() => setExamFinished(false)} className={styles.retryBtn}>Пройти заново</button>
            </div>
        );
    }

    if (examQuestions.length === 0) {
        return (
            <div className={styles.container}>
                <h2>📝 Режим экзамена</h2>
                <div className={styles.settings}>
                    <div className={styles.setting}>
                        <label>Количество вопросов:</label>
                        <select value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))}>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={0}>Все</option>
                        </select>
                    </div>
                    <div className={styles.setting}>
                        <label>Тема:</label>
                        <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
                            {topics.map(t => (
                                <option key={t} value={t}>{t === 'all' ? 'Все темы' : t}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.setting}>
                        <label>Время (минут):</label>
                        <input type="number" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} min={10} max={180} />
                    </div>
                </div>
                <button onClick={startExam} className={styles.startBtn}>Начать экзамен</button>
            </div>
        );
    }

    const current = examQuestions[currentIndex];
    const currentAnswer = answers[currentIndex];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.timer}>⏱ {formatTime(timeLeft)}</div>
                <div className={styles.progress}>Вопрос {currentIndex + 1} из {examQuestions.length}</div>
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
                    </div>
                )}
            </div>
            <div className={styles.nav}>
                <button onClick={goPrev} disabled={currentIndex === 0} className={styles.navBtn}>← Назад</button>
                <button onClick={goNext} className={styles.navBtn}>
                    {currentIndex === examQuestions.length - 1 ? 'Завершить' : 'Далее →'}
                </button>
            </div>
        </div>
    );
};

export default Exam;