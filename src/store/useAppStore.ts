import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile, Child, Task, Reward, VerificationRequest, CoinTransaction, ChildTaskLog, Category } from '../types';
import { dataService } from '../services/dataService';
import { localStorageService } from '../services/localStorageService';
import { parseRRule, isDateValid, getNextDueDate } from '../utils/recurrence';
import { getLocalDateString, getTodayLocalStart, getLocalStartOfDay, isResetNeeded } from '../utils/timeUtils';

export type OnboardingStep = 'family-setup' | 'parent-setup' | 'add-child' | 'first-task' | 'first-reward' | 'completed';

export interface AppState {
  // State
  activeChildId: string | null;
  isAdminMode: boolean;
  adminPin: string | null;
  adminName?: string;
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
  setAdminPin: (pin: string) => void;
  setAdminName: (name: string) => void;
  setFamilyName: (name: string) => void;

  // Data Actions
  refreshData: () => Promise<void>;
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
  updateAdminPin: (familyName: string, pin: string) => Promise<{ error: any }>;
  updateParentName: (name: string) => Promise<{ error: any }>;
  updateChildAvatar: (childId: string, avatarUrl: string) => Promise<{ error: any }>;
  completeTask: (taskId: string) => Promise<{ error: any }>;
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
      adminPin: null,
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
            updatedTasks = tasks.map(t => {
              if (t.id === log.task_id) {
                // We increment streak for excused as well, to encourage honesty
                const currentStreak = (t.current_streak || 0) + 1;
                const bestStreak = Math.max(t.best_streak || 0, currentStreak);

                dataService.updateTask(t.id, { current_streak: currentStreak, best_streak: bestStreak });
                return { ...t, current_streak: currentStreak, best_streak: bestStreak };
              }
              return t;
            });
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
          const success = await dataService.verifyTask(logId, childId, rewardValue);

          if (!success) throw new Error('Failed to verify task');

          // Update Streak Logic
          const { tasks, childLogs } = get();
          const log = childLogs.find(l => l.id === logId);
          let updatedTasks = tasks;

          if (log) {
            updatedTasks = tasks.map(t => {
              if (t.id === log.task_id) {
                const currentStreak = (t.current_streak || 0) + 1;
                const bestStreak = Math.max(t.best_streak || 0, currentStreak);

                // Persist streak update to DB (optimistic update here, assuming dataService handles it or we need a separate call)
                // Ideally dataService.updateTask should be called, but for now we update local state.
                // NOTE: We should probably call updateTask in background or ensure dataService.verifyTask handles it if backend logic existed.
                // Since we are using local storage/Supabase, we should explicitly update the task.
                dataService.updateTask(t.id, { current_streak: currentStreak, best_streak: bestStreak });

                return { ...t, current_streak: currentStreak, best_streak: bestStreak };
              }
              return t;
            });
          }

