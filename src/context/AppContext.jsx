import React, { createContext, useContext, useReducer } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AppContext = createContext();

const initialState = {
    progress: {},
    daily: { date: null, count: 0 },
};

function appReducer(state, action) {
    switch (action.type) {
        case 'UPDATE_PROGRESS': {
            const { id, isCorrect, rating } = action.payload; // rating для SM-2 (1-5)
            const prev = state.progress[id] || {
                correctCount: 0,
                wrongCount: 0,
                lastSeen: Date.now(),
                interval: 1,
                easinessFactor: 2.5,
                repetitions: 0,
            };

            const today = new Date().toDateString();
            let daily = { ...state.daily };
            if (daily.date !== today) {
                daily = { date: today, count: 0 };
            }
            daily.count += 1;

            // Обновляем для SM-2
            let { easinessFactor, interval, repetitions } = prev;
            if (isCorrect) {
                // Если ответ правильный, обновляем по SM-2
                // rating: 5 – легко, 4 – нормально, 3 – сложно, 2 – очень сложно, 1 – забыл
                // Используем rating для корректировки easinessFactor
                if (rating) {
                    // rating 4 и 5 – повышаем лёгкость
                    // rating 3 – оставляем как есть
                    // rating 1 и 2 – понижаем
                    easinessFactor += (0.1 - (5 - rating) * 0.08);
                    if (easinessFactor < 1.3) easinessFactor = 1.3;
                } else {
                    // Если rating не передан, считаем, что ответ лёгкий (rating=4)
                    easinessFactor += 0.1;
                }
                repetitions += 1;
                // Пересчитываем интервал
                if (repetitions === 1) {
                    interval = 1;
                } else if (repetitions === 2) {
                    interval = 6;
                } else {
                    interval = Math.round(interval * easinessFactor);
                }
            } else {
                // Неправильный ответ: сбрасываем повторения, интервал = 1, понижаем лёгкость
                repetitions = 0;
                interval = 1;
                easinessFactor = Math.max(1.3, easinessFactor - 0.2);
            }

            // Ограничиваем интервал до 30 дней (можно больше, но для учебных целей)
            if (interval > 30) interval = 30;

            return {
                ...state,
                progress: {
                    ...state.progress,
                    [id]: {
                        ...prev,
                        correctCount: prev.correctCount + (isCorrect ? 1 : 0),
                        wrongCount: prev.wrongCount + (isCorrect ? 0 : 1),
                        lastSeen: Date.now(),
                        interval,
                        easinessFactor,
                        repetitions,
                    }
                },
                daily,
            };
        }
        case 'SET_PROGRESS': {
            // Для импорта прогресса
            return { ...state, progress: action.payload.progress, daily: action.payload.daily };
        }
        case 'RESET_PROGRESS':
            return { ...state, progress: {}, daily: { date: null, count: 0 } };
        default:
            return state;
    }
}

export function AppProvider({ children }) {
    const [storedState, setStoredState] = useLocalStorage('appProgress', initialState);
    const [state, dispatch] = useReducer(appReducer, storedState);

    React.useEffect(() => {
        setStoredState(state);
    }, [state, setStoredState]);

    const getQuestionStats = (questionId) => {
        return state.progress[questionId] || { correctCount: 0, wrongCount: 0, lastSeen: 0, interval: 1, easinessFactor: 2.5, repetitions: 0 };
    };

    const getQuestionsByDifficulty = (questions, minWrong = 0) => {
        return questions.filter(q => {
            const stats = getQuestionStats(q.id);
            return stats.wrongCount >= minWrong;
        });
    };

    const getQuestionsForReview = (questions, daysThreshold = 7) => {
        const now = Date.now();
        return questions.filter(q => {
            const stats = getQuestionStats(q.id);
            if (stats.lastSeen === 0) return true;
            const daysSince = (now - stats.lastSeen) / (1000 * 60 * 60 * 24);
            return daysSince >= stats.interval;
        });
    };

    const getQuestionsWithErrors = (questions) => {
        return questions.filter(q => {
            const stats = getQuestionStats(q.id);
            return stats.wrongCount > stats.correctCount;
        });
    };

    return (
        <AppContext.Provider value={{
            state,
            dispatch,
            getQuestionStats,
            getQuestionsByDifficulty,
            getQuestionsForReview,
            getQuestionsWithErrors,
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}