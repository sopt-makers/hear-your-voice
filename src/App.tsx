import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import StartPage from './pages/StartPage';
import NoticePage from './pages/NoticePage';
import SprintCodePage from './pages/SprintCodePage';
import SprintIntroPage from './pages/SprintIntroPage';
import ErrorPage from './pages/ErrorPage';
import { hasActiveSprint } from './lib/api/period';

const router = createBrowserRouter([
  {
    path: '/',
    element: <StartPage />,
    loader: () => hasActiveSprint(),
    errorElement: <ErrorPage />,
  },
  { path: '/notice', element: <NoticePage /> },
  { path: '/sprint-code', element: <SprintCodePage /> },
  { path: '/sprint-intro', element: <SprintIntroPage /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
