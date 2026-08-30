import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { questions } from '../../data/initialQuestions';

const Progress = () => {
    const { state } = useAppContext();
    const progress = state.progress || {};
    const daily = state.daily || { date: null, count: 0 };
    const today = new Date().toDateString();

    const total = questions.length;
    const answered = Object.keys(progress).length;
    const correctTotal = Object.values(progress).filter(p => p.correctCount > p.wrongCount).length;

    const dailyGoal = 20;
    const dailyProgress = daily.date === today ? daily.count : 0;
    const dailyPercent = Math.min(100, Math.round((dailyProgress / dailyGoal) * 100));

    const topicsStats = useMemo(() => {
        const topics = {};
        questions.forEach(q => {
            const topic = q.topic || 'Общее';
            if (!topics[topic]) {
                topics[topic] = { total: 0, correct: 0, wrong: 0, skipped: 0 };
            }
            topics[topic].total += 1;
            const stats = progress[q.id];
            if (stats) {
                if (stats.correctCount > stats.wrongCount) topics[topic].correct += 1;
                else if (stats.wrongCount > stats.correctCount) topics[topic].wrong += 1;
                else topics[topic].skipped += 1;
            } else {
                topics[topic].skipped += 1;
            }
        });
        return topics;
    }, [questions, progress]);

    const weakTopics = useMemo(() => {
        const result = [];
        for (const [topic, data] of Object.entries(topicsStats)) {
            const percent = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
            if (percent < 60 && data.total > 0) {
                result.push({ topic, percent, total: data.total });
            }
        }
        return result.sort((a, b) => a.percent - b.percent);
    }, [topicsStats]);

    const overallPercent = total > 0 ? Math.round((answered / total) * 100) : 0;

    const exportErrors = () => {
        const errors = questions.filter(q => {
            const stats = progress[q.id];
            return stats && stats.wrongCount > stats.correctCount;
        });
        if (errors.length === 0) {
            alert('У вас нет вопросов с ошибками! Поздравляем!');
            return;
        }
        let text = '=== ВОПРОСЫ, В КОТОРЫХ БЫЛИ ОШИБКИ ===\n\n';
        errors.forEach((q, i) => {
            text += `${i + 1}. ${q.question}\n`;
            text += `Правильный ответ: ${q.options[q.correct]}\n`;
            text += `Пояснение: ${q.explanation}\n`;
            text += `Источник: ${q.lawRef}\n\n`;
        });
        text += `Всего вопросов с ошибками: ${errors.length}\n`;
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'ошибки_для_повторения.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    return (
        <div style={{ padding: '20px', color: '#000' }}>
            <h2>📊 Статистика обучения</h2>

            <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3>🎯 Ежедневная цель: {dailyGoal} вопросов</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <progress value={dailyProgress} max={dailyGoal} style={{ width: '60%', height: '20px' }} />
                    <span>{dailyProgress} / {dailyGoal} ({dailyPercent}%)</span>
                </div>
                {dailyProgress >= dailyGoal && <p style={{ color: '#28a745' }}>✅ Цель выполнена! Отлично!</p>}
                {dailyProgress < dailyGoal && daily.date === today && (
                    <p>Осталось {dailyGoal - dailyProgress} вопросов на сегодня</p>
                )}
                {daily.date !== today && <p>Сегодня вы ещё не проходили вопросы. Начните сейчас!</p>}
            </div>

            <ul style={{ listStyle: 'none', padding: 0 }}>
                <li>Всего вопросов: {total}</li>
                <li>Пройдено вопросов: {answered}</li>
                <li>Правильных ответов (всего): {correctTotal}</li>
                <li>Прогресс: {overallPercent}%</li>
                <li>
                    <progress value={answered} max={total} style={{ width: '100%', height: '20px' }} />
                </li>
            </ul>

            <h3>📈 Успеваемость по темам</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(topicsStats).map(([topic, data]) => {
                    const percent = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                    const color = percent >= 80 ? '#28a745' : percent >= 50 ? '#ffc107' : '#dc3545';
                    return (
                        <div key={topic}>
                            <span>{topic}: {percent}% ({data.correct}/{data.total})</span>
                            <div style={{ background: '#ddd', height: '8px', borderRadius: '4px', marginTop: '4px' }}>
                                <div style={{ width: `${percent}%`, background: color, height: '8px', borderRadius: '4px' }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {weakTopics.length > 0 && (
                <div style={{ marginTop: '20px', padding: '16px', background: '#fff3cd', borderLeft: '5px solid #ffc107' }}>
                    <h4>⚠️ Рекомендации к повторению</h4>
                    <p>Эти темы требуют дополнительного внимания (менее 60% правильных ответов):</p>
                    <ul>
                        {weakTopics.map(({ topic, percent, total }) => (
                            <li key={topic}>{topic} – {percent}% ({total} вопросов)</li>
                        ))}
                    </ul>
                </div>
            )}

            <button onClick={exportErrors} style={{ marginTop: '20px', padding: '10px 20px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                ⬇️ Скачать список ошибок
            </button>
        </div>
    );
};

export default Progress;