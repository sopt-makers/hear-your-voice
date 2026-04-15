import { useEffect, useRef, useState } from 'react';
import type { PeerOption } from '../components/peer-comment/PeerMemberPicker';
import { useCommentForm } from '../context/CommentFormContext';
import { callApi } from '../lib/apiClient';
import { getUsersBySprint } from '../lib/api/sprintPeers';
import { useErrorHandler } from './useErrorHandler';

export function usePeerOptions(): PeerOption[] {
  const { data } = useCommentForm();
  const { handleError } = useErrorHandler();
  const [peerOptions, setPeerOptions] = useState<PeerOption[]>([]);
  const requestSeqRef = useRef(0);

  const { p_sprint_auth_code, user_name, user_team, user_chapter } = data;

  useEffect(() => {
    if (!p_sprint_auth_code || !user_name || !user_team || !user_chapter) {
      setPeerOptions([]);
      return;
    }

    const requestSeq = (requestSeqRef.current += 1);
    let disposed = false;
    callApi(() =>
      getUsersBySprint({
        p_auth_code: p_sprint_auth_code,
        p_name: user_name,
        p_team_code: user_team,
        p_chapter_code: user_chapter,
      }),
    )
      .then((peers) => {
        if (disposed || requestSeqRef.current !== requestSeq) return;
        setPeerOptions(peers.map((p) => ({ label: p.name, value: p.user_id })));
      })
      .catch((error) => {
        if (disposed || requestSeqRef.current !== requestSeq) return;
        handleError(error);
      });

    return () => {
      disposed = true;
    };
  }, [p_sprint_auth_code, user_name, user_team, user_chapter, handleError]);

  return peerOptions;
}
