import React, { useState } from 'react';
import { questions } from './data/initialQuestions';
import Test from './components/Test/Test';
import FlashCard from './components/FlashCard/FlashCard';
import Progress from './components/Progress/Progress';
import Reference from './components/Reference/Reference';
import Errors from './components/Errors/Errors';
import Exam from './components/Exam/Exam';
import CvoExam from './components/CvoExam/CvoExam';
import './index.css';

function App() {
  const [currentMode, setCurrentMode] = useState('test');

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
        <div style={{ display: currentMode === 'test' ? 'block' : 'none' }}>
          <Test questions={questions} />
        </div>
        <div style={{ display: currentMode === 'flashcard' ? 'block' : 'none' }}>
          <FlashCard questions={questions} />
        </div>
        <div style={{ display: currentMode === 'exam' ? 'block' : 'none' }}>
          <Exam />
        </div>
        <div style={{ display: currentMode === 'cvoexam' ? 'block' : 'none' }}>
          <CvoExam />
        </div>
        <div style={{ display: currentMode === 'errors' ? 'block' : 'none' }}>
          <Errors />
        </div>
        <div style={{ display: currentMode === 'progress' ? 'block' : 'none' }}>
          <Progress />
        </div>
        <div style={{ display: currentMode === 'reference' ? 'block' : 'none' }}>
          <Reference />
        </div>
      </main>
    </div>
  );
}

export default App;
