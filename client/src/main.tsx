import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import firebaseLib from './lib/firebase';

// If the app was opened via a Firebase email sign-in link, complete the sign-in.
// This ensures `supabase.auth.getSession()` (the shim) will detect the user.
try {
  // run but don't await to avoid delaying app render
  firebaseLib.completeSigninIfLink();
} catch (e) {
  // ignore
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
