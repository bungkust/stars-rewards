import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile, Child, Task, Reward, VerificationRequest, CoinTransaction, ChildTaskLog } from '../types';
import { dataService } from '../services/dataService';
import { localStorageService } from '../services/localStorageService';

export type OnboardingStep = 'family-setup' | 'parent-setup' | 'add-child' | 'first-task' | 'first-reward' | 'completed';

export interface AppState {
  // State
  activeChildId: string | null;
  isAdminMode: boolean;
  adminPin: string | null;
  adminName?: string;
  familyName?: string;
  notificationsEnabled: boolean;

  childLogs: ChildTaskLog[]; // Store logs for the active child

  // Data Stores
  children: Child[];
  tasks: Task[]; // Templates
  pendingVerifications: VerificationRequest[]; // Tasks waiting for approval
  rewards: Reward[];
  transactions: CoinTransaction[];
  redeemedHistory: { child_id: string; reward_id: string }[]; // Full history of redemptions for logic checks

  onboardingStep: OnboardingStep;

  // Auth State (Simplified for Offline)
  userProfile: Profile | null;
  isLoading: boolean;

  // Actions
  setActiveChild: (childId: string | null) => void;
  toggleAdminMode: (isAdmin: boolean) => void;
  verifyPin: (pin: string) => boolean;
  setAdminPin: (pin: string) => void;
  setAdminName: (name: string) => void;
  setFamilyName: (name: string) => void;

