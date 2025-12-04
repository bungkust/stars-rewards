import type { AppState } from '../store/useAppStore';

export interface BackupData {
    version: number;
    timestamp: string;
    data: Partial<AppState>;
}

const BACKUP_VERSION = 1;

export const generateBackupData = (state: AppState): string => {
    const backup: BackupData = {
        version: BACKUP_VERSION,
        timestamp: new Date().toISOString(),
        data: {
            children: state.children,
            tasks: state.tasks,
            rewards: state.rewards,
            childLogs: state.childLogs,
            transactions: state.transactions,
            redeemedHistory: state.redeemedHistory,
            pendingVerifications: state.pendingVerifications,
            // Settings
            isAdminMode: state.isAdminMode,
            notificationsEnabled: state.notificationsEnabled,
            adminName: state.adminName,
            familyName: state.familyName,
            adminPin: state.adminPin,
            onboardingStep: state.onboardingStep,
        },
    };

    return JSON.stringify(backup, null, 2);
};

export const validateBackupData = (data: any): boolean => {
    if (!data || typeof data !== 'object') return false;
    if (data.version !== BACKUP_VERSION) {
        console.warn('Backup version mismatch');
        // We could handle migration here if needed in future
    }
    if (!data.data || typeof data.data !== 'object') return false;

    // Basic check for required arrays
    const requiredArrays = ['children', 'tasks', 'rewards'];
    for (const key of requiredArrays) {
        if (!Array.isArray(data.data[key])) return false;
    }

    return true;
};

export const downloadBackupFile = (data: string, filename: string = 'stars-rewards-backup.json') => {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
