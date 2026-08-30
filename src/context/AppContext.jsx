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
            const { id, isCorrect } = action.payload;
            const prev = state.progress[id] || { correctCount: 0, wrongCount: 0, lastSeen: Date.now(), interval: 1 };

            const today = new Date().toDateString();
            let daily = { ...state.daily };
            if (daily.date !== today) {
                daily = { date: today, count: 0 };
            }
            daily.count += 1;

            return {
                ...state,
                progress: {
                    ...state.progress,
                    [id]: {
                        ...prev,
                        correctCount: prev.correctCount + (isCorrect ? 1 : 0),
                        wrongCount: prev.wrongCount + (isCorrect ? 0 : 1),
                        lastSeen: Date.now(),
                        interval: isCorrect ? Math.min(prev.interval * 2, 30) : 1,
                    }
                },
                daily,
            };
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
        return state.progress[questionId] || { correctCount: 0, wrongCount: 0, lastSeen: 0, interval: 1 };
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

    return (
        <AppContext.Provider value={{ state, dispatch, getQuestionStats, getQuestionsByDifficulty, getQuestionsForReview }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}