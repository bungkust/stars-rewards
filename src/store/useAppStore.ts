import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile, Child, Task, Reward, VerificationRequest, CoinTransaction, ChildTaskLog, Category } from '../types';
import { dataService } from '../services/dataService';
import { localStorageService } from '../services/localStorageService';
import { getNextDueDate } from '../utils/recurrence';
import { getLocalDateString } from '../utils/timeUtils';
import { missionLogicService } from '../services/missionLogicService';

export type OnboardingStep = 'family-setup' | 'parent-setup' | 'add-child' | 'first-task' | 'first-reward' | 'completed';

export interface AppState {
  // State
  activeChildId: string | null;
  isAdminMode: boolean;
  parentPin: string | null;
  parentName?: string;
  familyName?: string;
  notificationsEnabled: boolean;
  lastMissedCheckDate?: string; // ISO Date string (YYYY-MM-DD)

  childLogs: ChildTaskLog[]; // Store logs for the active child

  // Data Stores
  children: Child[];
  categories: Category[];
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
  setParentPin: (pin: string) => void;
  setParentName: (name: string) => void;
  setFamilyName: (name: string) => void;

  // Data Actions
  refreshData: () => Promise<void>;
  checkPendingAutoApprove: () => Promise<void>;
  getTasksByChildId: (childId: string) => Task[];
  addChild: (child: Omit<Child, 'id' | 'parent_id' | 'balance' | 'current_balance'>) => Promise<{ error: any }>;
  deleteChild: (childId: string) => Promise<{ error: any }>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<{ error: any }>;
  updateCategory: (categoryId: string, updates: Partial<Category>) => Promise<{ error: any }>;
  deleteCategory: (categoryId: string) => Promise<{ error: any }>;
  addTask: (task: Omit<Task, 'id' | 'parent_id' | 'created_at'>) => Promise<{ error: any }>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<{ error: any }>;
  addReward: (reward: Omit<Reward, 'id' | 'parent_id'>) => Promise<{ error: any }>;
  updateReward: (rewardId: string, updates: Partial<Reward>) => Promise<{ error: any }>;
  deleteReward: (rewardId: string) => Promise<{ error: any }>;

  setOnboardingStep: (step: OnboardingStep) => void;

