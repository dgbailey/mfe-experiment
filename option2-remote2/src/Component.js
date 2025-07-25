import React, { useState, useEffect } from 'react';
import * as Sentry from '@sentry/browser';

// Create hub WITH browser tracing
function createHubWithTracing() {
  console.log('[OPTION 2 REMOTE 2] Creating hub WITH browser tracing');
  
  const client = new Sentry.BrowserClient({
    dsn: 'https://6c9a2bcc9f080d1e1e04440b30623dcc@o88872.ingest.us.sentry.io/4509726493310977',
    integrations: [
      // Base integrations + browserTracingIntegration
      Sentry.functionToStringIntegration(),
      Sentry.inboundFiltersIntegration(),
      Sentry.breadcrumbsIntegration(),
      Sentry.globalHandlersIntegration(),
      Sentry.linkedErrorsIntegration(),
      Sentry.dedupeIntegration(),
      Sentry.httpContextIntegration(),
      Sentry.browserTracingIntegration({
        tracePropagationTargets: ['localhost:3003', 'localhost:3004'],
      }),
    ],
    transport: Sentry.makeFetchTransport,
    stackParser: Sentry.defaultStackParser,
    environment: 'development',
    tracesSampleRate: 1.0,
    release: 'option2-remote2@1.0.0',
    beforeSend: (event) => {
      console.log('[OPTION 2 REMOTE 2] Sending event:', event.event_id);
      return event;
    },
  });

  const hub = new Sentry.Hub(client);
  hub.bindClient(client);
  return hub;
}

const hub = createHubWithTracing();

export default function Component() {
  const [response, setResponse] = useState(null);

  const makeApiCall = async () => {
    console.log('[OPTION 2 REMOTE 2] Making API call with browser tracing...');
    
    await hub.withScope(async (scope) => {
      scope.setTag('component', 'option2-remote2');
      
      try {
        const res = await fetch('http://localhost:3004/api/ping');
        const data = await res.json();
        console.log('[OPTION 2 REMOTE 2] Response:', data);
        setResponse(data);
      } catch (error) {
        console.error('[OPTION 2 REMOTE 2] Error:', error);
        hub.captureException(error);
        setResponse({ error: error.message });
      }
    });
  };

  // Make API call on component load
  useEffect(() => {
    makeApiCall();
  }, []);

  return (
    <div>
      <button 
        onClick={makeApiCall}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '15px'
        }}
      >
        Remote 2 Call (With Tracing)
      </button>

      {response && (
        <div style={{ 
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '5px'
        }}>
          <pre>{JSON.stringify(response, null, 2)}</pre>
          {response.receivedHeaders && (
            <>
              <p><strong>sentry-trace:</strong> {response.receivedHeaders['sentry-trace'] || 'none'}</p>
              <p><strong>baggage:</strong> {response.receivedHeaders['baggage'] || 'none'}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}