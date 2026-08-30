import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import styles from './FlashCard.module.css';

const FlashCard = ({ questions }) => {
    const { state, dispatch } = useAppContext();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState('all');

    const topics = useMemo(() => {
        const set = new Set(questions.map(q => q.topic));
        return ['all', ...set];
    }, [questions]);

    const filteredQuestions = useMemo(() => {
        if (selectedTopic === 'all') return questions;
        return questions.filter(q => q.topic === selectedTopic);
    }, [questions, selectedTopic]);

    // SM-2 сортировка: сначала те, у которых дата следующего повторения раньше (просроченные)
    const sortedQuestions = useMemo(() => {
        const progress = state.progress || {};
        const now = Date.now();
        return [...filteredQuestions].sort((a, b) => {
            const aStats = progress[a.id] || { lastSeen: 0, interval: 1 };
            const bStats = progress[b.id] || { lastSeen: 0, interval: 1 };
            const aNext = aStats.lastSeen + aStats.interval * 24 * 60 * 60 * 1000;
            const bNext = bStats.lastSeen + bStats.interval * 24 * 60 * 60 * 1000;
            const aOverdue = aNext < now;
            const bOverdue = bNext < now;
            if (aOverdue && !bOverdue) return -1;
            if (!aOverdue && bOverdue) return 1;
            return aNext - bNext;
        });
    }, [filteredQuestions, state.progress]);

    const current = sortedQuestions[currentIndex];
    const total = sortedQuestions.length;

    const handleKnow = () => {
        const isCorrect = true;
        const rating = 5;
        dispatch({ type: 'UPDATE_PROGRESS', payload: { id: current.id, isCorrect, rating } });
        goToNext();
    };

    const handleDontKnow = () => {
        const isCorrect = false;
        const rating = 1;
        dispatch({ type: 'UPDATE_PROGRESS', payload: { id: current.id, isCorrect, rating } });
        goToNext();
    };

    const goToNext = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % total);
    };

    const goToPrev = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + total) % total);
    };

    const resetProgress = () => {
        if (window.confirm('Сбросить всю статистику обучения?')) {
            dispatch({ type: 'RESET_PROGRESS' });
            setCurrentIndex(0);
            setIsFlipped(false);
        }
    };

    if (!total) {
        return <div style={{ padding: '20px', color: '#000' }}>Нет вопросов по выбранной теме.</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.filter}>
                <label>Тема: </label>
                <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
                    {topics.map(topic => (
                        <option key={topic} value={topic}>
                            {topic === 'all' ? 'Все темы' : topic}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.card} onClick={() => setIsFlipped(!isFlipped)}>
                {!isFlipped ? (
                    <div className={styles.front}>
                        <p className={styles.question}>{current.question}</p>
                        <p className={styles.hint}>Нажмите, чтобы увидеть ответ</p>
                    </div>
                ) : (
                    <div className={styles.back}>
                        <p><strong>Правильный ответ:</strong> {current.options[current.correct]}</p>
                        <p className={styles.explanation}>{current.explanation}</p>
                        <p className={styles.lawRef}>📚 {current.lawRef}</p>
                    </div>
                )}
            </div>

            {isFlipped && (
                <div className={styles.buttons}>
                    <button onClick={handleDontKnow} className={styles.dontKnowBtn}>❌ Не знаю</button>
                    <button onClick={handleKnow} className={styles.knowBtn}>✅ Знаю</button>
                </div>
            )}

            <div className={styles.navigation}>
                <button onClick={goToPrev} className={styles.navBtn}>◀</button>
                <span className={styles.counter}>{currentIndex + 1} / {total}</span>
                <button onClick={goToNext} className={styles.navBtn}>▶</button>
            </div>

            <button onClick={resetProgress} className={styles.resetBtn}>Сбросить прогресс</button>
        </div>
    );
};

export default FlashCard;