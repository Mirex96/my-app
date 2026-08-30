import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import styles from './Test.module.css';

const Test = ({ questions }) => {
    const { state, dispatch } = useAppContext();
    const [selectedTopic, setSelectedTopic] = useState('all');
    const [questionCount, setQuestionCount] = useState(10);
    const [mode, setMode] = useState('all');
    const [useTimer, setUseTimer] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selected, setSelected] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [testQuestions, setTestQuestions] = useState([]);
    const [timerStarted, setTimerStarted] = useState(false);

    const topics = useMemo(() => {
        const set = new Set(questions.map(q => q.topic));
        return ['all', ...set];
    }, [questions]);

    const filteredQuestions = useMemo(() => {
        let filtered = questions;
        if (selectedTopic !== 'all') {
            filtered = filtered.filter(q => q.topic === selectedTopic);
        }
        if (mode === 'wrong') {
            filtered = filtered.filter(q => {
                const stats = state.progress[q.id];
                return stats && stats.wrongCount > stats.correctCount;
            });
        }
        if (mode === 'review') {
            const now = Date.now();
            filtered = filtered.filter(q => {
                const stats = state.progress[q.id];
                if (!stats) return true;
                const daysSince = (now - stats.lastSeen) / (1000 * 60 * 60 * 24);
                return daysSince >= stats.interval;
            });
        }
        return filtered;
    }, [questions, selectedTopic, mode, state.progress]);

    const generateTest = () => {
        let pool = [...filteredQuestions];
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        let selected;
        if (questionCount === 0) {
            selected = pool;
        } else {
            selected = pool.slice(0, Math.min(questionCount, pool.length));
        }
        setTestQuestions(selected);
        setCurrentIndex(0);
        setScore(0);
        setIsFinished(false);
        setSelected(null);
        setShowExplanation(false);
        setTimeLeft(300);
        setTimerStarted(false);
    };

    useEffect(() => {
        generateTest();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTopic, mode, questionCount]);

    useEffect(() => {
        let timer;
        if (useTimer && timerStarted && !isFinished && timeLeft > 0) {
            timer = setTimeout(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && useTimer && !isFinished) {
            setIsFinished(true);
        }
        return () => clearTimeout(timer);
    }, [useTimer, timerStarted, timeLeft, isFinished]);

    const current = testQuestions[currentIndex];
    const total = testQuestions.length;

    const handleOptionClick = (index) => {
        if (selected !== null || !current) return;
        if (!timerStarted && useTimer) setTimerStarted(true);
        setSelected(index);
        const isCorrect = (index === current.correct);
        if (isCorrect) setScore(prev => prev + 1);
        setShowExplanation(true);
        dispatch({ type: 'UPDATE_PROGRESS', payload: { id: current.id, isCorrect } });

        setTimeout(() => {
            setShowExplanation(false);
            setSelected(null);
            if (currentIndex + 1 < total) {
                setCurrentIndex(prev => prev + 1);
            } else {
                setIsFinished(true);
            }
        }, 4000);
    };

    const resetTest = () => {
        generateTest();
    };

    if (!total) {
        return <div style={{ padding: '20px', color: '#000' }}>РќРµС‚ РІРѕРїСЂРѕСЃРѕРІ РїРѕ РІС‹Р±СЂР°РЅРЅС‹Рј РєСЂРёС‚РµСЂРёСЏРј.</div>;
    }

    if (isFinished) {
        const percent = Math.round((score / total) * 100);
        return (
            <div className={styles.result}>
                <h2>рџЏЃ {timeLeft === 0 && useTimer ? 'Р’СЂРµРјСЏ РІС‹С€Р»Рѕ!' : 'Р­РєР·Р°РјРµРЅ Р·Р°РІРµСЂС€С‘РЅ!'}</h2>
                <p>Р’Р°С€ СЂРµР·СѓР»СЊС‚Р°С‚: {score} РёР· {total} ({percent}%)</p>
                <p>
                    {percent === 100 && 'рџЏ† РћС‚Р»РёС‡РЅРѕ! Р’С‹ РіРѕС‚РѕРІС‹ Рє СЂРµР°Р»СЊРЅРѕР№ СЂР°Р±РѕС‚Рµ!'}
                    {percent >= 80 && percent < 100 && 'рџ‘Ќ РҐРѕСЂРѕС€Рѕ, РЅРѕ РµСЃС‚СЊ РїСЂРѕР±РµР»С‹, РїРѕРІС‚РѕСЂРёС‚Рµ СЃР»РѕР¶РЅС‹Рµ С‚РµРјС‹.'}
                    {percent < 80 && 'рџ“– РќСѓР¶РЅРѕ СЃРµСЂСЊС‘Р·РЅРѕ РїРѕРІС‚РѕСЂРёС‚СЊ РјР°С‚РµСЂРёР°Р».'}
                </p>
                <button onClick={resetTest} className={styles.nextBtn}>РџСЂРѕР№С‚Рё Р·Р°РЅРѕРІРѕ</button>
            </div>
        );
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    return (
        <div className={styles.testContainer}>
            <div className={styles.filterRow}>
                <div className={styles.filterGroup}>
                    <label>РўРµРјР°: </label>
                    <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
                        {topics.map(topic => (
                            <option key={topic} value={topic}>
                                {topic === 'all' ? 'Р’СЃРµ С‚РµРјС‹' : topic}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.filterGroup}>
                    <label>РљРѕР»-РІРѕ: </label>
                    <select value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={0}>Р’СЃРµ</option>
                    </select>
                </div>
                <div className={styles.filterGroup}>
                    <label>Р РµР¶РёРј: </label>
                    <select value={mode} onChange={(e) => setMode(e.target.value)}>
                        <option value="all">Р’СЃРµ</option>
                        <option value="wrong">РћС€РёР±РєРё</option>
                        <option value="review">РџРѕРІС‚РѕСЂРµРЅРёРµ</option>
                    </select>
                </div>
                <div className={styles.filterGroup}>
                    <label>
                        <input type="checkbox" checked={useTimer} onChange={(e) => setUseTimer(e.target.checked)} />
                        РўР°Р№РјРµСЂ (5 РјРёРЅ)
                    </label>
                </div>
            </div>

            {useTimer && (
                <div style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', color: timeLeft < 60 ? '#dc3545' : '#000' }}>
                    вЏ± {timeStr}
                </div>
            )}

            <div className={styles.header}>
                <span>Р’РѕРїСЂРѕСЃ {currentIndex + 1} РёР· {total}</span>
                <span>вњ… {score}</span>
            </div>

            <h3 className={styles.question}>{current.question}</h3>
            <div className={styles.options}>
                {current.options.map((opt, idx) => {
                    let className = styles.option;
                    if (selected !== null) {
                        if (idx === current.correct) className += ' ' + styles.correct;
                        else if (idx === selected && idx !== current.correct) className += ' ' + styles.wrong;
                        className += ' ' + styles.disabled;
                    }
                    return (
                        <button
                            key={idx}
                            className={className}
                            onClick={() => handleOptionClick(idx)}
                            disabled={selected !== null}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>
            {showExplanation && (
                <div className={styles.explanation}>
                    <strong>{selected === current.correct ? 'вњ… Р’РµСЂРЅРѕ!' : 'вќЊ РќРµРІРµСЂРЅРѕ!'}</strong>
                    <p>{current.explanation}</p>
                    <p className={styles.lawRef}>рџ“љ РСЃС‚РѕС‡РЅРёРє: {current.lawRef} {current.lawRef && (<span> (<a href={`https://yandex.ru/search/?text=${encodeURIComponent(current.lawRef)}`} target="_blank" rel="noopener noreferrer">открыть в Яндексе</a>)</span>)} {current.lawRef && (<span> (<a href={`https://yandex.ru/search/?text=${encodeURIComponent(current.lawRef)}`} target="_blank" rel="noopener noreferrer">открыть в Яндексе</a>)</span>)} {current.lawRef && (<span> (<a href={`https://yandex.ru/search/?text=${encodeURIComponent(current.lawRef)}`} target="_blank" rel="noopener noreferrer">открыть в Яндексе</a>)</span>)} {current.lawRef && (<span> (<a href={`https://yandex.ru/search/?text=${encodeURIComponent(current.lawRef)}`} target="_blank" rel="noopener noreferrer">открыть в Яндексе</a>)</span>)} {current.lawRef && (<span> (<a href={`https://yandex.ru/search/?text=${encodeURIComponent(current.lawRef)}`} target="_blank" rel="noopener noreferrer">открыть в Яндексе</a>)</span>)}</p>
                </div>
            )}
        </div>
    );
};

export default Test;




