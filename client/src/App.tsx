import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ModelSelectPage } from './pages/ModelSelectPage';
import { ChatPage } from './pages/ChatPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ModelSelectPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}
