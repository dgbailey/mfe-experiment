import React, { useState, useEffect, Suspense } from 'react';
import * as Sentry from '@sentry/browser';

// Lazy load remote components
const Remote1Component = React.lazy(() => import('option2_remote1/Component'));
const Remote2Component = React.lazy(() => import('option2_remote2/Component'));

// Remote components will create their own hubs WITH browser tracing

function App() {
  const [mainResponse, setMainResponse] = useState(null);

  const makeMainCall = async () => {
    console.log('[OPTION 2] Making API call with main Sentry (browser tracing)...');
    
    try {
      const res = await fetch('http://localhost:3004/api/ping');
      const data = await res.json();
      console.log('[OPTION 2] Main response:', data);
      setMainResponse(data);
    } catch (error) {
      console.error('[OPTION 2] Main error:', error);
      Sentry.captureException(error);
      setMainResponse({ error: error.message });
    }
  };

  const makeHub1Call = async () => {
    console.log('[OPTION 2] Hub 1 call - this should be handled by remote component');
    // This would be implemented by the remote component
  };

  const makeHub2Call = async () => {
    console.log('[OPTION 2] Hub 2 call - this should be handled by remote component');
    // This would be implemented by the remote component
  };

  // Make API call on page load
  useEffect(() => {
    makeMainCall();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🟡 Option 2 - Sentry.init() + 2 Hubs (All With Tracing)</h1>
      
      <div style={{ 
        backgroundColor: '#e6e6ff', 
        padding: '15px', 
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <h3>Setup:</h3>
        <ul>
          <li>Main: Sentry.init() with browser tracing</li>
          <li>Hub 1: Separate client, WITH browser tracing</li>
          <li>Hub 2: Separate client, WITH browser tracing</li>
          <li>Expected: All calls have trace headers (possible accumulation)</li>
        </ul>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
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
        
        <button 
          onClick={makeHub1Call}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Hub 1 Call (Tracing)
        </button>
        
        <button 
          onClick={makeHub2Call}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Hub 2 Call (Tracing)
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
          <h3>Remote 1 (With Tracing)</h3>
          <Suspense fallback={<div>Loading Remote 1...</div>}>
            <Remote1Component />
          </Suspense>
        </div>
        
        <div style={{ flex: 1 }}>
          <h3>Remote 2 (With Tracing)</h3>
          <Suspense fallback={<div>Loading Remote 2...</div>}>
            <Remote2Component />
          </Suspense>
        </div>
      </div>

      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#fff3cd',
        borderRadius: '5px'
      }}>
        <h3>Expected Results:</h3>
        <ul>
          <li>ALL calls should have sentry-trace headers</li>
          <li>Possible baggage accumulation from multiple browser tracing instances</li>
          <li>Multiple browser tracing integrations instrumenting fetch</li>
        </ul>
      </div>
    </div>
  );
}

export default App;