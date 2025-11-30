export type { Profile, Child, Task, Reward, ChildTaskLog, CoinTransaction } from './supabase';

import type { ChildTaskLog } from './supabase';

export interface VerificationRequest extends ChildTaskLog {
  task_title: string;
  reward_value: number;
  child_name: string;
}
