
import './index.css';
import { createRoot } from 'react-dom/client';
import App from './App';



declare global {
  interface Window {
    holidayAPI: {
      getHolidays: (
        year: number,
        month: number,
      ) => Promise<{ date: string; name: string }[]>;
    };
  }
}

export {};




const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('React root 요소를 찾을 수 없습니다.');
}

createRoot(rootElement).render(<App />);
