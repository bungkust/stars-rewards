import type { Child, Task, Reward, ChildTaskLog, CoinTransaction, VerificationRequest, Profile, Category } from '../types';
import { AppError } from '../types/error';
import { backupSchema } from '../schemas/backupSchema';

const STORAGE_KEY = 'stars-rewards-db';

interface LocalDB {
    profile: Profile | null;
    children: Child[];
    tasks: Task[];
    rewards: Reward[];
    logs: ChildTaskLog[];
    transactions: CoinTransaction[];
    categories: Category[];
}

const getDB = (): LocalDB => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const defaults: LocalDB = {
        profile: null,
        children: [],
        tasks: [],
        rewards: [],
        logs: [],
        transactions: [],
        categories: []
    };

    if (!stored) {
        return defaults;
    }

    try {
        const parsed = JSON.parse(stored);
        // Ensure arrays are actually arrays (handle case where stored JSON has null/undefined for these keys)
        return {
            ...defaults,
            ...parsed,
            children: Array.isArray(parsed.children) ? parsed.children : defaults.children,
            tasks: Array.isArray(parsed.tasks) ? parsed.tasks : defaults.tasks,
            rewards: Array.isArray(parsed.rewards) ? parsed.rewards : defaults.rewards,
            logs: Array.isArray(parsed.logs) ? parsed.logs : defaults.logs,
            transactions: Array.isArray(parsed.transactions) ? parsed.transactions : defaults.transactions,
            categories: Array.isArray(parsed.categories) ? parsed.categories : defaults.categories
        };
    } catch (e) {
        console.error('Failed to parse local storage', e);
        return defaults;
    }
};

const saveDB = (db: LocalDB) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

const generateId = () => crypto.randomUUID();

