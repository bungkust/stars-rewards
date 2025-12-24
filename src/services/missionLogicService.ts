import { dataService } from './dataService';
import type { Child, Task, ChildTaskLog } from '../types';
import { parseRRule, isDateValid } from '../utils/recurrence';
import { getLocalDateString, getTodayLocalStart, getLocalStartOfDay, isResetNeeded } from '../utils/timeUtils';

export interface MissionCheckResult {
    newLogs: ChildTaskLog[];
    updatedTasks: Task[];
    lastCheckedDate: string;
}

export const missionLogicService = {
    /**
   * Increments the streak for a task and persists the change.
   */
    incrementStreak: async (taskId: string, tasks: Task[], childLogs: ChildTaskLog[], currentLogId: string): Promise<Task[]> => {
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return tasks;

        // Check if streak was already incremented today by another log
        const todayStr = getLocalDateString();
        const alreadyIncremented = childLogs.some(l =>
            l.task_id === taskId &&
            l.id !== currentLogId &&
            ['VERIFIED', 'EXCUSED'].includes(l.status) &&
            getLocalDateString(new Date(l.completed_at)) === todayStr
        );

        if (alreadyIncremented) {
            return tasks;
        }

        const task = tasks[taskIndex];
        const currentStreak = (task.current_streak || 0) + 1;
        const bestStreak = Math.max(task.best_streak || 0, currentStreak);

        // Persist to DB
        await dataService.updateTask(taskId, { current_streak: currentStreak, best_streak: bestStreak });

        // Return updated tasks array
        const newTasks = [...tasks];
        newTasks[taskIndex] = { ...task, current_streak: currentStreak, best_streak: bestStreak };
        return newTasks;
    },

    /**
     * Checks for missed missions from past days and expired missions for today.
     * This function orchestrates the logic and calls dataService to persist changes.
     */
    checkMissedMissions: async (
        children: Child[],
        tasks: Task[],
        childLogs: ChildTaskLog[],
        lastMissedCheckDate?: string
    ): Promise<MissionCheckResult> => {
        const userId = 'local-user';
        const todayStr = getLocalDateString();
        const newLogs: ChildTaskLog[] = [];
        let updatedTasks = [...tasks];

        const batchItems: { childId: string; taskId: string; date: string }[] = [];

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

                                    // Also check if we already added it to the current batch to avoid dups in same run
                                    const inBatch = batchItems.some(item => item.childId === childId && item.taskId === task.id && item.date === checkDateIso);

                                    if (!alreadyFailed && !inBatch) {
                                        batchItems.push({ childId, taskId: task.id, date: checkDateIso });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // 2. Check for EXPIRED tasks for TODAY (ALWAYS RUN THIS)
        const activeTasks = tasks.filter(t => t.is_active !== false);
        const todayDate = getTodayLocalStart();
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTimeVal = currentHours * 60 + currentMinutes;

        for (const task of activeTasks) {
            if (!task.expiry_time) continue;

            // Parse expiry time
            const [expHour, expMinute] = task.expiry_time.split(':').map(Number);
            const expTimeVal = expHour * 60 + expMinute;

            if (currentTimeVal > expTimeVal) {
                // Task has expired for today. Check if it was due today.
                const checkDate = new Date(todayDate); // Today local start
                const checkDateStr = getLocalDateString(checkDate);
                const checkDateIso = checkDate.toISOString();

                // Don't check dates before the task existed
                const taskCreatedDate = new Date(task.created_at || new Date());
                const taskCreatedDateStr = getLocalDateString(taskCreatedDate);
                if (checkDateStr < taskCreatedDateStr) {
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

                if (isScheduled) {
                    const assignedChildren = (task.assigned_to || []).filter((id: string) => children.some(c => c.id === id));

                    for (const childId of assignedChildren) {
                        // Check if completed/failed/excused today
                        const hasLog = childLogs.some(log => {
                            if (log.child_id !== childId || log.task_id !== task.id) return false;
                            const logDate = new Date(log.completed_at);
                            return getLocalDateString(logDate) === checkDateStr;
                        });

                        if (!hasLog) {
                            // Check if we already logged a failure for today (to avoid duplicates on re-render)
                            // We check childLogs AND the current batch
                            const alreadyFailed = childLogs.some(l => l.child_id === childId && l.task_id === task.id && l.status === 'FAILED' && getLocalDateString(new Date(l.completed_at)) === checkDateStr);
                            const inBatch = batchItems.some(item => item.childId === childId && item.taskId === task.id && item.date === checkDateIso);

                            if (!alreadyFailed && !inBatch) {
                                batchItems.push({ childId, taskId: task.id, date: checkDateIso });
                            }
                        }
                    }
                }
            }
        }

        // 3. Process Batch
        if (batchItems.length > 0) {
            const logs = await dataService.logFailedTasksBatch(userId, batchItems);
            newLogs.push(...logs);
        }

        // 3. Handle Streak Resets & Notifications
        if (newLogs.length > 0) {
            // Reset streaks for failed tasks
            const failedTaskIds = new Set(newLogs.map(l => l.task_id));

            updatedTasks = tasks.map(t => {
                if (failedTaskIds.has(t.id)) {
                    // Reset streak to 0
                    dataService.updateTask(t.id, { current_streak: 0 });
                    return { ...t, current_streak: 0 };
                }
                return t;
            });

            // Schedule Missed Daily Report
            import('../services/notificationService').then(({ notificationService }) => {
                notificationService.scheduleMissedDailyReport(newLogs.length);
            });
        }

        return {
            newLogs,
            updatedTasks,
            lastCheckedDate: todayStr
        };
    }
};
