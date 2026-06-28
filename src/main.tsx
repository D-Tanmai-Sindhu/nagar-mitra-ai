import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept Google Maps API errors to prevent fatal preview crash overlays in AI Studio
const origConsoleError = console.error;
console.error = (...args: any[]) => {
  const msg = args.map(a => typeof a === 'string' ? a : (a?.message || '')).join(' ');
  if (msg.includes('ApiNotActivatedMapError') || msg.includes('Google Maps') || msg.includes('gm_authFailure') || msg.includes('InvalidKeyMapError')) {
    window.dispatchEvent(new CustomEvent('google-maps-api-error'));
    return;
  }
  origConsoleError.apply(console, args);
};

window.addEventListener('error', (e) => {
  if (e.message && (e.message.includes('ApiNotActivatedMapError') || e.message.includes('Google Maps') || e.message.includes('gm_authFailure'))) {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('google-maps-api-error'));
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
