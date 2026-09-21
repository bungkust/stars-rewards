export interface Profile {
  id: string;
  created_at: string;
  pin_admin: string;
  parent_pattern?: string;
  preferred_auth_method?: 'pin' | 'pattern' | 'biometric';
  family_name?: string;
  parent_name?: string;
  biometric_enabled?: boolean;
  notifications_enabled?: boolean;
  notify_mission_approvals?: boolean;
  notify_missed_tasks?: boolean;
  notify_daily_report?: boolean;
  onboarding_step?: string;
}

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  birth_date?: string;
  current_balance: number;
  avatar_url: string;
  current_streak?: number;
  best_streak?: number;
  claimed_milestones?: number[];
}

export interface StreakMilestone {
  id: string;
  days: number;
  title: string;
  description: string;
  bonusStars: number;
  linked_task_id?: string;
  linked_reward_id?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  is_default?: boolean;
}

export interface Task {
  id: string;
  parent_id: string;
  name: string;
  reward_value: number;
  xp_reward?: number;
  type: 'ONE_TIME' | 'RECURRING';
  recurrence_rule?: string;
  is_active?: boolean;
  created_at?: string;
  assigned_to: string[];
  category_id?: string;
  next_due_date?: string;
  expiry_time?: string; // Format: "HH:mm"
  current_streak?: number;
  best_streak?: number;
  max_completions_per_day?: number;
  total_target_value?: number;
  target_unit?: string;
  description?: string;
  icon?: string;
  image_url?: string;
}

export interface Reward {
  id: string;
  parent_id: string;
  name: string;
  cost_value: number;
  created_at?: string;
  category?: string;
  type: 'ONE_TIME' | 'UNLIMITED' | 'ACCUMULATIVE';
  required_task_id?: string;
  required_task_count?: number;
  assigned_to?: string[];
  description?: string;
  icon?: string;
  image_url?: string;
}

export interface ChildTaskLog {
  id: string;
  parent_id: string;
  child_id: string;
  task_id: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'FAILED' | 'PENDING_EXCUSE' | 'EXCUSED' | 'IN_PROGRESS';
  current_value?: number;
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

export interface XpTransaction {
  id: string;
  parent_id: string;
  child_id: string;
  amount: number;
  type: 'MISSION_APPROVED' | 'DAILY_QUEST' | 'STREAK_BONUS' | 'FAMILY_QUEST' | 'ACHIEVEMENT';
  reference_id?: string;
  created_at: string;
}


export interface VerificationRequest extends ChildTaskLog {
  task_title: string;
  reward_value: number;
  child_name: string;
}
