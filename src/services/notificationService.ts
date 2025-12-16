import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { useAppStore } from '../store/useAppStore';

// Notification IDs
const NOTIFICATION_IDS = {
    PENDING_ADMIN: 1001,
    MISSED_CHILD: 2001,
    MISSED_DAILY_REPORT: 3001,
};

export const notificationService = {
    /**
     * Initialize notifications: Check and request permissions.
     * Should be called on app mount.
     */
    init: async () => {
        if (!Capacitor.isNativePlatform()) return;
        try {
            const { display } = await LocalNotifications.checkPermissions();

            if (display !== 'granted') {
                const { display: newDisplay } = await LocalNotifications.requestPermissions();
                if (newDisplay === 'granted') {
                    console.log('Notification permissions granted');
                }
            }
        } catch (error) {
            console.error('Error initializing notifications:', error);
        }
    },

    /**
     * Schedule a notification for Admin when there are pending tasks.
     * Delays 15 minutes to avoid spamming while reviewing.
     */
    schedulePendingAdminNotification: async (count: number) => {
        if (!Capacitor.isNativePlatform()) return;
        const { notificationsEnabled } = useAppStore.getState();
        if (!notificationsEnabled) return;

        try {
            // Always cancel existing to reset the debounce timer
            await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_IDS.PENDING_ADMIN }] });

            if (count <= 0) return;

            const triggerDate = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: 'Verifikasi Tugas Mendesak!',
                        body: `Ada ${count} tugas anak yang menunggu persetujuan Anda.`,
                        id: NOTIFICATION_IDS.PENDING_ADMIN,
                        schedule: { at: triggerDate },
                        sound: 'beep.wav',
                        attachments: [],
                        actionTypeId: '',
                        extra: null
                    }
                ]
            });
            console.log('Scheduled pending admin notification for', triggerDate);
        } catch (error) {
            console.error('Error scheduling admin notification:', error);
        }
    },

    /**
     * Schedule a notification for Child when tasks are missed in the evening.
     * Scheduled for 8:00 PM (20:00) if called after 7:00 PM (19:00).
     * If count is 0, it cancels any pending notification.
     */
    scheduleMissedChildNotification: async (count: number) => {
        if (!Capacitor.isNativePlatform()) return;
        const { notificationsEnabled } = useAppStore.getState();
        if (!notificationsEnabled) return;

        try {
            // Always cancel existing first
            await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_IDS.MISSED_CHILD }] });

            if (count <= 0) {
                console.log('Cancelled missed child notification (no incomplete tasks)');
                return;
            }

            const now = new Date();
            const targetTime = new Date();
            targetTime.setHours(20, 0, 0, 0); // 8:00 PM

            // Only schedule if it's currently between 7 PM and 8 PM (approx) 
            // If it's already past 8 PM, don't schedule for today.
            if (now.getTime() > targetTime.getTime()) return;

            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: 'Waktu Tugas Hampir Habis! ⏰',
                        body: `Jangan lupa selesaikan ${count} misi harian sebelum tidur!`,
                        id: NOTIFICATION_IDS.MISSED_CHILD,
                        schedule: { at: targetTime },
                        sound: 'beep.wav',
                        attachments: [],
                        actionTypeId: '',
                        extra: null
                    }
                ]
            });
            console.log('Scheduled missed child notification for', targetTime);
        } catch (error) {
            console.error('Error scheduling child notification:', error);
        }
    },

    /**
     * Schedule a daily report notification for Admin.
     * Called after daily reset.
     */
    scheduleMissedDailyReport: async (missedCount: number) => {
        if (!Capacitor.isNativePlatform()) return;
        const { notificationsEnabled } = useAppStore.getState();
        if (!notificationsEnabled || missedCount <= 0) return;

        try {
            // Cancel existing
            await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_IDS.MISSED_DAILY_REPORT }] });

            // Schedule for 7:00 AM next day? 
            // Or if this is called *during* reset (which happens on app open next day), schedule immediately?
            // "Notifikasi Daily Report dipicu tepat setelah proses reset tengah malam selesai."
            // If reset happens at midnight (background) or next morning (app open), we probably want to show it immediately if it's morning.

            // Let's schedule it for 1 minute from now to ensure it pops up, 
            // or if we want it strictly at 7 AM, we need to check time.
            // Assuming reset happens when parent opens app in morning:
            const triggerDate = new Date(Date.now() + 1000); // 1 second delay

            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: 'Laporan Harian 📊',
                        body: `Kemarin ada ${missedCount} misi yang terlewat.Cek detailnya di aplikasi.`,
                        id: NOTIFICATION_IDS.MISSED_DAILY_REPORT,
                        schedule: { at: triggerDate },
                        sound: 'beep.wav',
                        attachments: [],
                        actionTypeId: '',
                        extra: null
                    }
                ]
            });
            console.log('Scheduled daily report notification');
        } catch (error) {
            console.error('Error scheduling daily report:', error);
        }
    }
};
