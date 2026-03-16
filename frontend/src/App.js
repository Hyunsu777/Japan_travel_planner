import React, { useState } from 'react';
import TravelForm from './components/TravelForm';
import ItineraryResult from './components/ItineraryResult';
import LoadingScreen from './components/LoadingScreen';
import './styles/App.css';

function App() {
  const [step, setStep] = useState('form'); // 'form' | 'loading' | 'result'
  const [itineraryData, setItineraryData] = useState(null);
  const [streamText, setStreamText] = useState('');
  const [formData, setFormData] = useState(null);

  const handleSubmit = async (data) => {
    setFormData(data);
    setStep('loading');
    setStreamText('');
    setItineraryData(null);

    try {
      const response = await fetch('/api/itinerary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || '서버 오류');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.type === 'chunk') {
                setStreamText(prev => prev + parsed.content);
              } else if (parsed.type === 'done') {
                setItineraryData(parsed.data);
                setStep('result');
              } else if (parsed.type === 'error') {
                throw new Error(parsed.message);
              }
            } catch (e) {
              // ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      alert('일정 생성 중 오류가 발생했습니다: ' + error.message);
      setStep('form');
    }
  };

  const handleReset = () => {
    setStep('form');
    setItineraryData(null);
    setStreamText('');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-jp">旅</span>
            <div className="logo-text">
              <span className="logo-main">Japan Planner</span>
              <span className="logo-sub">AI 일본 여행 일정 생성기</span>
            </div>
          </div>
          {step !== 'form' && (
            <button className="btn-reset" onClick={handleReset}>
              ← 새 일정 만들기
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        {step === 'form' && <TravelForm onSubmit={handleSubmit} />}
        {step === 'loading' && <LoadingScreen streamText={streamText} />}
        {step === 'result' && itineraryData && (
          <ItineraryResult data={itineraryData} formData={formData} onReset={handleReset} />
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by Claude AI &nbsp;|&nbsp; © 2024 Japan Travel Planner</p>
      </footer>
    </div>
  );
}

export default App;
