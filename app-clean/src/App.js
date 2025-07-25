import React, { useState, useEffect, Suspense } from 'react';
import * as Sentry from '@sentry/browser';

// Lazy load remote components
const Remote1Component = React.lazy(() => import('option1_remote1/Component'));
const Remote2Component = React.lazy(() => import('option1_remote2/Component'));

// Remote components will create their own hubs without browser tracing

function App() {
  const [mainResponse, setMainResponse] = useState(null);

  const makeMainCall = async () => {
    console.log('[OPTION 1] Making API call with main Sentry (browser tracing)...');
    
    try {
      const res = await fetch('http://localhost:3004/api/ping');
      const data = await res.json();
      console.log('[OPTION 1] Main response:', data);
      setMainResponse(data);
    } catch (error) {
      console.error('[OPTION 1] Main error:', error);
      Sentry.captureException(error);
      setMainResponse({ error: error.message });
    }
  };

  // Make API call on page load
  useEffect(() => {
    makeMainCall();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🟢 Option 1 - Sentry.init() + 2 Hubs (No Tracing)</h1>
      
      <div style={{ 
        backgroundColor: '#d4edda', 
        padding: '15px', 
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <h3>Setup:</h3>
        <ul>
          <li>Host: Sentry.init() with browser tracing</li>
          <li>Remote 1 (5001): Hub WITHOUT browser tracing</li>
          <li>Remote 2 (5002): Hub WITHOUT browser tracing</li>
          <li>Expected: Only host API calls have trace headers</li>
          <li>Remotes auto-load and make API calls when available</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={makeMainCall}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Main Call (Tracing)
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h3>Main (Browser Tracing)</h3>
          {mainResponse && (
            <div style={{ 
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '5px'
            }}>
              <pre>{JSON.stringify(mainResponse, null, 2)}</pre>
              {mainResponse.receivedHeaders && (
                <>
                  <p><strong>sentry-trace:</strong> {mainResponse.receivedHeaders['sentry-trace'] || 'none'}</p>
                  <p><strong>baggage:</strong> {mainResponse.receivedHeaders['baggage'] || 'none'}</p>
                </>
              )}
            </div>
          )}
        </div>
        
        <div style={{ flex: 1 }}>
          <h3>Remote 1 (No Tracing)</h3>
          <Suspense fallback={<div>Loading Remote 1...</div>}>
            <Remote1Component />
          </Suspense>
        </div>
        
        <div style={{ flex: 1 }}>
          <h3>Remote 2 (No Tracing)</h3>
          <Suspense fallback={<div>Loading Remote 2...</div>}>
            <Remote2Component />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default App;