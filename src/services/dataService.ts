import { supabase } from '../utils/supabase';
import type { Child, Task, Reward, VerificationRequest, CoinTransaction } from '../types';

export const dataService = {
  /**
   * Retrieves all child profiles and their current balances for a given parent.
   */
  fetchChildren: async (parentId: string): Promise<Child[]> => {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', parentId);

    if (error) {
      console.error('Error fetching children:', error);
      return [];
    }

    return data as Child[];
  },

  /**
   * Retrieves the list of active task templates for a given parent.
   */
  fetchActiveTasks: async (parentId: string): Promise<Task[]> => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('parent_id', parentId);
      // .eq('is_active', true); // Uncomment if is_active exists

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    return data as Task[];
  },

  /**
   * Retrieves the list of rewards for a given parent.
   */
  fetchRewards: async (parentId: string): Promise<Reward[]> => {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('parent_id', parentId);

    if (error) {
      console.error('Error fetching rewards:', error);
      return [];
    }

    return data as Reward[];
  },

  /**
   * Retrieves transaction history.
   */
  fetchTransactions: async (parentId: string): Promise<CoinTransaction[]> => {
    const { data, error } = await supabase
      .from('coin_transactions')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data as CoinTransaction[];
  },

  /**
   * Marks a task as completed by the child (creates a log entry with PENDING status).
   */
  completeTask: async (parentId: string, childId: string, taskId: string): Promise<ChildTaskLog | null> => {
    const { data, error } = await supabase
      .from('child_tasks_log')
      .insert({
        parent_id: parentId,
        child_id: childId,
        task_id: taskId,
        status: 'PENDING',
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error completing task:', error);
      return null;
    }
    return data as ChildTaskLog;
  },

  /**
   * Retrieves logs for all children of a parent (typically for today or recent history).
   * Simplified to fetch last 50 logs for now to check status.
   */
  fetchChildLogs: async (parentId: string): Promise<ChildTaskLog[]> => {
    const { data, error } = await supabase
      .from('child_tasks_log')
      .select('*')
      .eq('parent_id', parentId)
      .order('completed_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching logs:', error);
      return [];
    }
    return data as ChildTaskLog[];
  },

  /**
   * Retrieves pending verifications (child_tasks_log where status = PENDING).
   * Joins with 'tasks' and 'children' to get friendly names.
   */
  fetchPendingVerifications: async (parentId: string): Promise<VerificationRequest[]> => {
    // Note: Supabase Join syntax might vary based on Foreign Key setup.
    // Assuming standard FKs: child_tasks_log.task_id -> tasks.id, child_tasks_log.child_id -> children.id
    const { data, error } = await supabase
      .from('child_tasks_log')
      .select(`
        *,
        task:tasks(name, reward_value),
        child:children(name)
      `)
      .eq('parent_id', parentId)
      .eq('status', 'PENDING');

    if (error) {
      console.error('Error fetching verifications:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      ...item,
      task_title: item.task?.name || 'Unknown Task',
      reward_value: item.task?.reward_value || 0,
      child_name: item.child?.name || 'Unknown Child',
    }));
  },

  /**
   * Verifies a task: Updates log status and increments child balance.
   * Ideally done via RPC or Database Transaction for safety.
   * Here we implement a client-side flow (optimistic) for now or calls a robust RPC.
   */
  verifyTask: async (logId: string, childId: string, rewardValue: number): Promise<boolean> => {
    // 1. Update Log Status
    const { error: logError } = await supabase
      .from('child_tasks_log')
      .update({ status: 'VERIFIED' })
      .eq('id', logId);

    if (logError) {
      console.error('Error updating log:', logError);
      return false;
    }

    // 2. Increment Balance (Fetch current first to be safe, or use RPC increment)
    // Using RPC is best practice: supabase.rpc('verify_task', { log_id: ... })
    // Fallback manual update:
    const { data: child } = await supabase
      .from('children')
      .select('current_balance, parent_id')
      .eq('id', childId)
      .single();

    if (child) {
      const newBalance = (child.current_balance || 0) + rewardValue;
      await supabase
        .from('children')
        .update({ current_balance: newBalance })
        .eq('id', childId);
        
      // 3. Insert Transaction Record
      const { error: txError } = await supabase
        .from('coin_transactions')
        .insert({
          parent_id: child.parent_id, // Explicitly passed
          child_id: childId,
          amount: rewardValue,
          type: 'TASK_VERIFIED',
          reference_id: logId,
        });

      if (txError) console.error('Error inserting transaction:', txError);
    }

    return true;
  },

  /**
   * Rejects a task verification.
   */
  rejectTask: async (logId: string, reason: string): Promise<boolean> => {
    const { error } = await supabase
      .from('child_tasks_log')
      .update({ 
        status: 'REJECTED',
        rejection_reason: reason
      })
      .eq('id', logId);
      
    return !error;
  },

  /**
   * Redeems a reward: Decrements balance.
   */
  redeemReward: async (childId: string, cost: number, rewardId?: string): Promise<boolean> => {
    const { data: child } = await supabase
      .from('children')
      .select('current_balance, parent_id')
      .eq('id', childId)
      .single();

    if (!child || child.current_balance < cost) return false;

    const newBalance = child.current_balance - cost;

    const { error } = await supabase
      .from('children')
      .update({ current_balance: newBalance })
      .eq('id', childId);

    if (!error) {
      const { error: txError } = await supabase
        .from('coin_transactions')
        .insert({
          parent_id: child.parent_id, // Explicitly passed
          child_id: childId,
          amount: -cost, // Negative for spending
          type: rewardId ? 'REWARD_REDEEMED' : 'MANUAL_ADJ',
          reference_id: rewardId,
        });
      
      if (txError) console.error('Error inserting transaction:', txError);
      
      return true;
    }
    return false;
  },

  /**
   * Manually adjusts a child's balance (add or deduct).
   */
  manualAdjustment: async (parentId: string, childId: string, amount: number, reason?: string): Promise<boolean> => {
    // 1. Fetch current balance
    const { data: child } = await supabase
      .from('children')
      .select('current_balance')
      .eq('id', childId)
      .single();

    if (!child) return false;

    const newBalance = (child.current_balance || 0) + amount;

    // 2. Update Balance
    const { error } = await supabase
      .from('children')
      .update({ current_balance: newBalance })
      .eq('id', childId);

    if (!error) {
      // 3. Insert Transaction Record
      const { error: txError } = await supabase
        .from('coin_transactions')
        .insert({
          parent_id: parentId,
          child_id: childId,
          amount: amount,
          type: 'MANUAL_ADJ',
          reference_id: null, 
          description: reason // Store the reason
        });
      
      if (txError) console.error('Error inserting transaction:', txError);
      
      return true;
    }
    return false;
  },

  /**
   * Verifies the entered PIN against the profiles table for the parent.
   */
  checkAdminPin: async (parentId: string, pin: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('pin_admin')
      .eq('id', parentId)
      .single();

    if (error || !data) {
      console.error('Error checking PIN:', error);
      return false;
    }

    return data.pin_admin === pin;
  },
};
