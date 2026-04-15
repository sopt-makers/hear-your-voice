import { useEffect, useState } from 'react';
import type { PeerOption } from '../components/peer-comment/PeerMemberPicker';
import { useCommentForm } from '../context/CommentFormContext';
import { callApi } from '../lib/apiClient';
import { getUsersBySprint } from '../lib/api/sprintPeers';
import { useErrorHandler } from './useErrorHandler';

export function usePeerOptions(): PeerOption[] {
  const { data } = useCommentForm();
  const { handleError } = useErrorHandler();
  const [peerOptions, setPeerOptions] = useState<PeerOption[]>([]);

  const { p_sprint_auth_code, user_name, user_team, user_chapter } = data;

  useEffect(() => {
    if (!p_sprint_auth_code || !user_name || !user_team || !user_chapter) {
      return;
    }
    callApi(() =>
      getUsersBySprint({
        p_auth_code: p_sprint_auth_code,
        p_name: user_name,
        p_team_code: user_team,
        p_chapter_code: user_chapter,
      }),
    )
      .then((peers) => {
        setPeerOptions(peers.map((p) => ({ label: p.name, value: p.user_id })));
      })
      .catch(handleError);
  }, [p_sprint_auth_code, user_name, user_team, user_chapter, handleError]);

  return peerOptions;
}
