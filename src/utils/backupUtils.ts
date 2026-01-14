import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
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
            categories: state.categories,
            // Settings
            isAdminMode: state.isAdminMode,
            notificationsEnabled: state.notificationsEnabled,
            adminName: state.adminName,
            familyName: state.familyName,
            adminPin: state.adminPin,
            onboardingStep: state.onboardingStep,
            lastMissedCheckDate: state.lastMissedCheckDate,
            userProfile: state.userProfile,
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
    const requiredArrays = ['children', 'tasks', 'rewards', 'categories'];
    for (const key of requiredArrays) {
        if (!Array.isArray(data.data[key])) return false;
    }

    return true;
};

export const downloadBackupFile = async (data: string, filename: string = 'stars-rewards-backup.json') => {
    if (Capacitor.isNativePlatform()) {
        try {
            // Explicitly request permissions as requested by the user.
            // Note: On Android 13+ (API 33), WRITE_EXTERNAL_STORAGE is deprecated and may not show a popup,
            // or it may be automatically granted/denied based on scoped storage rules.
            // We request it anyway to satisfy the requirement for older versions and compliance checks.
            try {
                const check = await Filesystem.checkPermissions();
                if (check.publicStorage !== 'granted') {
                    const request = await Filesystem.requestPermissions();
                    if (request.publicStorage !== 'granted') {
                        // On Android 11+, this might be denied but we can still write to public folders via MediaStore/Scoped Storage
                        console.warn('[Backup] Storage permission denied by user or system. Attempting scoped storage write...');
                    }
                }
            } catch (permError) {
                console.warn('[Backup] Error requesting permissions:', permError);
            }

            // Try writing to Documents folder (Standard Public Location)
            try {
                await Filesystem.writeFile({
                    path: filename,
                    data: data,
                    directory: Directory.Documents,
                    encoding: Encoding.UTF8,
                    recursive: true
                });

                // Log the actual URI to confirm location
                try {
                    await Filesystem.getUri({
                        path: filename,
                        directory: Directory.Documents
                    });
                } catch (uriError) {
                    console.warn('[Backup] Failed to get URI:', uriError);
                }

                return true;
            } catch (docError) {
                console.warn('[Backup] Failed to write to Documents, trying External/Download...', docError);

                // Fallback to Download folder in External storage (Private/App-specific usually)
                try {
                    await Filesystem.writeFile({
                        path: `Download/${filename}`,
                        data: data,
                        directory: Directory.External,
                        encoding: Encoding.UTF8,
                        recursive: true
                    });
                    return true;
                } catch (extError) {
                    console.error('[Backup] Failed to write to Directory.External', extError);
                    throw extError;
                }
            }
        } catch (e) {
            console.error('[Backup] Filesystem write failed completely', e);
            throw e;
        }
    } else {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    }
};
