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

    // Сортируем по сложности (прогресс)
    const sortedQuestions = useMemo(() => {
        const progress = state.progress || {};
        return [...filteredQuestions].sort((a, b) => {
            const aData = progress[a.id] || { correctCount: 0, wrongCount: 0 };
            const bData = progress[b.id] || { correctCount: 0, wrongCount: 0 };
            const aScore = (aData.wrongCount + 1) / (aData.correctCount + 1);
            const bScore = (bData.wrongCount + 1) / (bData.correctCount + 1);
            return bScore - aScore;
        });
    }, [filteredQuestions, state.progress]);

    const current = sortedQuestions[currentIndex];

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % sortedQuestions.length);
    };

    const resetProgress = () => {
        if (window.confirm('Сбросить всю статистику обучения?')) {
            dispatch({ type: 'RESET_PROGRESS' });
            setCurrentIndex(0);
            setIsFlipped(false);
        }
    };

    if (!sortedQuestions.length) {
        return <div>Нет вопросов по выбранной теме.</div>;
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
            <button onClick={handleNext} className={styles.nextBtn}>Следующая карточка</button>
            <p className={styles.counter}>{currentIndex + 1} / {sortedQuestions.length}</p>
            <button onClick={resetProgress} className={styles.resetBtn}>Сбросить прогресс</button>
        </div>
    );
};

export default FlashCard;