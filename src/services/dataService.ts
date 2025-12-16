import { localStorageService } from './localStorageService';
import type { Child, Task, Reward, VerificationRequest, CoinTransaction, ChildTaskLog, Category } from '../types';

export const dataService = {
  /**
   * Adds a new child profile.
   */
  addChild: async (_parentId: string, child: Omit<Child, 'id' | 'parent_id' | 'balance' | 'current_balance'>): Promise<Child | null> => {
    return localStorageService.addChild(child);
  },

  /**
   * Deletes a child profile.
   */
  deleteChild: async (childId: string): Promise<boolean> => {
    return localStorageService.deleteChild(childId);
  },

  /**
   * Adds a new category.
   */
  addCategory: async (_parentId: string, category: Omit<Category, 'id'>): Promise<Category | null> => {
    return localStorageService.addCategory(category);
  },

  /**
   * Updates an existing category.
   */
  updateCategory: async (categoryId: string, updates: Partial<Category>): Promise<Category | null> => {
    return localStorageService.updateCategory(categoryId, updates);
  },

  /**
   * Deletes a category.
   */
  deleteCategory: async (categoryId: string): Promise<boolean> => {
    return localStorageService.deleteCategory(categoryId);
  },

  /**
   * Retrieves all categories.
   */
  fetchCategories: async (_parentId: string): Promise<Category[]> => {
    return localStorageService.fetchCategories();
  },

  /**
   * Adds a new task template.
   */
  addTask: async (_parentId: string, task: Omit<Task, 'id' | 'parent_id' | 'created_at'>): Promise<Task | null> => {
    return localStorageService.addTask(task);
  },

  /**
   * Adds a new reward.
   */
  addReward: async (_parentId: string, reward: Omit<Reward, 'id' | 'parent_id'>): Promise<Reward | null> => {
    return localStorageService.addReward(reward);
  },

  /**
   * Retrieves all child profiles and their current balances for a given parent.
   */
  fetchChildren: async (_parentId: string): Promise<Child[]> => {
    return localStorageService.fetchChildren();
  },

  /**
   * Retrieves the list of active task templates for a given parent.
   */
  fetchActiveTasks: async (_parentId: string): Promise<Task[]> => {
    return localStorageService.fetchActiveTasks();
  },

  /**
   * Updates an existing task template.
   */
  updateTask: async (taskId: string, updates: Partial<Task>): Promise<Task | null> => {
    return localStorageService.updateTask(taskId, updates);
  },

  /**
   * Updates an existing reward.
   */
  updateReward: async (rewardId: string, updates: Partial<Reward>): Promise<Reward | null> => {
    return localStorageService.updateReward(rewardId, updates);
  },

  /**
   * Deletes a reward.
   */
  deleteReward: async (rewardId: string): Promise<boolean> => {
    return localStorageService.deleteReward(rewardId);
  },

  /**
   * Retrieves the list of rewards for a given parent.
   */
  fetchRewards: async (_parentId: string): Promise<Reward[]> => {
    return localStorageService.fetchRewards();
  },

  /**
   * Retrieves transaction history.
   */
  fetchTransactions: async (_parentId: string): Promise<CoinTransaction[]> => {
    return localStorageService.fetchTransactions();
  },

  /**
   * Retrieves all reward redemption history for the family.
   */
  fetchRedeemedRewards: async (_parentId: string): Promise<{ child_id: string; reward_id: string }[]> => {
    return localStorageService.fetchRedeemedRewards();
  },

  /**
   * Marks a task as completed by the child.
   */
  completeTask: async (_parentId: string, childId: string, taskId: string): Promise<ChildTaskLog | null> => {
    return localStorageService.completeTask(childId, taskId);
  },

  /**
   * Submits an exemption request for a task.
   */
  submitExemptionRequest: async (_parentId: string, childId: string, taskId: string, reason: string): Promise<ChildTaskLog | null> => {
    return localStorageService.submitExemptionRequest(childId, taskId, reason);
  },

  approveExcuse: async (logId: string): Promise<boolean> => {
    return localStorageService.approveExemption(logId);
  },

  approveExemption: async (logId: string): Promise<boolean> => {
    return localStorageService.approveExemption(logId);
  },

  rejectExemption: async (logId: string): Promise<boolean> => {
    return localStorageService.rejectExemption(logId);
  },

  /**
   * Retrieves logs for all children of a parent.
   */
  fetchChildLogs: async (_parentId: string): Promise<ChildTaskLog[]> => {
    return localStorageService.fetchChildLogs();
  },

  /**
   * Retrieves pending verifications.
   */
  fetchPendingVerifications: async (_parentId: string): Promise<VerificationRequest[]> => {
    return localStorageService.fetchPendingVerifications();
  },

  /**
   * Verifies a task.
   */
  verifyTask: async (logId: string, childId: string, rewardValue: number): Promise<boolean> => {
    return localStorageService.verifyTask(logId, childId, rewardValue);
  },

  /**
   * Rejects a task verification.
   */
  rejectTask: async (logId: string, reason: string): Promise<boolean> => {
    return localStorageService.rejectTask(logId, reason);
  },

  /**
   * Logs a failed task (missed deadline).
   */
  logFailedTask: async (_parentId: string, childId: string, taskId: string, date: string): Promise<ChildTaskLog | null> => {
    return localStorageService.logFailedTask(childId, taskId, date);
  },

  /**
   * Logs multiple failed tasks in a batch.
   */
  logFailedTasksBatch: async (_parentId: string, items: { childId: string; taskId: string; date: string }[]): Promise<ChildTaskLog[]> => {
    return localStorageService.logFailedTasksBatch(items);
  },

  /**
   * Redeems a reward.
   */
  redeemReward: async (childId: string, cost: number, rewardId?: string): Promise<boolean> => {
    return localStorageService.redeemReward(childId, cost, rewardId);
  },

  /**
   * Manually adjusts a child's balance.
   */
  manualAdjustment: async (_parentId: string, childId: string, amount: number, reason?: string): Promise<boolean> => {
    return localStorageService.manualAdjustment(childId, amount, reason);
  },

  /**
   * Verifies the entered PIN.
   */
  checkAdminPin: async (_parentId: string, pin: string): Promise<boolean> => {
    return localStorageService.checkAdminPin(pin);
  },

  /**
   * Restores data from backup.
   */
  restoreBackup: async (_userId: string, data: any): Promise<{ success: boolean; error?: any }> => {
    try {
      await localStorageService.restoreBackup(data);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  /**
   * Clears all data from the database.
   */
  clearAll: async (): Promise<void> => {
    return localStorageService.clearAll();
  }
};