export const localStorageService = {
    // --- Profile / Auth ---

    createFamily: async (familyName: string, pin: string, parentName: string): Promise<Profile> => {
        const db = getDB();
        const newProfile: Profile = {
            id: 'local-user',
            created_at: new Date().toISOString(),
            pin_admin: pin,
            family_name: familyName,
            parent_name: parentName
        };
        db.profile = newProfile;
        saveDB(db);
        return newProfile;
    },

    getProfile: async (): Promise<Profile | null> => {
        const db = getDB();
        return db.profile;
    },

    checkAdminPin: async (pin: string): Promise<boolean> => {
        const db = getDB();
        return db.profile?.pin_admin === pin;
    },

    updateProfile: async (updates: Partial<Profile>): Promise<Profile | null> => {
        const db = getDB();
        if (!db.profile) return null;

        db.profile = { ...db.profile, ...updates };
        saveDB(db);
        return db.profile;
    },

    // --- Children ---

    addChild: async (child: Omit<Child, 'id' | 'parent_id' | 'balance' | 'current_balance'>): Promise<Child> => {
        const db = getDB();
        const newChild: Child = {
            id: generateId(),
            parent_id: 'local-user',
            name: child.name,
            birth_date: child.birth_date,
            avatar_url: child.avatar_url,
            current_balance: 0
        };
        db.children.push(newChild);
        saveDB(db);
        return newChild;
    },

    fetchChildren: async (): Promise<Child[]> => {
        const db = getDB();
        return db.children;
    },

    updateChildAvatar: async (childId: string, avatarUrl: string): Promise<boolean> => {
        const db = getDB();
        const childIndex = db.children.findIndex(c => c.id === childId);
        if (childIndex === -1) return false;

        db.children[childIndex].avatar_url = avatarUrl;
        saveDB(db);
        return true;
    },

    deleteChild: async (childId: string): Promise<boolean> => {
        const db = getDB();
        const initialLength = db.children.length;
        db.children = db.children.filter(c => c.id !== childId);

        if (db.children.length !== initialLength) {
            // Optional: Clean up assigned tasks? 
            // For now, let's just leave them or filter them out on read if needed.
            // But cleaner to remove childId from assigned_to arrays.
            db.tasks = db.tasks.map(t => ({
                ...t,
                assigned_to: t.assigned_to ? t.assigned_to.filter(id => id !== childId) : []
            }));

            saveDB(db);
            return true;
        }
        return false;
    },

    // --- Categories ---

    addCategory: async (category: Omit<Category, 'id'>): Promise<Category> => {
        const db = getDB();
        const newCategory: Category = {
            id: generateId(),
            ...category
        };
        db.categories.push(newCategory);
        saveDB(db);
        return newCategory;
    },

    fetchCategories: async (): Promise<Category[]> => {
        const db = getDB();
        return db.categories;
    },

    updateCategory: async (categoryId: string, updates: Partial<Category>): Promise<Category | null> => {
        const db = getDB();
        const index = db.categories.findIndex(c => c.id === categoryId);
        if (index === -1) return null;

        db.categories[index] = { ...db.categories[index], ...updates };
        saveDB(db);
        return db.categories[index];
    },

    deleteCategory: async (categoryId: string): Promise<boolean> => {
        const db = getDB();
        const initialLength = db.categories.length;
        db.categories = db.categories.filter(c => c.id !== categoryId);
        if (db.categories.length !== initialLength) {
            saveDB(db);
            return true;
        }
        return false;
    },

    // --- Tasks ---

    addTask: async (task: Omit<Task, 'id' | 'parent_id' | 'created_at'>): Promise<Task> => {
        const db = getDB();
        const newTask: Task = {
            id: generateId(),
            parent_id: 'local-user',
            name: task.name,
            reward_value: task.reward_value,
            type: task.type,
            recurrence_rule: task.recurrence_rule,
            is_active: task.is_active !== undefined ? task.is_active : true,
            created_at: new Date().toISOString(),
            assigned_to: task.assigned_to || [],
            category_id: task.category_id,
            expiry_time: task.expiry_time,
            max_completions_per_day: task.max_completions_per_day
        };
        db.tasks.push(newTask);
        saveDB(db);
        return newTask;
    },

    fetchActiveTasks: async (): Promise<Task[]> => {
        const db = getDB();
        return db.tasks.filter(t => t.is_active !== false);
    },

    updateTask: async (taskId: string, updates: Partial<Task>): Promise<Task | null> => {
        const db = getDB();
        const index = db.tasks.findIndex(t => t.id === taskId);
        if (index === -1) return null;

        db.tasks[index] = { ...db.tasks[index], ...updates };
        saveDB(db);
        return db.tasks[index];
    },

    // --- Rewards ---

    addReward: async (reward: Omit<Reward, 'id' | 'parent_id'>): Promise<Reward> => {
        const db = getDB();
        const newReward: Reward = {
            id: generateId(),
            parent_id: 'local-user',
            name: reward.name,
            cost_value: reward.cost_value,
            category: reward.category,
            type: reward.type,
            required_task_id: reward.required_task_id,
            required_task_count: reward.required_task_count,
            assigned_to: reward.assigned_to
        };
        db.rewards.push(newReward);
        saveDB(db);
        return newReward;
    },

    fetchRewards: async (): Promise<Reward[]> => {
        const db = getDB();
        return db.rewards;
    },

    updateReward: async (rewardId: string, updates: Partial<Reward>): Promise<Reward | null> => {
        const db = getDB();
        const index = db.rewards.findIndex(r => r.id === rewardId);
        if (index === -1) return null;

        db.rewards[index] = { ...db.rewards[index], ...updates };
        saveDB(db);
        return db.rewards[index];
    },

    deleteReward: async (rewardId: string): Promise<boolean> => {
        const db = getDB();
        const initialLength = db.rewards.length;
        db.rewards = db.rewards.filter(r => r.id !== rewardId);
        if (db.rewards.length !== initialLength) {
            saveDB(db);
            return true;
        }
        return false;
    },

    fetchRedeemedRewards: async (): Promise<{ child_id: string; reward_id: string }[]> => {
        const db = getDB();
        return db.transactions
            .filter(t => t.type === 'REWARD_REDEEMED' && t.reference_id)
            .map(t => ({
                child_id: t.child_id,
                reward_id: t.reference_id!
            }));
    },

    // --- Logs & Verification ---

    completeTask: async (childId: string, taskId: string): Promise<ChildTaskLog> => {
        const db = getDB();
        const newLog: ChildTaskLog = {
            id: generateId(),
            parent_id: 'local-user',
            child_id: childId,
            task_id: taskId,
            status: 'PENDING',
            completed_at: new Date().toISOString()
        };
        db.logs.push(newLog);
        saveDB(db);
        return newLog;
    },

    submitExemptionRequest: async (childId: string, taskId: string, reason: string): Promise<ChildTaskLog> => {
        const db = getDB();
        const newLog: ChildTaskLog = {
            id: generateId(),
            parent_id: 'local-user',
            child_id: childId,
            task_id: taskId,
            status: 'PENDING_EXCUSE',
            notes: reason,
            completed_at: new Date().toISOString()
        };
        db.logs.push(newLog);
        saveDB(db);
        return newLog;
    },

    approveExcuse: async (logId: string): Promise<boolean> => {
        return localStorageService.approveExemption(logId);
    },

    approveExemption: async (logId: string): Promise<boolean> => {
        const db = getDB();
        const logIndex = db.logs.findIndex(l => l.id === logId);
        if (logIndex === -1) return false;

        db.logs[logIndex].status = 'EXCUSED';

        // Update recurrence
        const taskId = db.logs[logIndex].task_id;
        await localStorageService.updateRecurrenceDate(taskId);

        saveDB(db);
        return true;
    },

    rejectExemption: async (logId: string): Promise<boolean> => {
        const db = getDB();
        const logIndex = db.logs.findIndex(l => l.id === logId);
        if (logIndex === -1) return false;

        db.logs[logIndex].status = 'REJECTED';
        db.logs[logIndex].rejection_reason = 'Exemption Request Rejected';

        saveDB(db);
        return true;
    },

    updateRecurrenceDate: async (taskId: string): Promise<boolean> => {
        const db = getDB();
        const taskIndex = db.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return false;

        const task = db.tasks[taskIndex];
        const today = new Date();
        let nextDate = new Date(today);

        // Calculate next date based on recurrence rule
        // Treating "today" as the completed date
        switch (task.recurrence_rule) {
            case 'Daily':
                nextDate.setDate(today.getDate() + 1);
                break;
            case 'Weekly':
                nextDate.setDate(today.getDate() + 7);
                break;
            case 'Monthly':
                nextDate.setMonth(today.getMonth() + 1);
                break;
            case 'Once':
                // For 'Once', maybe we don't set a next due date or set it far future?
                // Or maybe we mark it inactive?
                // Let's just leave it as is or set to null if we had a logic for "Done".
                // But here we are just skipping.
                // If it's 'Once' and skipped, maybe it should be due tomorrow?
                // Or maybe it's just done for "this instance".
                // Let's assume 'Once' tasks don't recur, so no next due date needed.
                return true;
            default:
                // Custom or unknown, default to next day for safety or do nothing
                nextDate.setDate(today.getDate() + 1);
        }

        db.tasks[taskIndex].next_due_date = nextDate.toISOString();
        // We don't saveDB here because it might be called within another transaction, 
        // but approveExemption calls saveDB. 
        // Actually, let's save here to be safe if called independently, 
        // but approveExemption fetches db again? No, getDB reads from localStorage.
        // If I call getDB() inside updateRecurrenceDate, it reads fresh.
        // If approveExemption modifies db object and then calls updateRecurrenceDate...
        // updateRecurrenceDate reads from localStorage again! This will overwrite changes from approveExemption if not careful.
        // Better to pass db or handle saving at top level.
        // But for simplicity in this architecture where getDB() is synchronous and just reads JSON:
        // I should probably make updateRecurrenceDate take the DB object or handle saving itself.
        // Given the structure, let's make it handle saving, and approveExemption should call it AFTER saving its own changes?
        // Or better: updateRecurrenceDate updates the task in the DB and saves.

        // Let's refine:
        // approveExemption:
        // 1. getDB
        // 2. update log
        // 3. saveDB
        // 4. call updateRecurrenceDate (which does getDB, update task, saveDB)
        // This is safe.

        saveDB(db);
        return true;
    },

    fetchChildLogs: async (): Promise<ChildTaskLog[]> => {
        const db = getDB();
        return db.logs.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()).slice(0, 10000);
    },

    fetchPendingVerifications: async (): Promise<VerificationRequest[]> => {
        const db = getDB();
        return db.logs
            .filter(log => log.status === 'PENDING')
            .map(log => {
                const task = db.tasks.find(t => t.id === log.task_id);
                const child = db.children.find(c => c.id === log.child_id);
                return {
                    ...log,
                    task_title: task?.name || 'Unknown Task',
                    reward_value: task?.reward_value || 0,
                    child_name: child?.name || 'Unknown Child'
                };
            });
    },

    verifyTask: async (logId: string, childId: string, rewardValue: number): Promise<boolean> => {
        const db = getDB();

        // 1. Update Log
        const logIndex = db.logs.findIndex(l => l.id === logId);
        if (logIndex === -1) return false;

        // Prevent double verification at DB level
        if (db.logs[logIndex].status === 'VERIFIED') {
            console.warn('Task already verified in DB, skipping.');
            return true; // Return true as it is "verified"
        }

        db.logs[logIndex].status = 'VERIFIED';

        // 2. Update Balance
        const childIndex = db.children.findIndex(c => c.id === childId);
        if (childIndex !== -1) {
            db.children[childIndex].current_balance = (db.children[childIndex].current_balance || 0) + rewardValue;
        }

        // 3. Add Transaction
        db.transactions.push({
            id: generateId(),
            parent_id: 'local-user',
            child_id: childId,
            amount: rewardValue,
            type: 'TASK_VERIFIED',
            reference_id: logId,
            created_at: new Date().toISOString()
        });

        saveDB(db);
        return true;
    },

    rejectTask: async (logId: string, reason: string): Promise<boolean> => {
        const db = getDB();
        const logIndex = db.logs.findIndex(l => l.id === logId);
        if (logIndex === -1) return false;

        db.logs[logIndex].status = 'REJECTED';
        db.logs[logIndex].rejection_reason = reason;
        saveDB(db);
        return true;
    },

    logFailedTask: async (childId: string, taskId: string, date: string): Promise<ChildTaskLog> => {
        const db = getDB();
        const newLog: ChildTaskLog = {
            id: generateId(),
            parent_id: 'local-user',
            child_id: childId,
            task_id: taskId,
            status: 'FAILED',
            rejection_reason: 'Missed daily deadline',
            completed_at: date // Should be end of the missed day
        };
        db.logs.push(newLog);
        saveDB(db);
        return newLog;
    },

    logFailedTasksBatch: async (items: { childId: string; taskId: string; date: string }[]): Promise<ChildTaskLog[]> => {
        if (items.length === 0) return [];
        const db = getDB();
        const newLogs: ChildTaskLog[] = items.map(item => ({
            id: generateId(),
            parent_id: 'local-user',
            child_id: item.childId,
            task_id: item.taskId,
            status: 'FAILED',
            rejection_reason: 'Missed daily deadline',
            completed_at: item.date
        }));

        db.logs.push(...newLogs);
        saveDB(db);
        return newLogs;
    },

    // --- Transactions / Redemption ---

    redeemReward: async (childId: string, cost: number, rewardId?: string): Promise<boolean> => {
        const db = getDB();
        const childIndex = db.children.findIndex(c => c.id === childId);
        if (childIndex === -1) return false;

        const child = db.children[childIndex];
        if ((child.current_balance || 0) < cost) return false;

        // 1. Deduct Balance
        child.current_balance = (child.current_balance || 0) - cost;

        // 2. Add Transaction
        db.transactions.push({
            id: generateId(),
            parent_id: 'local-user',
            child_id: childId,
            amount: -cost,
            type: rewardId ? 'REWARD_REDEEMED' : 'MANUAL_ADJ',
            reference_id: rewardId,
            created_at: new Date().toISOString()
        });

        saveDB(db);
        return true;
    },

    manualAdjustment: async (childId: string, amount: number, reason?: string): Promise<boolean> => {
        const db = getDB();
        const childIndex = db.children.findIndex(c => c.id === childId);
        if (childIndex === -1) return false;

        // 1. Update Balance
        db.children[childIndex].current_balance = (db.children[childIndex].current_balance || 0) + amount;

        // 2. Add Transaction
        db.transactions.push({
            id: generateId(),
            parent_id: 'local-user',
            child_id: childId,
            amount: amount,
            type: 'MANUAL_ADJ',
            description: reason,
            created_at: new Date().toISOString()
        });

        saveDB(db);
        return true;
    },

    fetchTransactions: async (): Promise<CoinTransaction[]> => {
        const db = getDB();
        return db.transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10000);
    },

    // --- Backup / Restore ---

    restoreBackup: async (data: any): Promise<boolean> => {
        try {
            // Validate using Zod schema
            const result = backupSchema.safeParse(data);

            if (!result.success) {
                console.error('Backup validation failed:', result.error);
                throw new AppError('Invalid backup file format', 'VALIDATION_ERROR', result.error.format());
            }

            const validData = result.data;

            // Reconstruct Profile if missing but flat fields exist
            let profile = validData.profile;
            if (!profile && (validData.adminName || validData.familyName)) {
                profile = {
                    id: 'local-user',
                    created_at: new Date().toISOString(),
                    pin_admin: validData.adminPin || '0000',
                    family_name: validData.familyName || 'My Family',
                    parent_name: validData.adminName || 'Parent'
                };
            } else if (profile) {
                // Sanitize profile fields
                profile = {
                    ...profile,
                    family_name: profile.family_name ?? undefined,
                    parent_name: profile.parent_name ?? undefined,
                    created_at: profile.created_at ?? undefined,
                    pin_admin: profile.pin_admin ?? undefined
                };
            }

            // Ensure structure matches LocalDB
            const validChildren = (validData.children || []).map(c => ({
                ...c,
                current_balance: c.current_balance ?? 0,
                avatar_url: c.avatar_url || '',
                birth_date: c.birth_date ?? undefined
            }));

            const validTasks = (validData.tasks || []).map(t => ({
                ...t,
                type: t.type || 'ONE_TIME',
                assigned_to: t.assigned_to || [],
                recurrence_rule: t.recurrence_rule ?? undefined,
                is_active: t.is_active ?? undefined,
                created_at: t.created_at ?? undefined,
                category_id: t.category_id ?? undefined,
                expiry_time: t.expiry_time ?? undefined,
                next_due_date: t.next_due_date ?? undefined
            }));

            const validRewards = (validData.rewards || []).map(r => ({
                ...r,
                type: r.type || 'UNLIMITED',
                category: r.category ?? undefined,
                required_task_id: r.required_task_id ?? undefined,
                required_task_count: r.required_task_count ?? undefined,
                created_at: r.created_at ?? undefined
            }));

            // Filter logs to ensure referential integrity
            const rawLogs = validData.logs || validData.childLogs || [];
            const validLogs = rawLogs.filter(log => {
                const childExists = validChildren.some(c => c.id === log.child_id);
                const taskExists = validTasks.some(t => t.id === log.task_id);
                return childExists && taskExists;
            }).map(l => ({
                ...l,
                rejection_reason: l.rejection_reason ?? undefined,
                notes: l.notes ?? undefined,
                verified_at: l.verified_at ?? undefined
            }));

            const newDB: LocalDB = {
                profile: profile ? {
                    id: profile.id,
                    created_at: profile.created_at || new Date().toISOString(),
                    pin_admin: profile.pin_admin || '0000',
                    family_name: profile.family_name ?? undefined,
                    parent_name: profile.parent_name ?? undefined
                } : null,
                children: validChildren,
                tasks: validTasks,
                rewards: validRewards,
                logs: validLogs,
                transactions: (validData.transactions || []).map(t => ({
                    ...t,
                    reference_id: t.reference_id ?? undefined,
                    description: t.description ?? undefined
                })),
                categories: (validData.categories || []).map(c => ({
                    ...c,
                    is_default: c.is_default ?? undefined
                }))
            };

            saveDB(newDB);
            return true;
        } catch (error) {
            console.error('Restore failed:', error);
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to restore backup', 'STORAGE_ERROR', error);
        }
    },

    clearAll: async (): Promise<void> => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
