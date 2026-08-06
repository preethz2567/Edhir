import { useEffect, useState } from 'react';

function App() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/ws-stub');
    
    ws.onopen = () => {
      console.log('Connected to WebSocket stub');
      setTimeout(() => {
        setMessages(prev => [...prev, "Mock alert: anomaly detected!"]);
      }, 2000);
    };

    ws.onmessage = (event) => {
      setMessages(prev => [...prev, event.data]);
    };

    return () => ws.close();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edhir Dashboard</h1>
        <p className="text-gray-600">Real-time session anomaly monitoring</p>
      </header>

      <main>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Live Alerts</h2>
          {messages.length === 0 ? (
            <p className="text-gray-500">Waiting for data...</p>
          ) : (
            <ul className="space-y-2">
              {messages.map((msg, i) => (
                <li key={i} className="p-3 bg-red-50 text-red-700 border border-red-200 rounded">
                  {msg}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
