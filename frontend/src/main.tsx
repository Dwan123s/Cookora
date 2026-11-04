import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import { LazyMotion, MotionConfig } from 'motion/react';
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/500.css';
import '@fontsource/be-vietnam-pro/600.css';
import '@fontsource/be-vietnam-pro/700.css';
import './styles.css';
import './redesign.css';
import './home-reference.css';
import './cookora-tokens.css';
import './matcher-photo.css';
import './discover-reference.css';
import './home-alignment.css';
import './island-header.css';
import './mobile.css';
import './mobile-navigation.css';
const loadMotion = () => import('./motion-features').then((module) => module.default);
const client = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <MotionConfig reducedMotion="user" transition={{ duration: 0.22 }}>
          <LazyMotion features={loadMotion} strict>
            <App />
          </LazyMotion>
        </MotionConfig>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
