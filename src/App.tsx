import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastProvider } from '@sopt-makers/ui';
import { CommentFormProvider } from '@context/CommentFormContext';
import './App.css';
import StartPage from '@pages/StartPage';
import NoticePage from '@pages/NoticePage';
import SprintCodePage from '@pages/SprintCodePage';
import SprintIntroPage from '@pages/SprintIntroPage';
import ErrorPage from '@pages/ErrorPage';
import { hasActiveSprint } from '@lib/api/sprint';
import { callApi } from '@lib/apiClient';
import UserInfoPage from '@pages/UserInfoPage';
import StopCommentPage from '@pages/StopCommentPage';
import StartCommentPage from '@pages/StartCommentPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <StartPage />,
    loader: () => callApi(() => hasActiveSprint()),
    errorElement: <ErrorPage />,
  },
  { path: '/notice', element: <NoticePage /> },
  { path: '/sprint-code', element: <SprintCodePage /> },
  { path: '/sprint-intro', element: <SprintIntroPage /> },
  { path: '/user-info', element: <UserInfoPage /> },
  { path: '/stop-comment', element: <StopCommentPage /> },
  { path: '/start-comment', element: <StartCommentPage /> },
]);

function App() {
  return (
    <CommentFormProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </CommentFormProvider>
  );
}

export default App;
