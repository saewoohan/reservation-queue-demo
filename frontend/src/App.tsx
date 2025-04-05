import { useEffect, useRef, useState } from 'react';


const serverURL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

function App() {
  const [userId, setUserId] = useState<string | undefined>();
  const [rank, setRank] = useState<number | null>(null);
  const [joined, setJoined] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const isFirstRender = useRef(true);

  const handleJoin = async () => {
    const res = await fetch(`${serverURL}/queue/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    setRank(data.rank);
    setJoined(true);
  };

  useEffect(() => {
    if (!joined) return;

    const sse = new EventSource(`${serverURL}/queue/events?userId=${userId}`);

    sse.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.event === 'update') {
        // 순위 업데이트 이벤트
        setRank(data.rank);
      } else if (data.event === 'confirmed') {
        // 확정 이벤트
        setConfirmed(true);
        sse.close(); // 더 이상 이벤트를 받을 필요가 없음
      }
    };

    sse.onerror = (error) => {
      console.error('SSE Error:', error);
      sse.close();
    };

    return () => sse.close();
  }, [joined, userId]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      const id = prompt('유저 ID를 입력해주세요 (예: user1)');
      setUserId(id || `guest-${Date.now()}`);
    }
  }, []);

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800">
      <div className="text-center max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6">🎟️ 대기열 시스템 데모</h1>
        
        <p className="mb-4 text-lg">내 ID: <strong>{userId}</strong></p>
        
        {!joined ? (
          <button
            onClick={handleJoin}
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-600 transition-colors"
          >
            대기열 참가하기
          </button>
        ) : confirmed ? (
          <div className="text-2xl mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-green-600 font-bold">🎉 예약 진입!</p>
            <p className="text-sm mt-2">대기열에서 처리되었습니다.</p>
          </div>
        ) : (
          <div className="text-2xl mt-6 p-4 bg-blue-50 rounded-lg">
            현재 순위: <span className="font-bold text-blue-600">{rank ?? '...'}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;