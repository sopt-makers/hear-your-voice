import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import StartScreen from './pages/StartScreen';
import NoticeScreen from './pages/NoticeScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartScreen />} />
        <Route path="/notice" element={<NoticeScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
