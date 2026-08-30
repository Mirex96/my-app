import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { questions } from '../../data/initialQuestions';
import Test from '../Test/Test';
import FlashCard from '../FlashCard/FlashCard';
import styles from './Errors.module.css';

const Errors = () => {
    const { state } = useAppContext();
    const [mode, setMode] = useState('list'); // 'list', 'test', 'flashcard'

    // Вопросы с ошибками (wrongCount > correctCount)
    const errorQuestions = useMemo(() => {
        return questions.filter(q => {
            const stats = state.progress[q.id];
            return stats && stats.wrongCount > stats.correctCount;
        });
    }, [state.progress]);

    const totalErrors = errorQuestions.length;

    if (totalErrors === 0) {
        return (
            <div className={styles.container}>
                <h2>✅ Мои ошибки</h2>
                <p>У вас нет вопросов с ошибками! Отлично!</p>
            </div>
        );
    }

    if (mode === 'test') {
        return (
            <div className={styles.container}>
                <button onClick={() => setMode('list')} className={styles.backBtn}>← Назад к списку</button>
                <Test questions={errorQuestions} />
            </div>
        );
    }

    if (mode === 'flashcard') {
        return (
            <div className={styles.container}>
                <button onClick={() => setMode('list')} className={styles.backBtn}>← Назад к списку</button>
                <FlashCard questions={errorQuestions} />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2>📝 Мои ошибки</h2>
            <p>Всего вопросов с ошибками: <strong>{totalErrors}</strong></p>
            <div className={styles.actions}>
                <button onClick={() => setMode('test')} className={styles.actionBtn}>Пройти как тест</button>
                <button onClick={() => setMode('flashcard')} className={styles.actionBtn}>Пройти как карточки</button>
            </div>
            <ul className={styles.list}>
                {errorQuestions.map((q, idx) => {
                    const stats = state.progress[q.id];
                    return (
                        <li key={q.id} className={styles.item}>
                            <span className={styles.num}>{idx + 1}.</span>
                            <span className={styles.questionText}>{q.question}</span>
                            <span className={styles.wrongBadge}>Ошибок: {stats.wrongCount}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default Errors;