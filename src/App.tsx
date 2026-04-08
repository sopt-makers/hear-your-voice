import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import StartPage from './pages/StartPage';
import NoticePage from './pages/NoticePage';
import SprintCodePage from './pages/SprintCodePage';
import SprintIntroPage from './pages/SprintIntroPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/notice" element={<NoticePage />} />
        <Route path="/sprint-code" element={<SprintCodePage />} />
        <Route path="/sprint-intro" element={<SprintIntroPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