  // Auth Actions
  fetchUserProfile: () => Promise<Profile | null>;
  createFamily: (familyName: string, pin: string, parentName: string) => Promise<{ error: any }>;
  updateParentPin: (familyName: string, pin: string) => Promise<{ error: any }>;
  updateParentName: (name: string) => Promise<{ error: any }>;
  updateChildAvatar: (childId: string, avatarUrl: string) => Promise<{ error: any }>;
  completeTask: (taskId: string) => Promise<{ error: any }>;
  updateTaskProgress: (taskId: string, value: number, target: number) => Promise<{ error: any }>;
  submitExemptionRequest: (taskId: string, reason: string) => Promise<{ error: any }>;
  getPendingExcuses: () => ChildTaskLog[];
  approveExcuse: (logId: string) => Promise<{ error: any }>;
  approveExemption: (logId: string) => Promise<{ error: any }>;
  rejectExemption: (logId: string) => Promise<{ error: any }>;
  verifyTask: (logId: string, childId: string, rewardValue: number) => Promise<{ error: any }>;
  rejectTask: (logId: string, reason: string) => Promise<{ error: any }>;
  redeemReward: (childId: string, cost: number, rewardId: string) => Promise<{ error: any }>;
  manualAdjustment: (childId: string, amount: number, reason?: string) => Promise<{ error: any }>;
  checkMissedMissions: () => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<{ error: any }>;
  deleteChildLog: (logId: string) => Promise<{ error: any }>;
  updateTransaction: (txId: string, updates: Partial<CoinTransaction>) => Promise<{ error: any }>;
  updateChildLog: (logId: string, updates: Partial<ChildTaskLog>) => Promise<{ error: any }>;
  markVerifiedTaskAsFailed: (transactionId: string, logId: string) => Promise<{ error: any }>;
  importData: (data: Partial<AppState>) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  resetApp: () => Promise<void>;
  setNotificationsEnabled: (value: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeChildId: null,
      isAdminMode: false,
      parentPin: null,
      notificationsEnabled: true,
      children: [],
      categories: [],
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
        const currentPin = get().parentPin;
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

      setParentPin: (pin) => set({ parentPin: pin }),
      setParentName: (name) => set({ parentName: name }),
      setFamilyName: (name) => set({ familyName: name }),
      setNotificationsEnabled: (value) => set({ notificationsEnabled: value }),

      refreshData: async () => {
        set({ isLoading: true });
        try {
          const userId = 'local-user';

          // Fetch ALL data including REWARDS and TRANSACTIONS
          const [children, tasks, verifications, rewards, transactions, logs, redeemedHistory, categories] = await Promise.all([
            dataService.fetchChildren(userId),
            dataService.fetchActiveTasks(userId),
            dataService.fetchPendingVerifications(userId),
            dataService.fetchRewards(userId),
            dataService.fetchTransactions(userId),
            dataService.fetchChildLogs(userId),
            dataService.fetchRedeemedRewards(userId),
            dataService.fetchCategories(userId)
          ]);

          // Seed default categories if empty
          let finalCategories = categories;
          if (categories.length === 0) {
            const DEFAULT_CATEGORIES = [
              { name: 'Hygiene', icon: 'soap', is_default: true },
              { name: 'Time', icon: 'clock', is_default: true },
              { name: 'Responsibility', icon: 'user-check', is_default: true },
              { name: 'Skill', icon: 'book', is_default: true },
              { name: 'Family', icon: 'users', is_default: true },
              { name: 'Social', icon: 'message-circle', is_default: true },
              { name: 'Dressing', icon: 'shirt', is_default: true },
              { name: 'Emotion', icon: 'smile', is_default: true },
            ];

            // We need to add them one by one or batch if supported. 
            // dataService.addCategory returns the new category.
            const seeded = await Promise.all(DEFAULT_CATEGORIES.map(c => dataService.addCategory(userId, c)));
            finalCategories = seeded.filter((c): c is Category => c !== null);
          } else {
            // Migration: Rename "Personal Responsibility" to "Responsibility" if found
            const longNameCat = categories.find(c => c.name === 'Personal Responsibility' && c.is_default);
            if (longNameCat) {
              await dataService.updateCategory(longNameCat.id, { name: 'Responsibility' });
              finalCategories = categories.map(c => c.id === longNameCat.id ? { ...c, name: 'Responsibility' } : c);
            }
          }

          set({
            children,
            categories: finalCategories,
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
          await get().checkMissedMissions();

          // Check for auto-approve pending tasks (> 24h)
          await get().checkPendingAutoApprove();

          // Schedule Admin Notification if there are pending items
          const pendingCount = verifications.length + logs.filter(l => l.status === 'PENDING_EXCUSE').length;
          if (pendingCount > 0) {
            import('../services/notificationService').then(({ notificationService }) => {
              notificationService.schedulePendingAdminNotification(pendingCount);
            });
          }
        } catch (error) {
          console.error('Error refreshing data:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      getTasksByChildId: (childId) => {
        return get().tasks.filter(t => {
          // If assigned_to is missing/undefined, assume assigned to all (backward compatibility)
          if (!t.assigned_to) return true;
          // If assigned_to is present, check if childId is in it
          return t.assigned_to.includes(childId);
        });
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

      deleteChild: async (childId: string) => {
        set({ isLoading: true });
        try {
          const success = await dataService.deleteChild(childId);
          if (!success) throw new Error('Failed to delete child');

          set((state) => ({
            children: state.children.filter(c => c.id !== childId),
            // Also remove from active if deleted
            activeChildId: state.activeChildId === childId ? null : state.activeChildId
          }));

          return { error: null };
        } catch (error) {
          console.error('Error deleting child:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      addCategory: async (category) => {
        set({ isLoading: true });
        try {
          const userId = 'local-user';
          const newCategory = await dataService.addCategory(userId, category);

          if (!newCategory) throw new Error('Failed to add category');

          set((state) => ({
            categories: [...state.categories, newCategory]
          }));

          return { error: null };
        } catch (error) {
          console.error('Error adding category:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      updateCategory: async (categoryId, updates) => {
        set({ isLoading: true });
        try {
          const updatedCategory = await dataService.updateCategory(categoryId, updates);

          if (!updatedCategory) throw new Error('Failed to update category');

          set((state) => ({
            categories: state.categories.map(c => c.id === categoryId ? updatedCategory : c)
          }));

          return { error: null };
        } catch (error) {
          console.error('Error updating category:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      deleteCategory: async (categoryId) => {
        set({ isLoading: true });
        try {
          // Check dependency
          const { tasks } = get();
          const isUsed = tasks.some(t => t.category_id === categoryId && t.is_active !== false);
          if (isUsed) {
            throw new Error('Cannot delete category used by active tasks');
          }

          const success = await dataService.deleteCategory(categoryId);
          if (!success) throw new Error('Failed to delete category');

          set((state) => ({
            categories: state.categories.filter(c => c.id !== categoryId)
          }));

          return { error: null };
        } catch (error) {
          console.error('Error deleting category:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      addTask: async (task) => {
        set({ isLoading: true });
        try {
          const userId = 'local-user';

          // Calculate initial next_due_date based on recurrence rule
          // This ensures the task appears on the correct day immediately
          let nextDueDate = undefined;
          if (task.recurrence_rule && task.recurrence_rule !== 'Once') {
            // For new tasks, we want the first occurrence. 
            // getNextDueDate(rule) defaults to today if no last completion.
            // But we should verify if "Today" is valid for this rule.
            // getNextDueDate handles this: it checks if today is valid, if not finds next.
            // However, getNextDueDate signature is (rrule, lastCompleted).
            // Passing undefined for lastCompleted means "start checking from today".

            // We need to import getNextDueDate.
            // Note: We need to ensure getNextDueDate is imported.
            nextDueDate = getNextDueDate(task.recurrence_rule);
          } else if (task.recurrence_rule === 'Once') {
            // For Once tasks, maybe set it to today? Or leave undefined?
            // Usually 'Once' tasks are due immediately until done.
            // Let's leave it undefined or set to today.
            // If we set it, it might help with sorting.
            nextDueDate = getLocalDateString();
          }

          // Default expiry for Daily tasks
          let finalExpiry = task.expiry_time;
          if (task.recurrence_rule === 'Daily' && !finalExpiry) {
            finalExpiry = '23:59';
          }

          const newTask = await dataService.addTask(userId, { ...task, next_due_date: nextDueDate, expiry_time: finalExpiry });

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
          // Check if we need to apply default expiry
          let finalUpdates = { ...updates };
          const existingTask = get().tasks.find(t => t.id === taskId);

          if (existingTask) {
            const newRule = updates.recurrence_rule !== undefined ? updates.recurrence_rule : existingTask.recurrence_rule;
            const newExpiry = updates.expiry_time !== undefined ? updates.expiry_time : existingTask.expiry_time;

            if (newRule === 'Daily' && !newExpiry) {
              finalUpdates.expiry_time = '23:59';
            }
          }

          const updatedTask = await dataService.updateTask(taskId, finalUpdates);

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
            if (profile.pin_admin) set({ parentPin: profile.pin_admin });
            if (profile.family_name) set({ familyName: profile.family_name });
            if (profile.parent_name) set({ parentName: profile.parent_name });
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
            parentPin: pin,
            familyName: familyName,
            parentName: parentName,
          });

          return { error: null };
        } catch (error) {
          console.error('Error creating family:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      updateParentPin: async (familyName: string, pin: string) => {
        set({ isLoading: true });
        try {
          await localStorageService.updateProfile({ family_name: familyName, pin_admin: pin });

          set({
            parentPin: pin,
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

          set({ parentName: name });
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

          // Schedule Admin Notification
          const { pendingVerifications, childLogs } = get();
          const pendingCount = pendingVerifications.length + childLogs.filter(l => l.status === 'PENDING_EXCUSE').length;
          import('../services/notificationService').then(({ notificationService }) => {
            notificationService.schedulePendingAdminNotification(pendingCount);
          });

          return { error: null };
        } catch (error) {
          console.error('Error completing task:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      updateTaskProgress: async (taskId: string, value: number, target: number) => {
        set({ isLoading: true });
        try {
          const { activeChildId } = get();
          if (!activeChildId) throw new Error('Missing child ID');

          // Call service
          const updatedLog = await localStorageService.updateTaskProgress(activeChildId, taskId, value, target);

          if (!updatedLog) throw new Error('Failed to update progress');

          // Update local state
          set((state) => {
            // Remove existing log for this task/day if exists to replace with new one, or just update it
            // Implementation: Filter out the specific log by ID if we know it, or find by task+date?
            // Easier: just replace in childLogs list.
            const existingLogIndex = state.childLogs.findIndex(l => l.id === updatedLog.id);
            let newLogs = [...state.childLogs];

            if (existingLogIndex !== -1) {
              newLogs[existingLogIndex] = updatedLog;
            } else {
              newLogs = [updatedLog, ...newLogs];
            }

            // If it became PENDING, add to pendingVerifications
            let newPending = [...state.pendingVerifications];
            if (updatedLog.status === 'PENDING') {
              // Check if already in pending
              const isPending = newPending.some(p => p.id === updatedLog.id);
              if (!isPending) {
                const task = state.tasks.find(t => t.id === taskId);
                const child = state.children.find(c => c.id === activeChildId);
                newPending.push({
                  ...updatedLog,
                  task_title: task?.name || 'Unknown',
                  reward_value: task?.reward_value || 0,
                  child_name: child?.name || 'Unknown'
                });
              }
            } else {
              // Remove from pending if it went back to IN_PROGRESS
              newPending = newPending.filter(p => p.id !== updatedLog.id);
            }

            return {
              childLogs: newLogs,
              pendingVerifications: newPending
            };
          });

          // If completed (PENDING), Schedule Admin Notification
          if (updatedLog.status === 'PENDING') {
            const { pendingVerifications, childLogs } = get();
            const pendingCount = pendingVerifications.length + childLogs.filter(l => l.status === 'PENDING_EXCUSE').length;
            import('../services/notificationService').then(({ notificationService }) => {
              notificationService.schedulePendingAdminNotification(pendingCount);
            });
          }

          return { error: null };
        } catch (error) {
          console.error('Error updating progress:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      submitExemptionRequest: async (taskId: string, reason: string) => {
        set({ isLoading: true });
        try {
          const { activeChildId } = get();
          if (!activeChildId) throw new Error('Missing child ID');

          const userId = 'local-user';
          const newLog = await dataService.submitExemptionRequest(userId, activeChildId, taskId, reason);

          if (!newLog) throw new Error('Failed to submit exemption request');

          set((state) => ({
            childLogs: [newLog, ...state.childLogs]
          }));

          // Schedule Admin Notification
          const { pendingVerifications, childLogs } = get();
          const pendingCount = pendingVerifications.length + childLogs.filter(l => l.status === 'PENDING_EXCUSE').length;
          import('../services/notificationService').then(({ notificationService }) => {
            notificationService.schedulePendingAdminNotification(pendingCount);
          });

          return { error: null };
        } catch (error) {
          console.error('Error submitting exemption request:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      getPendingExcuses: () => {
        const { childLogs } = get();
        return childLogs.filter(log => log.status === 'PENDING_EXCUSE');
      },

      approveExcuse: async (logId: string) => {
        return get().approveExemption(logId);
      },

      approveExemption: async (logId: string) => {
        set({ isLoading: true });
        try {
          // When approving an excuse, we mark the log as 'EXCUSED'.
          // This effectively "completes" the task for today without reward.
          // The recurrence logic (getNextDueDate) will see this log and calculate the NEXT due date from this date.
          // So we just need to ensure the log is updated correctly.

          const success = await dataService.approveExemption(logId);
          if (!success) throw new Error('Failed to approve exemption');

          // Update Streak Logic (Excused counts as keeping the streak alive)
          const { tasks, childLogs } = get();
          const log = childLogs.find(l => l.id === logId);
          let updatedTasks = tasks;

          if (log) {
            updatedTasks = await missionLogicService.incrementStreak(log.task_id, tasks, childLogs, logId);
          }

          set((state) => ({
            tasks: updatedTasks,
            childLogs: state.childLogs.map(log =>
              log.id === logId ? { ...log, status: 'EXCUSED' } : log
            )
          }));
          return { error: null };
        } catch (error) {
          console.error('Error approving exemption:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      rejectExemption: async (logId: string) => {
        set({ isLoading: true });
        try {
          const success = await dataService.rejectExemption(logId);
          if (!success) throw new Error('Failed to reject exemption');

          set((state) => ({
            childLogs: state.childLogs.map(log =>
              log.id === logId ? { ...log, status: 'REJECTED' } : log
            )
          }));
          return { error: null };
        } catch (error) {
          console.error('Error rejecting exemption:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      verifyTask: async (logId: string, childId: string, rewardValue: number) => {
        set({ isLoading: true });
        try {
          // Prevent double-verification
          const { childLogs } = get();
          const existingLog = childLogs.find(l => l.id === logId);
          if (existingLog && existingLog.status === 'VERIFIED') {
            console.warn('Task already verified, skipping double-credit');
            return { error: null };
          }

          const newTx = await dataService.verifyTask(logId, childId, rewardValue);
          if (!newTx) throw new Error('Verify task failed');

          // Update Streak Logic
          const { tasks, children, transactions } = get();
          let updatedTasks = tasks;
          // Optimistically update if log exists locally
          if (existingLog) {
            updatedTasks = await missionLogicService.incrementStreak(existingLog.task_id, tasks, childLogs, logId);
          }

          // Update State
          // 1. Update Log Status
          const updatedLogs = childLogs.map(l => l.id === logId ? { ...l, status: 'VERIFIED' as const, verified_at: new Date().toISOString() } : l);

          // 2. Update Balance
          const updatedChildren = children.map(c => c.id === childId ? { ...c, current_balance: (c.current_balance || 0) + rewardValue } : c);


          set({
            tasks: updatedTasks,
            childLogs: updatedLogs,
            children: updatedChildren,
            transactions: [newTx, ...transactions],
            pendingVerifications: get().pendingVerifications.filter(v => v.id !== logId)
          });

          return { error: null };
        } catch (error) {
          console.error('Error verifying task:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      deleteTransaction: async (transactionId: string) => {
        set({ isLoading: true });
        try {
          const { transactions, children, childLogs } = get();
          const tx = transactions.find(t => t.id === transactionId);
          if (!tx) throw new Error('Transaction not found');

          const success = await dataService.deleteTransaction(transactionId);
          if (!success) throw new Error('Failed to delete transaction');

          // 1. Revert balance
          const updatedChildren = children.map(c =>
            c.id === tx.child_id
              ? { ...c, current_balance: (c.current_balance || 0) - tx.amount }
              : c
          );

          // 2. Update logs if needed
          let updatedLogs = childLogs;
          let newPending = get().pendingVerifications;

          if (tx.type === 'TASK_VERIFIED' && tx.reference_id) {
            updatedLogs = childLogs.map(l => {
              if (l.id === tx.reference_id) {
                return { ...l, status: 'PENDING' as const };
              }
              return l;
            });

            // Add back to pending
            const log = childLogs.find(l => l.id === tx.reference_id);
            if (log) {
              const task = get().tasks.find(t => t.id === log.task_id);
              const child = children.find(c => c.id === log.child_id);
              newPending = [...newPending, {
                ...log,
                status: 'PENDING',
                task_title: task?.name || 'Unknown',
                reward_value: task?.reward_value || 0,
                child_name: child?.name || 'Unknown'
              }];
            }
          }

          set({
            transactions: transactions.filter(t => t.id !== transactionId),
            children: updatedChildren,
            childLogs: updatedLogs,
            pendingVerifications: newPending
          });

          return { error: null };
        } catch (error) {
          console.error('Error deleting transaction:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      deleteChildLog: async (logId: string) => {
        set({ isLoading: true });
        try {
          const success = await dataService.deleteChildLog(logId);
          if (!success) throw new Error('Failed to delete log');

          set((state) => ({
            childLogs: state.childLogs.filter(l => l.id !== logId),
            pendingVerifications: state.pendingVerifications.filter(v => v.id !== logId)
          }));

          return { error: null };
        } catch (error) {
          console.error('Error deleting log:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      updateTransaction: async (txId: string, updates: Partial<CoinTransaction>) => {
        set({ isLoading: true });
        try {
          const result = await dataService.updateTransaction(txId, updates);
          if (result) {
            set((state) => ({
              transactions: state.transactions.map(t => t.id === txId ? { ...t, ...updates } : t)
            }));
          }
          return { error: null };
        } catch (error) {
          console.error('Error updating transaction:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      updateChildLog: async (logId: string, updates: Partial<ChildTaskLog>) => {
        set({ isLoading: true });
        try {
          const result = await dataService.updateChildLog(logId, updates);
          if (result) {
            set((state) => ({
              childLogs: state.childLogs.map(l => l.id === logId ? { ...l, ...updates } : l)
            }));
          }
          return { error: null };
        } catch (error) {
          console.error('Error updating child log:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      markVerifiedTaskAsFailed: async (transactionId: string, logId: string) => {
        set({ isLoading: true });
        try {
          // 1. Delete the transaction (handles balance revert and streak logic in some cases)
          // Actually deleteTransaction resets log to PENDING.
          const { deleteTransaction, rejectTask } = get();

          const delResult = await deleteTransaction(transactionId);
          if (delResult.error) throw delResult.error;

          // 2. Reject the task
          const rejectResult = await rejectTask(logId, 'Status changed manually from Parent History');
          if (rejectResult.error) throw rejectResult.error;

          return { error: null };
        } catch (error) {
          console.error('Error marking verified task as failed:', error);
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
          const newTx = await dataService.redeemReward(childId, cost, rewardId);

          if (!newTx) throw new Error('Failed to redeem reward');

          set((state) => ({
            children: state.children.map(c =>
              c.id === childId ? { ...c, current_balance: (c.current_balance || 0) - cost } : c
            ),
            // Update local redemption history immediately
            redeemedHistory: rewardId
              ? [...state.redeemedHistory, { child_id: childId, reward_id: rewardId }]
              : state.redeemedHistory,
            // Add to transactions
            transactions: [newTx, ...state.transactions]
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
          const newTx = await dataService.manualAdjustment(userId, childId, amount, reason);

          if (!newTx) throw new Error('Failed to update balance');

          set((state) => ({
            children: state.children.map(c =>
              c.id === childId ? { ...c, current_balance: (c.current_balance || 0) + amount } : c
            ),
            // Add to transactions
            transactions: [newTx, ...state.transactions]
          }));

          return { error: null };
        } catch (error) {
          console.error('Error adjusting balance:', error);
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },

      checkMissedMissions: async () => {
        const { children, tasks, childLogs, lastMissedCheckDate } = get();

        try {
          const result = await missionLogicService.checkMissedMissions(
            children,
            tasks,
            childLogs,
            lastMissedCheckDate
          );

          if (result.newLogs.length > 0 || result.lastCheckedDate !== lastMissedCheckDate) {
            set(state => ({
              lastMissedCheckDate: result.lastCheckedDate,
              childLogs: [...state.childLogs, ...result.newLogs].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()),
              tasks: result.updatedTasks
            }));
          }
        } catch (error) {
          console.error('Error checking missed missions:', error);
        }
      },

      checkPendingAutoApprove: async () => {
        const { childLogs, tasks, verifyTask } = get();
        const now = new Date().getTime();
        const oneDay = 24 * 60 * 60 * 1000;

        const pendingLogs = childLogs.filter(l => l.status === 'PENDING');

        for (const log of pendingLogs) {
          const logTime = new Date(log.completed_at).getTime();
          if (now - logTime > oneDay) {
            const task = tasks.find(t => t.id === log.task_id);
            if (task) {
              console.log(`Auto-approving task ${task.name} for child ${log.child_id}`);
              await verifyTask(log.id, log.child_id, task.reward_value);
            }
          }
        }
      },

      logout: async () => {
        // Non-destructive logout: Just clear active session state
        set({
          activeChildId: null,
          isAdminMode: false
        });
        // We do NOT reload or clear storage here anymore
      },

      resetApp: async () => {
        // 1. Reset State (triggers persist write of empty state)
        set({
          userProfile: null,
          activeChildId: null,
          children: [],
          isAdminMode: false,
          tasks: [],
          rewards: [],
          childLogs: [],
          transactions: [],
          pendingVerifications: [],
          redeemedHistory: [],
          onboardingStep: 'family-setup'
        });

        // 2. Clear Storage & Redirect (async to ensure state updates propagate)
        setTimeout(async () => {
          try {
            // Clear the database
            await dataService.clearAll();

            // Clear the persisted store
            localStorage.removeItem('stars-rewards-storage');

            // Force hard redirect to root
            window.location.replace('/');
          } catch (e) {
            console.error('Error clearing storage:', e);
            window.location.reload();
          }
        }, 100);
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
          if (data.lastMissedCheckDate) {
            set({ lastMissedCheckDate: data.lastMissedCheckDate });
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
        parentPin: state.parentPin,
        parentName: state.parentName,
        familyName: state.familyName,
        onboardingStep: state.onboardingStep,
        lastMissedCheckDate: state.lastMissedCheckDate,
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
