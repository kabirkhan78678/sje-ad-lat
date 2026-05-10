import React from 'react';
import ReactDOM from 'react-dom/client';

import App from '@/App';
import { AuthProvider } from '@/modules/auth/AuthProvider';
import { ToastProvider } from '@/components/shared/ToastProvider';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>,
);
