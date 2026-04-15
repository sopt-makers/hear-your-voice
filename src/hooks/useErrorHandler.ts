import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@sopt-makers/ui';
import { NetworkError, ServiceError } from '@lib/errors';

export function useErrorHandler() {
  const navigate = useNavigate();
  const toast = useToast();

  const handleError = useCallback((error: unknown) => {
    if (error instanceof NetworkError) {
      toast.open({ icon: 'error', content: error.message });
      return;
    }

    if (error instanceof ServiceError) {
      navigate('/error');
      return;
    }

    throw error;
  }, [navigate, toast]);

  return { handleError };
}
