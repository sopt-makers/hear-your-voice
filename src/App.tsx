import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastProvider } from '@sopt-makers/ui';
import './App.css';
import StartPage from './pages/StartPage';
import NoticePage from './pages/NoticePage';
import SprintCodePage from './pages/SprintCodePage';
import SprintIntroPage from './pages/SprintIntroPage';
import ErrorPage from './pages/ErrorPage';
import { hasActiveSprint } from './lib/api/sprint';
import UserInfoPage from './pages/UserInfoPage';

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
  { path: '/user-info', element: <UserInfoPage /> },
]);

function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}

export default App;
