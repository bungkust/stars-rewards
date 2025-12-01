import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import type { Profile, Child, Task, Reward, VerificationRequest, CoinTransaction, ChildTaskLog } from '../types';
import { dataService } from '../services/dataService';

export type OnboardingStep = 'family-setup' | 'parent-setup' | 'add-child' | 'first-task' | 'first-reward' | 'completed';

interface AppState {
  // State
  activeChildId: string | null;
  isAdminMode: boolean;
  adminPin: string | null;
  adminName?: string; 
  familyName?: string; 
  
  childLogs: ChildTaskLog[]; // Store logs for the active child
  
  // Data Stores
  children: Child[];
  tasks: Task[]; // Templates
  pendingVerifications: VerificationRequest[]; // Tasks waiting for approval
  rewards: Reward[];
  transactions: CoinTransaction[];
  
  onboardingStep: OnboardingStep;
  
  // Auth State
  session: Session | null;
  userProfile: Profile | null;
  isLoading: boolean;

  // Actions
  setActiveChild: (childId: string | null) => void;
  toggleAdminMode: (isAdmin: boolean) => void;
  verifyPin: (pin: string) => boolean;
  setAdminPin: (pin: string) => void;
  setAdminName: (name: string) => void;
  setFamilyName: (name: string) => void; 
  
  // Data Actions (Sync with Backend)
  refreshData: () => Promise<void>;
  getTasksByChildId: (childId: string) => Task[];
  addChild: (child: Omit<Child, 'id' | 'parent_id' | 'balance' | 'current_balance'>) => Promise<{ error: any }>;
  addTask: (task: Omit<Task, 'id' | 'parent_id' | 'created_at'>) => Promise<{ error: any }>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<{ error: any }>;
  addReward: (reward: Omit<Reward, 'id' | 'parent_id'>) => Promise<{ error: any }>;
  updateReward: (rewardId: string, updates: Partial<Reward>) => Promise<{ error: any }>;
  deleteReward: (rewardId: string) => Promise<{ error: any }>;
  
  setOnboardingStep: (step: OnboardingStep) => void;
  
