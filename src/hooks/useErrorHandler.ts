import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@sopt-makers/ui';
import { NetworkError, ServiceError } from '@lib/errors';

export function useErrorHandler() {
  const navigate = useNavigate();
  const toast = useToast();
  const toastRef = useRef(toast);

  // useToast() 반환값은 렌더마다 바뀌므로 ref로 최신 참조만 유지 (렌더 중 ref 쓰기는 react-hooks/refs 위반)
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const handleError = useCallback(
    (error: unknown) => {
      if (error instanceof NetworkError) {
        toastRef.current.open({ icon: 'error', content: error.message });
        return;
      }

      if (error instanceof ServiceError) {
        navigate('/error');
        return;
      }

      throw error;
    },
    [navigate],
  );

  return { handleError };
}