          // Remove from local pendingVerifications
          set((state) => ({
            tasks: updatedTasks,
            pendingVerifications: state.pendingVerifications.filter(v => v.id !== logId),
            // Also update the child balance locally
            children: state.children.map(c =>
              c.id === childId ? { ...c, current_balance: (c.current_balance || 0) + rewardValue } : c
            ),
            // Update the specific log in childLogs
            childLogs: state.childLogs.map(log =>
              log.id === logId ? { ...log, status: 'VERIFIED', verified_at: new Date().toISOString() } : log
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

      checkMissedMissions: async () => {
        const { children, tasks, childLogs, lastMissedCheckDate } = get();
        const userId = 'local-user';
        const todayStr = getLocalDateString();

        // 1. Check for MISSED tasks from PAST DAYS
        // Only run this if we haven't checked today yet
        if (isResetNeeded(lastMissedCheckDate)) {
          let startDate: Date;
          const todayDate = getTodayLocalStart();

          if (lastMissedCheckDate) {
            startDate = new Date(lastMissedCheckDate);
            startDate = getLocalStartOfDay(startDate);
          } else {
            startDate = new Date(todayDate);
            startDate.setDate(startDate.getDate() - 7);
          }

          const endDate = new Date(todayDate);
          endDate.setDate(endDate.getDate() - 1);

          if (startDate <= endDate) {
            const newLogs: ChildTaskLog[] = [];
            const activeTasks = tasks.filter(t => t.is_active !== false);

            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
              const checkDate = new Date(d);
              const checkDateStr = getLocalDateString(checkDate);
              const checkDateIso = checkDate.toISOString();

              for (const task of activeTasks) {
                if (!task.recurrence_rule) continue;

                const taskCreatedDate = new Date(task.created_at || new Date());
                const taskCreatedDateStr = getLocalDateString(taskCreatedDate);
                if (checkDateStr < taskCreatedDateStr) continue;

                let isScheduled = false;
                if (task.recurrence_rule === 'Once') {
                  isScheduled = task.next_due_date === checkDateStr;
                } else {
                  const options = parseRRule(task.recurrence_rule);
                  const baseDate = new Date(task.created_at || new Date());
                  isScheduled = isDateValid(checkDate, options, baseDate);
                }

                if (isScheduled) {
                  const assignedChildren = (task.assigned_to || []).filter((id: string) => children.some(c => c.id === id));

                  for (const childId of assignedChildren) {
                    const hasLog = childLogs.some(log => {
                      if (log.child_id !== childId || log.task_id !== task.id) return false;
                      const logDate = new Date(log.completed_at);
                      return getLocalDateString(logDate) === checkDateStr;
                    });

                    if (!hasLog) {
                      const alreadyFailed = childLogs.some(log => {
                        if (log.child_id !== childId || log.task_id !== task.id) return false;
                        if (log.status !== 'FAILED') return false;
                        const logDate = new Date(log.completed_at);
                        const logDateStr = getLocalDateString(logDate);
                        return logDateStr === checkDateStr;
                      });

                      if (!alreadyFailed) {
                        const newLog = await dataService.logFailedTask(userId, childId, task.id, checkDateIso);
                        if (newLog) {
                          newLogs.push(newLog);
                        }
                      }
                    }
                  }
                }
              }
            }

            // Update last check date if we processed past days
            set({ lastMissedCheckDate: todayStr });

            if (newLogs.length > 0) {
              set(state => ({
                childLogs: [...newLogs, ...state.childLogs]
              }));
            }

            // Phase 3: Schedule Missed Daily Report
            if (newLogs.length > 0) {
              import('../services/notificationService').then(({ notificationService }) => {
                notificationService.scheduleMissedDailyReport(newLogs.length);
              });
            }
          }
        }

        // 2. Check for EXPIRED tasks for TODAY (ALWAYS RUN THIS)
        const activeTasks = tasks.filter(t => t.is_active !== false);
        const newLogs: ChildTaskLog[] = [];
        const todayDate = getTodayLocalStart();
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTimeVal = currentHours * 60 + currentMinutes;

        console.log('[AutoFail] Checking expired tasks at:', now.toLocaleTimeString(), 'Val:', currentTimeVal);

        for (const task of activeTasks) {
          if (!task.expiry_time) continue;

          // Parse expiry time
          const [expHour, expMinute] = task.expiry_time.split(':').map(Number);
          const expTimeVal = expHour * 60 + expMinute;

          console.log(`[AutoFail] Task: ${task.name}, Expiry: ${task.expiry_time} (${expTimeVal}), Current: ${currentTimeVal}`);

          if (currentTimeVal > expTimeVal) {
            console.log(`[AutoFail] Task ${task.name} is EXPIRED. Checking if due today...`);
            // Task has expired for today. Check if it was due today.
            const checkDate = new Date(todayDate); // Today local start
            const checkDateStr = getLocalDateString(checkDate);
            const checkDateIso = checkDate.toISOString();

            // Don't check dates before the task existed
            const taskCreatedDate = new Date(task.created_at || new Date());
            const taskCreatedDateStr = getLocalDateString(taskCreatedDate);
            if (checkDateStr < taskCreatedDateStr) {
              console.log(`[AutoFail] Task ${task.name} created after today, skipping.`);
              continue;
            }

            let isScheduled = false;
            if (task.recurrence_rule === 'Once') {
              isScheduled = task.next_due_date === checkDateStr;
            } else if (task.recurrence_rule) {
              const options = parseRRule(task.recurrence_rule);
              const baseDate = new Date(task.created_at || new Date());
              isScheduled = isDateValid(checkDate, options, baseDate);
            }

            console.log(`[AutoFail] Task ${task.name} scheduled for today? ${isScheduled}`);

            if (isScheduled) {
              const assignedChildren = (task.assigned_to || []).filter((id: string) => children.some(c => c.id === id));

              for (const childId of assignedChildren) {
                // Check if completed/failed/excused today
                const hasLog = childLogs.some(log => {
                  if (log.child_id !== childId || log.task_id !== task.id) return false;
                  const logDate = new Date(log.completed_at);
                  return getLocalDateString(logDate) === checkDateStr;
                });

                console.log(`[AutoFail] Child ${childId} has log today? ${hasLog}`);

                if (!hasLog) {
                  console.log(`[AutoFail] MARKING FAILED: Task ${task.name} for Child ${childId}`);
                  // Log FAILED immediately
                  const newLog = await dataService.logFailedTask(userId, childId, task.id, checkDateIso);
                  if (newLog) {
                    newLogs.push(newLog);
                  }
                }
              }
            }
          }
        }

        if (newLogs.length > 0) {
          // Reset streaks for failed tasks
          const { tasks } = get();
          const failedTaskIds = new Set(newLogs.map(l => l.task_id));

          const updatedTasks = tasks.map(t => {
            if (failedTaskIds.has(t.id)) {
              // Reset streak to 0
              dataService.updateTask(t.id, { current_streak: 0 });
              return { ...t, current_streak: 0 };
            }
            return t;
          });

          set(state => ({
            tasks: updatedTasks,
            childLogs: [...state.childLogs, ...newLogs].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
          }));
        }

        // Update last check date to TODAY (local string) to indicate we have checked everything up to now.
        // Actually, if we only checked up to "yesterday", should we set it to "yesterday" or "today"?
        // If we set it to "today", then tomorrow `isResetNeeded` will be true (tomorrow != today).
        // And `startDate` will be (today + 1) which is tomorrow.
        // So we check "today" (which became yesterday).
        // Yes, setting it to todayStr means "I have run the check logic on [todayStr]".
        set({ lastMissedCheckDate: todayStr });
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
