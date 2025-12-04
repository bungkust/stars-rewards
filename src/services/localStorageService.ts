import type { Child, Task, Reward, ChildTaskLog, CoinTransaction, VerificationRequest, Profile } from '../types';

const STORAGE_KEY = 'stars-rewards-db';

interface LocalDB {
    profile: Profile | null;
    children: Child[];
    tasks: Task[];
    rewards: Reward[];
    logs: ChildTaskLog[];
    transactions: CoinTransaction[];
}

const getDB = (): LocalDB => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        return {
            profile: null,
            children: [],
            tasks: [],
            rewards: [],
            logs: [],
            transactions: []
        };
    }
    return JSON.parse(stored);
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
            created_at: new Date().toISOString()
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
            required_task_count: reward.required_task_count
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

    fetchChildLogs: async (): Promise<ChildTaskLog[]> => {
        const db = getDB();
        return db.logs.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()).slice(0, 100);
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
        return db.transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 50);
    },

    // --- Backup / Restore ---

    restoreBackup: async (data: any): Promise<boolean> => {
        try {
            // Basic validation
            if (!data || typeof data !== 'object') return false;
            // Allow if children OR tasks exist (partial backups might be possible, but let's be lenient)
            if (!Array.isArray(data.children) && !Array.isArray(data.tasks)) return false;

            // Reconstruct Profile if missing but flat fields exist
            let profile = data.profile;
            if (!profile && (data.adminName || data.familyName)) {
                profile = {
                    id: 'local-user',
                    created_at: new Date().toISOString(),
                    pin_admin: data.adminPin || '0000',
                    family_name: data.familyName || 'My Family',
                    parent_name: data.adminName || 'Parent'
                };
            }

            // Ensure structure matches LocalDB
            const newDB: LocalDB = {
                profile: profile || null,
                children: data.children || [],
                tasks: data.tasks || [],
                rewards: data.rewards || [],
                logs: data.logs || data.childLogs || [], // Handle both keys if they differ
                transactions: data.transactions || []
            };

            saveDB(newDB);
            return true;
        } catch (error) {
            console.error('Restore failed:', error);
            return false;
        }
    }
};
