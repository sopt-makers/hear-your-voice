import { useEffect, useState } from 'react';
import type { PeerMember } from '@types';
import { useCommentForm } from './useCommentForm';
import { callApi } from '@lib/apiClient';
import { getUsersBySprint } from '@lib/api/sprintPeers';
import { useErrorHandler } from './useErrorHandler';

interface PeerMembersResult {
  /** 이 목록을 조회할 때 사용한 파라미터 key — 현재 파라미터와 다르면 stale */
  key: string;
  members: PeerMember[];
}

const NO_MEMBERS: PeerMember[] = [];

export function usePeerMembers(): PeerMember[] {
  const { data } = useCommentForm();
  const { handleError } = useErrorHandler();
  const [result, setResult] = useState<PeerMembersResult | null>(null);

  const { p_sprint_auth_code, user_name, user_team, user_chapter } = data;
  const hasRequiredFields = Boolean(p_sprint_auth_code && user_name && user_team && user_chapter);
  const paramsKey = `${p_sprint_auth_code}|${user_name}|${user_team}|${user_chapter}`;

  useEffect(() => {
    if (!hasRequiredFields) {
      return;
    }

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
        if (disposed) return;
        setResult({
          key: paramsKey,
          members: peers.map((p) => ({ name: p.name, userId: p.user_id })),
        });
      })
      .catch((error) => {
        if (disposed) return;
        handleError(error);
      });

    return () => {
      disposed = true;
    };
  }, [
    hasRequiredFields,
    paramsKey,
    p_sprint_auth_code,
    user_name,
    user_team,
    user_chapter,
    handleError,
  ]);

  return result !== null && result.key === paramsKey ? result.members : NO_MEMBERS;
}