  // Auth Actions
  setSession: (session: Session | null) => void;
  fetchUserProfile: (userId: string) => Promise<Profile | null>;
  signInUser: (email: string, password: string) => Promise<{ error: any }>;
  signUpUser: (email: string, password: string, familyName?: string, pin?: string) => Promise<{ error: any }>;
  updateAdminPin: (familyName: string, pin: string) => Promise<{ error: any }>;
  updateParentName: (name: string) => Promise<{ error: any }>;
  updateChildAvatar: (childId: string, avatarUrl: string) => Promise<{ error: any }>;
  completeTask: (taskId: string) => Promise<{ error: any }>;
  verifyTask: (logId: string, childId: string, rewardValue: number) => Promise<{ error: any }>;
  rejectTask: (logId: string, reason: string) => Promise<{ error: any }>;
  redeemReward: (childId: string, cost: number, rewardId: string) => Promise<{ error: any }>;
  manualAdjustment: (childId: string, amount: number, reason?: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeChildId: null,
      isAdminMode: false,
      adminPin: null, 
      children: [],
      tasks: [],
      childLogs: [],
      pendingVerifications: [],
      rewards: [],
      transactions: [],
      onboardingStep: 'family-setup', 
      
      session: null,
      userProfile: null,
      isLoading: false,

      setActiveChild: (childId) => set({ activeChildId: childId }),
      
      toggleAdminMode: (isAdmin) => set({ isAdminMode: isAdmin }),
      
      verifyPin: (pin) => {
        const currentPin = get().adminPin;
        const profilePin = get().userProfile?.pin_admin;
        
        if (!currentPin && !profilePin) return false;
        
        const targetPin = currentPin || profilePin;
        const isValid = pin === targetPin;
        
        if (isValid) {
          set({ isAdminMode: true });
        }
        return isValid;
      },

      setAdminPin: (pin) => set({ adminPin: pin }),
      setAdminName: (name) => set({ adminName: name }),
      setFamilyName: (name) => set({ familyName: name }),

      refreshData: async () => {
        const { session } = get();
        if (!session?.user) return;

        set({ isLoading: true });
        try {
          const userId = session.user.id;
          // Fetch ALL data including REWARDS and TRANSACTIONS
          const [children, tasks, verifications, rewards, transactions, logs] = await Promise.all([
            dataService.fetchChildren(userId),
            dataService.fetchActiveTasks(userId),
            dataService.fetchPendingVerifications(userId),
            dataService.fetchRewards(userId),
            dataService.fetchTransactions(userId),
            dataService.fetchChildLogs(userId) 
          ]);

          set({ 
            children, 
            tasks, 
            pendingVerifications: verifications,
            rewards,
            transactions,
            childLogs: logs
          });
        } catch (error) {
          console.error('Error refreshing data:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      getTasksByChildId: (_childId) => {
        return get().tasks; 
      },

      addChild: async (child) => {
        set({ isLoading: true });
        try {
          const { session } = get();
          if (!session?.user) throw new Error('No active session');

          const { data, error } = await supabase
            .from('children')
            .insert({
              parent_id: session.user.id,
              name: child.name,
              birth_date: child.birth_date,
              avatar_url: child.avatar_url, 
              current_balance: 0
            })
            .select()
            .single();

          if (error) throw error;

          const newChild: Child = {
            id: data.id,
            parent_id: data.parent_id,
            name: data.name,
            birth_date: data.birth_date,
            current_balance: data.current_balance,
            avatar_url: data.avatar_url,
          };

          set((state) => ({ 
            children: [...state.children, newChild] 
          }));

          return { error: null };
        } catch (error) {
          console.error('Error adding child:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      addTask: async (task) => {
        set({ isLoading: true });
        try {
          const { session } = get();
          if (!session?.user) throw new Error('No active session');

          const { data, error } = await supabase
            .from('tasks')
            .insert({
              parent_id: session.user.id,
              name: task.name,
              reward_value: task.reward_value,
              type: task.type,
              recurrence_rule: task.recurrence_rule,
              is_active: task.is_active !== undefined ? task.is_active : true
            })
            .select()
            .single();

          if (error) throw error;

          const newTask: Task = {
            id: data.id,
            parent_id: data.parent_id,
            name: data.name,
            reward_value: data.reward_value,
            type: data.type,
            recurrence_rule: data.recurrence_rule,
            is_active: data.is_active,
            created_at: data.created_at
          };

          set((state) => ({ 
            tasks: [...state.tasks, newTask] 
          }));

          return { error: null };
        } catch (error) {
          console.error('Error adding task:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      updateTask: async (taskId, updates) => {
        set({ isLoading: true });
        try {
          const updatedTask = await dataService.updateTask(taskId, updates);
          
          if (!updatedTask) throw new Error('Failed to update task');

          set((state) => ({
            tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t)
          }));

          return { error: null };
        } catch (error) {
          console.error('Error updating task:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      addReward: async (reward) => {
        set({ isLoading: true });
        try {
          const { session } = get();
          if (!session?.user) throw new Error('No active session');

          const { data, error } = await supabase
            .from('rewards')
            .insert({
              parent_id: session.user.id,
              name: reward.name,
              cost_value: reward.cost_value,
              category: reward.category,
              type: reward.type,
              required_task_id: reward.required_task_id,
              required_task_count: reward.required_task_count
            })
            .select()
            .single();

          if (error) throw error;

          const newReward: Reward = {
            id: data.id,
            parent_id: data.parent_id,
            name: data.name,
            cost_value: data.cost_value,
            category: data.category,
            type: data.type,
            required_task_id: data.required_task_id,
            required_task_count: data.required_task_count
          };

          set((state) => ({ 
            rewards: [...state.rewards, newReward] 
          }));

          return { error: null };
        } catch (error) {
          console.error('Error adding reward:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      updateReward: async (rewardId, updates) => {
        set({ isLoading: true });
        try {
          const updatedReward = await dataService.updateReward(rewardId, updates);
          
          if (!updatedReward) throw new Error('Failed to update reward');

          set((state) => ({
            rewards: state.rewards.map(r => r.id === rewardId ? updatedReward : r)
          }));

          return { error: null };
        } catch (error) {
          console.error('Error updating reward:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      deleteReward: async (rewardId) => {
        set({ isLoading: true });
        try {
          const success = await dataService.deleteReward(rewardId);
          
          if (!success) throw new Error('Failed to delete reward');

          set((state) => ({
            rewards: state.rewards.filter(r => r.id !== rewardId)
          }));

          return { error: null };
        } catch (error) {
          console.error('Error deleting reward:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      setOnboardingStep: (step) => set({ onboardingStep: step }),

      setSession: (session) => set({ session }),

      fetchUserProfile: async (userId) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (error) {
             if (error.code === 'PGRST116') return null;
             throw error;
          }
          
          set({ userProfile: data as Profile });
          if (data.pin_admin) set({ adminPin: data.pin_admin });
          if (data.family_name) set({ familyName: data.family_name });
          if (data.parent_name) set({ adminName: data.parent_name }); 
          
          return data as Profile;
        } catch (error) {
          console.error('Error fetching profile:', error);
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      signInUser: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (data.session) {
            set({ session: data.session });
            await get().fetchUserProfile(data.session.user.id);
          }
          return { error: null };
        } catch (error) {
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      signUpUser: async (email, password, familyName = '', pin = '') => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) throw error;

          if (data.user) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                family_name: familyName,
                pin_admin: pin,
              });

            if (profileError) {
               console.error('Profile creation failed:', profileError);
            }

            set({ session: data.session });
            await get().fetchUserProfile(data.user.id);
          }
          
          return { error: null };
        } catch (error) {
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      updateAdminPin: async (familyName: string, pin: string) => {
        set({ isLoading: true });
        try {
          const { session } = get();
          if (!session?.user) throw new Error('No active session');

          const { error } = await supabase
            .from('profiles')
            .update({ family_name: familyName, pin_admin: pin })
            .eq('id', session.user.id);

          if (error) throw error;

          set({ 
            adminPin: pin, 
            familyName: familyName, 
          });
          
          set((state) => ({
            userProfile: state.userProfile ? { ...state.userProfile, pin_admin: pin, family_name: familyName } : null
          }));

          return { error: null };
        } catch (error) {
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      updateParentName: async (name: string) => {
        set({ isLoading: true });
        try {
          const { session } = get();
          if (!session?.user) throw new Error('No active session');

          const { error } = await supabase
            .from('profiles')
            .update({ parent_name: name })
            .eq('id', session.user.id);

          if (error) throw error;

          set({ adminName: name });
          set((state) => ({
            userProfile: state.userProfile ? { ...state.userProfile, parent_name: name } : null
          }));

          return { error: null };
        } catch (error) {
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      updateChildAvatar: async (childId: string, avatarUrl: string) => {
        set({ isLoading: true });
        try {
          const { error } = await supabase
            .from('children')
            .update({ avatar_url: avatarUrl })
            .eq('id', childId);

          if (error) throw error;

          set((state) => ({
            children: state.children.map((c) =>
              c.id === childId ? { ...c, avatar_url: avatarUrl } : c
            ),
          }));

          return { error: null };
        } catch (error) {
          console.error('Error updating child avatar:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      completeTask: async (taskId: string) => {
        set({ isLoading: true });
        try {
          const { session, activeChildId } = get();
          if (!session?.user || !activeChildId) throw new Error('Missing session or child ID');

          const newLog = await dataService.completeTask(session.user.id, activeChildId, taskId);
          
          if (!newLog) throw new Error('Failed to complete task');

          set((state) => ({
            childLogs: [newLog, ...state.childLogs]
          }));
          
          return { error: null };
        } catch (error) {
          console.error('Error completing task:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      verifyTask: async (logId: string, childId: string, rewardValue: number) => {
        set({ isLoading: true });
        try {
          const success = await dataService.verifyTask(logId, childId, rewardValue);
          
          if (!success) throw new Error('Failed to verify task');

          // Remove from local pendingVerifications
          set((state) => ({
             pendingVerifications: state.pendingVerifications.filter(v => v.id !== logId),
             // Also update the child balance locally
             children: state.children.map(c => 
               c.id === childId ? { ...c, current_balance: (c.current_balance || 0) + rewardValue } : c
             ),
             // Update the specific log in childLogs
             childLogs: state.childLogs.map(log => 
               log.id === logId ? { ...log, status: 'VERIFIED' } : log
             )
          }));

          return { error: null };
        } catch (error) {
           console.error('Error verifying task:', error);
           return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      rejectTask: async (logId: string, reason: string) => {
        set({ isLoading: true });
        try {
          const success = await dataService.rejectTask(logId, reason);
          
          if (!success) throw new Error('Failed to reject task');

          // Remove from local pendingVerifications
          set((state) => ({
             pendingVerifications: state.pendingVerifications.filter(v => v.id !== logId),
             // Update the specific log in childLogs
             childLogs: state.childLogs.map(log => 
               log.id === logId ? { ...log, status: 'REJECTED', rejection_reason: reason } : log
             )
          }));

          return { error: null };
        } catch (error) {
           console.error('Error rejecting task:', error);
           return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      redeemReward: async (childId: string, cost: number, rewardId: string) => {
        set({ isLoading: true });
        try {
          const success = await dataService.redeemReward(childId, cost, rewardId);
          
          if (!success) throw new Error('Failed to redeem reward');

          set((state) => ({
            children: state.children.map(c => 
              c.id === childId ? { ...c, current_balance: (c.current_balance || 0) - cost } : c
            ),
            // Optionally track transaction in state if needed
          }));

          return { error: null };
        } catch (error) {
          console.error('Error redeeming reward:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      manualAdjustment: async (childId: string, amount: number, reason?: string) => {
        set({ isLoading: true });
        try {
          const { session } = get();
          if (!session?.user) throw new Error('No active session');

          const success = await dataService.manualAdjustment(session.user.id, childId, amount, reason);
          
          if (!success) throw new Error('Failed to update balance');

          set((state) => ({
            children: state.children.map(c => 
              c.id === childId ? { ...c, current_balance: (c.current_balance || 0) + amount } : c
            ),
          }));

          // Refresh data to get latest transaction
          // get().refreshData(); // Optional, might be overkill

          return { error: null };
        } catch (error) {
          console.error('Error adjusting balance:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ 
          session: null, 
          userProfile: null, 
          activeChildId: null,
          children: [],
          isAdminMode: false
        });
      }
    }),
    {
      name: 'stars-rewards-storage',
      partialize: (state) => ({
        adminPin: state.adminPin,
        adminName: state.adminName,
        familyName: state.familyName,
        onboardingStep: state.onboardingStep,
        session: state.session,
        // Persist important data
        children: state.children, 
        activeChildId: state.activeChildId,
        tasks: state.tasks,
        rewards: state.rewards,
        childLogs: state.childLogs,
      }),
    }
  )
);
