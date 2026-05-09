export type SprintType = 'chapter' | 'team';

export interface SprintInfo {
  is_valid: boolean;
  sprint_type: SprintType;
  sprint_name: string | null;
}
