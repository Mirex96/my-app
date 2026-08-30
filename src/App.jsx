import React, { useState, useEffect } from 'react';
import { questions } from './data/initialQuestions';
import Test from './components/Test/Test';
import FlashCard from './components/FlashCard/FlashCard';
import Progress from './components/Progress/Progress';
import Reference from './components/Reference/Reference';
import Errors from './components/Errors/Errors';
import Exam from './components/Exam/Exam';
import './index.css';

function App() {
  const [currentMode, setCurrentMode] = useState('test');
  const [CvoExamComponent, setCvoExamComponent] = useState(null);

  // Динамически загружаем ЦВО
  useEffect(() => {
    import('./components/CvoExam/CvoExam.jsx').then(module => {
      setCvoExamComponent(() => module.default);
    });
  }, []);

  const CvoExam = CvoExamComponent || (() => <div>Загрузка...</div>);

  return (
    <div className="app" style={{ background: '#f0f2f5', minHeight: '100vh', color: '#000' }}>
      <header style={{ padding: '20px', background: '#1a3c5e', color: 'white', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>⚖️ Тренажёр помощника военного прокурора</h1>
        <nav style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginLeft: 'auto' }}>
          <button onClick={() => setCurrentMode('test')}>Тест</button>
          <button onClick={() => setCurrentMode('flashcard')}>Карточки</button>
          <button onClick={() => setCurrentMode('exam')}>Экзамен</button>
          <button onClick={() => setCurrentMode('cvoexam')}>ЦВО</button>
          <button onClick={() => setCurrentMode('errors')}>Ошибки</button>
          <button onClick={() => setCurrentMode('progress')}>Прогресс</button>
          <button onClick={() => setCurrentMode('reference')}>Справочник</button>
        </nav>
      </header>
      <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        {currentMode === 'test' && <Test questions={questions} />}
        {currentMode === 'flashcard' && <FlashCard questions={questions} />}
        {currentMode === 'exam' && <Exam />}
        {currentMode === 'cvoexam' && <CvoExam />}
        {currentMode === 'errors' && <Errors />}
        {currentMode === 'progress' && <Progress />}
        {currentMode === 'reference' && <Reference />}
      </main>
    </div>
  );
}

export default App;