  // Data Actions
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
  fetchUserProfile: () => Promise<Profile | null>;
  createFamily: (familyName: string, pin: string, parentName: string) => Promise<{ error: any }>;
  updateAdminPin: (familyName: string, pin: string) => Promise<{ error: any }>;
  updateParentName: (name: string) => Promise<{ error: any }>;
  updateChildAvatar: (childId: string, avatarUrl: string) => Promise<{ error: any }>;
  completeTask: (taskId: string) => Promise<{ error: any }>;
  verifyTask: (logId: string, childId: string, rewardValue: number) => Promise<{ error: any }>;
  rejectTask: (logId: string, reason: string) => Promise<{ error: any }>;
  redeemReward: (childId: string, cost: number, rewardId: string) => Promise<{ error: any }>;
  manualAdjustment: (childId: string, amount: number, reason?: string) => Promise<{ error: any }>;
  checkDailyFailures: () => Promise<void>;
  importData: (data: Partial<AppState>) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  setNotificationsEnabled: (value: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeChildId: null,
      isAdminMode: false,
      adminPin: null,
      notificationsEnabled: true,
      children: [],
      tasks: [],
      childLogs: [],
      pendingVerifications: [],
      rewards: [],
      transactions: [],
      redeemedHistory: [],
      onboardingStep: 'family-setup',

      userProfile: null,
      isLoading: false,

      setActiveChild: (childId) => set({ activeChildId: childId }),

      toggleAdminMode: (isAdmin) => set({ isAdminMode: isAdmin }),

      verifyPin: (pin) => {
        const currentPin = get().adminPin;
        // Fallback to profile pin if state is lost but profile exists
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
      setNotificationsEnabled: (value) => set({ notificationsEnabled: value }),

      refreshData: async () => {
        set({ isLoading: true });
        try {
          const userId = 'local-user';

          // Fetch ALL data including REWARDS and TRANSACTIONS
          const [children, tasks, verifications, rewards, transactions, logs, redeemedHistory] = await Promise.all([
            dataService.fetchChildren(userId),
            dataService.fetchActiveTasks(userId),
            dataService.fetchPendingVerifications(userId),
            dataService.fetchRewards(userId),
            dataService.fetchTransactions(userId),
            dataService.fetchChildLogs(userId),
            dataService.fetchRedeemedRewards(userId)
          ]);

          set({
            children,
            tasks,
            pendingVerifications: verifications,
            rewards,
            transactions,
            childLogs: logs,
            redeemedHistory
          });

          // Automatically determine onboarding completion based on existing data
          if (children.length > 0 || tasks.length > 0 || rewards.length > 0) {
            set({ onboardingStep: 'completed' });
          }

          // Check for failed daily missions
          await get().checkDailyFailures();
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
          const userId = 'local-user';
          const newChild = await dataService.addChild(userId, child);

          if (!newChild) throw new Error('Failed to add child');

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
          const userId = 'local-user';
          const newTask = await dataService.addTask(userId, task);

          if (!newTask) throw new Error('Failed to add task');

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
          const userId = 'local-user';
          const newReward = await dataService.addReward(userId, reward);

          if (!newReward) throw new Error('Failed to add reward');

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

      fetchUserProfile: async () => {
        set({ isLoading: true });
        try {
          const profile = await localStorageService.getProfile();

          set({ userProfile: profile });
          if (profile) {
            if (profile.pin_admin) set({ adminPin: profile.pin_admin });
            if (profile.family_name) set({ familyName: profile.family_name });
            if (profile.parent_name) set({ adminName: profile.parent_name });
          }

          return profile;
        } catch (error) {
          console.error('Error fetching profile:', error);
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      createFamily: async (familyName, pin, parentName) => {
        set({ isLoading: true });
        try {
          const profile = await localStorageService.createFamily(familyName, pin, parentName);

          set({
            userProfile: profile,
            adminPin: pin,
            familyName: familyName,
            adminName: parentName,
          });

          return { error: null };
        } catch (error) {
          console.error('Error creating family:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      updateAdminPin: async (familyName: string, pin: string) => {
        set({ isLoading: true });
        try {
          await localStorageService.updateProfile({ family_name: familyName, pin_admin: pin });

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
          await localStorageService.updateProfile({ parent_name: name });

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
          // Optimistic update
          set((state) => ({
            children: state.children.map((c) =>
              c.id === childId ? { ...c, avatar_url: avatarUrl } : c
            ),
          }));

          await localStorageService.updateChildAvatar(childId, avatarUrl);

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
          const { activeChildId } = get();
          if (!activeChildId) throw new Error('Missing child ID');

          const userId = 'local-user';
          const newLog = await dataService.completeTask(userId, activeChildId, taskId);

          if (!newLog) throw new Error('Failed to complete task');

          const { tasks, children } = get();
          const task = tasks.find(t => t.id === taskId);
          const child = children.find(c => c.id === activeChildId);

          set((state) => ({
            childLogs: [newLog, ...state.childLogs],
            pendingVerifications: [
              ...state.pendingVerifications,
              {
                ...newLog,
                task_title: task?.name || 'Unknown Task',
                reward_value: task?.reward_value || 0,
                child_name: child?.name || 'Unknown Child'
              }
            ]
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
            ),
            // Add to transactions
            transactions: [
              {
                id: crypto.randomUUID(),
                parent_id: 'local-user',
                child_id: childId,
                amount: rewardValue,
                type: 'TASK_VERIFIED',
                reference_id: logId,
                created_at: new Date().toISOString()
              },
              ...state.transactions
            ]
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
            // Update local redemption history immediately
            redeemedHistory: rewardId
              ? [...state.redeemedHistory, { child_id: childId, reward_id: rewardId }]
              : state.redeemedHistory,
            // Add to transactions
            transactions: [
              {
                id: crypto.randomUUID(),
                parent_id: 'local-user',
                child_id: childId,
                amount: -cost,
                type: rewardId ? 'REWARD_REDEEMED' : 'MANUAL_ADJ',
                reference_id: rewardId,
                created_at: new Date().toISOString()
              },
              ...state.transactions
            ]
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
          const userId = 'local-user';
          const success = await dataService.manualAdjustment(userId, childId, amount, reason);

          if (!success) throw new Error('Failed to update balance');

          set((state) => ({
            children: state.children.map(c =>
              c.id === childId ? { ...c, current_balance: (c.current_balance || 0) + amount } : c
            ),
            // Add to transactions
            transactions: [
              {
                id: crypto.randomUUID(),
                parent_id: 'local-user',
                child_id: childId,
                amount: amount,
                type: 'MANUAL_ADJ',
                description: reason,
                created_at: new Date().toISOString()
              },
              ...state.transactions
            ]
          }));

          return { error: null };
        } catch (error) {
          console.error('Error adjusting balance:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      checkDailyFailures: async () => {
        const { children, tasks, childLogs } = get();
        const userId = 'local-user';
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(23, 59, 59, 999); // End of yesterday

        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const dailyTasks = tasks.filter(t => t.recurrence_rule === 'Daily' && t.is_active !== false);
        const newLogs: ChildTaskLog[] = [];

        for (const child of children) {
          for (const task of dailyTasks) {
            // Check if there is ANY log for this task on yesterday's date
            const hasLog = childLogs.some(log => {
              if (log.child_id !== child.id || log.task_id !== task.id) return false;
              const logDate = new Date(log.completed_at).toISOString().split('T')[0];
              return logDate === yesterdayStr;
            });

            if (!hasLog) {
              // Create FAILED log
              const newLog = await dataService.logFailedTask(userId, child.id, task.id, yesterday.toISOString());
              if (newLog) {
                newLogs.push(newLog);
              }
            }
          }
        }

        if (newLogs.length > 0) {
          set(state => ({
            childLogs: [...state.childLogs, ...newLogs].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
          }));
        }
      },

      logout: async () => {
        localStorage.removeItem('stars-rewards-storage'); // Clear persisted state

        set({
          userProfile: null,
          activeChildId: null,
          children: [],
          isAdminMode: false
        });
        window.location.reload(); // Force reload to clear any in-memory state
      },

      importData: async (data) => {
        set({ isLoading: true });
        try {
          const userId = 'local-user';

          // 1. Restore to Local
          const { success, error } = await dataService.restoreBackup(userId, data);
          if (!success) throw error;

          // 2. Refresh local state
          await get().refreshData();
          await get().fetchUserProfile();

          if (data.onboardingStep) {
            set({ onboardingStep: data.onboardingStep });
          }

          return { error: null };
        } catch (error) {
          console.error('Error importing data:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'stars-rewards-storage',
      partialize: (state) => ({
        adminPin: state.adminPin,
        adminName: state.adminName,
        familyName: state.familyName,
        onboardingStep: state.onboardingStep,
        // Persist important data
        children: state.children,
        activeChildId: state.activeChildId,
        tasks: state.tasks,
        rewards: state.rewards,
        childLogs: state.childLogs,
        redeemedHistory: state.redeemedHistory,
        transactions: state.transactions,
      }),
    }
  )
);
