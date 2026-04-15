import { supabase } from '../supabase';

export interface SprintPeer {
  user_id: string;
  name: string;
}

/** `get_users_by_sprint` RPC 반환: `returns table (id bigint, name text)`. */
interface UsersBySprintRow {
  id: number | string;
  name: string;
}

export interface GetUsersBySprintParams {
  p_auth_code: string;
  p_name: string;
  p_team_code: string;
  p_chapter_code: string;
}

function rowToPeer(row: UsersBySprintRow): SprintPeer {
  return {
    user_id: String(row.id),
    name: row.name,
  };
}

/** 스프린트·작성자 기준 동료 목록 (`get_users_by_sprint`). 본인은 제외됩니다. */
export async function getUsersBySprint(params: GetUsersBySprintParams): Promise<SprintPeer[]> {
  const { data, error } = await supabase.rpc('get_users_by_sprint', {
    p_auth_code: params.p_auth_code,
    p_name: params.p_name,
    p_team_code: params.p_team_code,
    p_chapter_code: params.p_chapter_code,
  });

  if (error) {
    throw error;
  }

  if (!Array.isArray(data)) {
    return [];
  }

  return (data as UsersBySprintRow[]).map(rowToPeer);
}
