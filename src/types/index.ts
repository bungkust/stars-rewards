export interface Profile {
  id: string;
  created_at: string;
  pin_admin: string;
  family_name?: string;
  parent_name?: string;
}

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  birth_date?: string;
  current_balance: number;
  avatar_url: string;
}

export interface Task {
  id: string;
  parent_id: string;
  name: string;
  reward_value: number;
  type: 'ONE_TIME' | 'RECURRING';
  recurrence_rule?: string;
  is_active?: boolean;
  created_at?: string;
  assigned_to: string[];
  next_due_date?: string;
  expiry_time?: string; // Format: "HH:mm"
  current_streak?: number;
  best_streak?: number;
}

export interface Reward {
  id: string;
  parent_id: string;
  name: string;
  cost_value: number;
  category?: string;
  type: 'ONE_TIME' | 'UNLIMITED' | 'ACCUMULATIVE';
  required_task_id?: string;
  required_task_count?: number;
  assigned_to?: string[];
}

export interface ChildTaskLog {
  id: string;
  parent_id: string;
  child_id: string;
  task_id: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'FAILED' | 'PENDING_EXCUSE' | 'EXCUSED';
  rejection_reason?: string;
  notes?: string;
  parentDecisionDate?: string | null;
  completed_at: string;
  verified_at?: string;
}

export interface CoinTransaction {
  id: string;
  parent_id: string;
  child_id: string;
  amount: number;
  type: 'TASK_VERIFIED' | 'REWARD_REDEEMED' | 'MANUAL_ADJ';
  reference_id?: string;
  description?: string;
  created_at: string;
}

export interface VerificationRequest extends ChildTaskLog {
  task_title: string;
  reward_value: number;
  child_name: string;
}
