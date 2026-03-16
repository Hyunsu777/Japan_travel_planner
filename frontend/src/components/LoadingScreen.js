import React from 'react';

const MESSAGES = [
  '항공편과 체류 정보를 분석하는 중...',
  '지역 명소와 동선을 계획하는 중...',
  '식당과 액티비티를 선별하는 중...',
  '예산을 최적화하는 중...',
  '최종 일정표를 작성하는 중...',
];

function LoadingScreen({ streamText }) {
  const [msgIdx, setMsgIdx] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx(prev => (prev + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-screen">
      <div className="loading-torii">⛩️</div>
      <h2 className="loading-title">AI가 일정을 만들고 있습니다</h2>
      <p className="loading-subtitle">
        {MESSAGES[msgIdx]}
        <span className="loading-dots">
          <span>.</span><span>.</span><span>.</span>
        </span>
      </p>
      <div className="loading-progress">
        <div className="loading-progress-bar" />
      </div>
      {streamText && (
        <div className="loading-stream">
          {streamText.slice(-300)}
        </div>
      )}
    </div>
  );
}

export default LoadingScreen;
