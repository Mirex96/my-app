import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { questions } from '../../data/initialQuestions';
import Test from '../Test/Test';
import FlashCard from '../FlashCard/FlashCard';
import styles from './Errors.module.css';

const Errors = () => {
    const { state } = useAppContext();
    const [mode, setMode] = useState('list'); // 'list', 'test', 'flashcard'

    // Р’РѕРїСЂРѕСЃС‹ СЃ РѕС€РёР±РєР°РјРё (wrongCount > correctCount)
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
                <h2>вњ… РњРѕРё РѕС€РёР±РєРё</h2>
                <p>РЈ РІР°СЃ РЅРµС‚ РІРѕРїСЂРѕСЃРѕРІ СЃ РѕС€РёР±РєР°РјРё! РћС‚Р»РёС‡РЅРѕ!</p>
            </div>
        );
    }

    if (mode === 'test') {
        return (
            <div className={styles.container}>
                <button onClick={() => setMode('list')} className={styles.backBtn}>в†ђ РќР°Р·Р°Рґ Рє СЃРїРёСЃРєСѓ</button>
                <Test questions={errorQuestions} />
            </div>
        );
    }

    if (mode === 'flashcard') {
        return (
            <div className={styles.container}>
                <button onClick={() => setMode('list')} className={styles.backBtn}>в†ђ РќР°Р·Р°Рґ Рє СЃРїРёСЃРєСѓ</button>
                <FlashCard questions={errorQuestions} />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2>рџ“ќ РњРѕРё РѕС€РёР±РєРё</h2>
            <p>Р’СЃРµРіРѕ РІРѕРїСЂРѕСЃРѕРІ СЃ РѕС€РёР±РєР°РјРё: <strong>{totalErrors}</strong></p>
            <div className={styles.actions}>
                <button onClick={() => setMode('test')} className={styles.actionBtn}>РџСЂРѕР№С‚Рё РєР°Рє С‚РµСЃС‚</button>
                <button onClick={() => setMode('flashcard')} className={styles.actionBtn}>РџСЂРѕР№С‚Рё РєР°Рє РєР°СЂС‚РѕС‡РєРё</button>
            </div>
            <ul className={styles.list}>
                {errorQuestions.map((q, idx) => {
                    const stats = state.progress[q.id];
                    return (
                        <li key={q.id} className={styles.item}>
                            <span className={styles.num}>{idx + 1}.</span>
                            <span className={styles.questionText}>{q.question}</span>
                            <span className={styles.wrongBadge}>РћС€РёР±РѕРє: {stats.wrongCount}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default Errors;
