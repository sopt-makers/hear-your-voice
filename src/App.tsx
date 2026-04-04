import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import StartScreen from './pages/StartScreen';
import NoticeScreen from './pages/NoticeScreen';
import ChooseSprintScreen from './pages/ChooseSprintScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartScreen />} />
        <Route path="/notice" element={<NoticeScreen />} />
        <Route path="/choose-sprint" element={<ChooseSprintScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
