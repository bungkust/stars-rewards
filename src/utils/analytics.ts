import type { Task, ChildTaskLog, CoinTransaction, Child, Category } from '../types';
import { parseRRule, isDateValid } from './recurrence';
import { getLocalStartOfDay } from './timeUtils';

export type TimeFilter = 'today' | 'week' | 'month' | 'specific';

interface CoinMetrics {
    earned: number;
    spent: number;
    net: number;
}

export interface SuccessMetrics {
    rate: number;
    verified: number;
    failed: number;
    excused: number;
    pendingReview: number;
    todo: number;
    total: number;
}

// ... (TopTask interface)

interface ExceptionMetrics {
    rate: number;
    count: number;
    total: number;
}

// M2: Net Gain
export const calculateCoinMetrics = (transactions: CoinTransaction[]): CoinMetrics => {
    const earned = transactions
        .filter(t => t.amount > 0)
        .reduce((acc, t) => acc + t.amount, 0);

    const spent = transactions
        .filter(t => t.amount < 0)
        .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    return {
        earned,
        spent,
        net: earned - spent
    };
};

// M1: Success Ratio
export const getSuccessRatio = (
    logs: ChildTaskLog[],
    tasks: Task[],
    children: Child[],
    filter: TimeFilter,
    selectedChildId: string
): SuccessMetrics => {
    // 1. Calculate Total Expected (Theoretical Max) AND To Do
    let totalExpected = 0;
    let todo = 0;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let startDate = new Date(today);
    const endDate = new Date(today);

    if (filter === 'week') {
        startDate.setDate(today.getDate() - 6);
    } else if (filter === 'month') {
        startDate.setDate(today.getDate() - 29);
    }

    const activeTasks = tasks.filter(t => t.is_active !== false);

    // Filter Logs for the period first
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime() + (24 * 60 * 60 * 1000) - 1; // End of day

    const periodLogs = logs.filter(l => {
        if (selectedChildId !== 'all' && l.child_id !== selectedChildId) return false;
        const logTime = new Date(l.completed_at).getTime();
        return logTime >= startTimestamp && logTime <= endTimestamp;
    });

    // Iterate through each day in the range to calculate Total Expected (Recurring Only)
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const currentDate = new Date(d);
        const currentDateStr = getLocalStartOfDay(currentDate).toISOString().split('T')[0]; // YYYY-MM-DD

        activeTasks.forEach(task => {
            if (task.recurrence_rule === 'Once') return; // Handled separately

            const relevantChildren = (task.assigned_to || []).filter(childId => {
                if (selectedChildId !== 'all' && childId !== selectedChildId) return false;
                return children.some(c => c.id === childId);
            });

            if (relevantChildren.length === 0) return;

            if (task.recurrence_rule) {
                const options = parseRRule(task.recurrence_rule);
                const baseDate = new Date(task.created_at || new Date());

                if (isDateValid(currentDate, options, baseDate)) {
                    totalExpected += relevantChildren.length;

                    // Check if this specific instance was completed/handled
                    // We check if there is ANY log for this task on this day for each child
                    relevantChildren.forEach(childId => {
                        const isHandled = periodLogs.some(l => {
                            if (l.task_id !== task.id || l.child_id !== childId) return false;
                            // Compare dates (local YYYY-MM-DD)
                            const logDate = new Date(l.completed_at);
                            const logDateStr = getLocalStartOfDay(logDate).toISOString().split('T')[0];
                            return logDateStr === currentDateStr;
                        });

                        if (!isHandled) {
                            todo++;
                        }
                    });
                }
            }
        });
    }

    // Handle 'Once' tasks separately
    const todayTimestamp = today.getTime();
    const isTodayInPeriod = todayTimestamp >= startTimestamp && todayTimestamp <= endTimestamp;

    activeTasks.forEach(task => {
        // Handle 'Once' tasks separately (existing logic)
        if (task.recurrence_rule === 'Once') {
            const relevantChildren = (task.assigned_to || []).filter(childId => {
                if (selectedChildId !== 'all' && childId !== selectedChildId) return false;
                return children.some(c => c.id === childId);
            });

            relevantChildren.forEach(childId => {
                // Check if logged in period
                const log = logs.find(l => l.task_id === task.id && l.child_id === childId && ['VERIFIED', 'FAILED', 'REJECTED', 'EXCUSED'].includes(l.status));

                if (log) {
                    const logTime = new Date(log.completed_at).getTime();
                    if (logTime >= startTimestamp && logTime <= endTimestamp) {
                        totalExpected++;
                        // It is handled, so not todo
                    }
                } else {
                    // No log (Pending/To Do)
                    // If period includes today, it's a To Do
                    // BUT, we must check if it's scheduled for the future (next_due_date)
                    if (isTodayInPeriod) {
                        let isFuture = false;
                        if (task.next_due_date) {
                            const dueDate = new Date(task.next_due_date);
                            const localDueDate = getLocalStartOfDay(dueDate);
                            const localEndDate = getLocalStartOfDay(endDate);

                            // If due date is strictly after the end of the selected period, it's not a Todo yet
                            if (localDueDate > localEndDate) {
                                isFuture = true;
                            }
                        }

                        if (!isFuture) {
                            totalExpected++;
                            todo++;
                        }
                    }
                }
            });
            return;
        }

        // Handle Recurring Tasks Overdue Logic
        // If a recurring task is NOT scheduled for today (isDateValid false), 
        // BUT it has a next_due_date <= Today, it implies it is Overdue/Catch-up.
        // We should add it to totalExpected so it shows as "To Do".
        if (isTodayInPeriod && task.recurrence_rule && task.recurrence_rule !== 'Once') {
            let isOverdue = false;
            if (task.next_due_date) {
                const localDueDate = getLocalStartOfDay(new Date(task.next_due_date));
                const localStartDate = getLocalStartOfDay(startDate);
                // If due before the period started, it's an overdue carry-over
                if (localDueDate < localStartDate) {
                    isOverdue = true;
                }
            } else {
                // If no next_due_date, assume it's active and due (legacy or immediate)
                isOverdue = true;
            }

            if (isOverdue) {
                const relevantChildren = (task.assigned_to || []).filter(childId => {
                    if (selectedChildId !== 'all' && childId !== selectedChildId) return false;
                    return children.some(c => c.id === childId);
                });

                relevantChildren.forEach(childId => {
                    // Check if this child completed this task in the period
                    // If they did, it's already in 'processedCount' (verified/failed/etc)
                    // If NOT, it's a Todo
                    const isHandled = periodLogs.some(l => l.task_id === task.id && l.child_id === childId);

                    if (!isHandled) {
                        totalExpected++;
                        todo++;
                    }
                });
            }
        }
    });

    // 3. Count Statuses
    const verified = periodLogs.filter(l => l.status === 'VERIFIED').length;
    const failed = periodLogs.filter(l => l.status === 'FAILED' || l.status === 'REJECTED').length;
    const excused = periodLogs.filter(l => l.status === 'EXCUSED').length;
    const pendingReview = periodLogs.filter(l => l.status === 'PENDING' || l.status === 'PENDING_EXCUSE').length;

    // 4. Derive To Do
    // Todo is calculated directly above.
    // However, pendingReview tasks are technically "handled" (not todo), but we counted them as todo if they have no log?
    // Wait, pendingReview tasks HAVE logs (status=PENDING).
    // So `isHandled` check above handles them correctly (returns true).
    // So `todo` calculated above excludes pendingReview. Correct.

    // User Request: Only count 'todo' for 'today' filter.
    // For 'week' and 'month', do not include 'todo' in the stats.
    if (filter !== 'today') {
        todo = 0;
    }

    // 5. Calculate Rate
    // Rate = Verified / (Total Activity + Remaining Expected)
    const processedCount = verified + failed + excused + pendingReview;
    const adjustedTotal = processedCount + todo;

    // Denominator is the Adjusted Total
    const denominator = adjustedTotal;
    const rate = denominator <= 0 ? 0 : Math.round((verified / denominator) * 100);

    return {
        rate,
        verified,
        failed,
        excused,
        pendingReview,
        todo,
        total: adjustedTotal
    };
};

interface TopTask {
    id: string;
    name: string;
    count: number;
    percentage: number;
}

// ... (ExceptionMetrics interface remains same)

// ... (calculateCoinMetrics remains same)

// ... (getSuccessRatio remains same)

// M4: Top 3 Success / Fail
export const getTopTasks = (
    logs: ChildTaskLog[],
    tasks: Task[],
    type: 'success' | 'fail'
): TopTask[] => {
    // 1. Calculate Total Counts per Task (Denominator)
    const totalCounts: Record<string, number> = {};
    logs.forEach(l => {
        totalCounts[l.task_id] = (totalCounts[l.task_id] || 0) + 1;
    });

    // 2. Filter logs based on type (Numerator)
    const targetLogs = logs.filter(l => {
        if (type === 'success') return l.status === 'VERIFIED';
        if (type === 'fail') {
            // Reverted to only count actual failures as per user request ("Most Failed")
            return ['FAILED', 'REJECTED'].includes(l.status);
        }
        return false;
    });

    // 3. Count occurrences
    const counts: Record<string, number> = {};
    targetLogs.forEach(l => {
        counts[l.task_id] = (counts[l.task_id] || 0) + 1;
    });

    // 4. Convert to array, calculate percentage, and sort
    return Object.entries(counts)
        .map(([id, count]) => {
            const total = totalCounts[id] || 0;
            const percentage = total === 0 ? 0 : Math.round((count / total) * 100);
            return {
                id,
                name: tasks.find(t => t.id === id)?.name || 'Unknown Task',
                count,
                percentage
            };
        })
        .sort((a, b) => b.percentage - a.percentage) // Sort by percentage? Or count? Usually percentage is more meaningful for "Top" but count is good for volume. Let's stick to count for sorting but show percentage, OR user implied "Top" means highest percentage? "Top Complete" usually means most done. "Need Focus" usually means highest failure rate. 
        // Let's sort by COUNT for now as it shows volume of activity, but display PERCENTAGE. 
        // Actually, if a task was done 1/1 time (100%) vs 9/10 times (90%), the 9/10 is "more completed" in volume.
        // But for "Needs Focus", 1/1 failure (100%) is worse than 1/100 failure (1%).
        // Let's stick to sorting by COUNT (Volume) for "Top Success" and maybe PERCENTAGE for "Fail"?
        // The user just said "pake persentase aja" (use percentage).
        // Let's keep sorting by count (frequency) to highlight high-impact items, but display percentage.
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
};

// M5: Exception Rate
export const getExceptionRate = (logs: ChildTaskLog[]): ExceptionMetrics => {
    // Total "Attempted" or "Due" tasks = Verified + Failed + Rejected + Excused
    // We can approximate this by looking at ALL logs that are final states
    const finalLogs = logs.filter(l =>
        ['VERIFIED', 'FAILED', 'REJECTED', 'EXCUSED'].includes(l.status)
    );

    const total = finalLogs.length;
    const excusedCount = finalLogs.filter(l => l.status === 'EXCUSED').length;

    const rate = total === 0 ? 0 : Math.round((excusedCount / total) * 100);

    return {
        rate,
        count: excusedCount,
        total
    };
};



// M6: Redemption Ratio
export interface RedemptionMetrics {
    ratio: number;
    type: 'Saver' | 'Balanced' | 'Spender';
}

export const getRedemptionRatio = (transactions: CoinTransaction[]): RedemptionMetrics => {
    const earned = transactions
        .filter(t => t.amount > 0)
        .reduce((acc, t) => acc + t.amount, 0);

    const spent = transactions
        .filter(t => t.amount < 0)
        .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    if (earned === 0) return { ratio: 0, type: 'Saver' };

    const ratio = Math.round((spent / earned) * 100);

    let type: 'Saver' | 'Balanced' | 'Spender' = 'Balanced';
    if (ratio < 30) type = 'Saver';
    else if (ratio > 70) type = 'Spender';

    return { ratio, type };
};

// Decision Support: Recommendations
export interface Recommendation {
    id: string;
    message: string;
    type: 'info' | 'warning' | 'success';
}

export const getRecommendations = (logs: ChildTaskLog[], tasks: Task[]): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    const now = new Date();

    // 1. Check for high failure rate tasks (Needs Help)
    const failCounts: Record<string, number> = {};
    logs.forEach(l => {
        if (l.status === 'FAILED' || l.status === 'REJECTED') {
            failCounts[l.task_id] = (failCounts[l.task_id] || 0) + 1;
        }
    });

    Object.entries(failCounts).forEach(([taskId, count]) => {
        if (count >= 3) {
            const taskName = tasks.find(t => t.id === taskId)?.name || 'Unknown Task';
            recommendations.push({
                id: `fail-${taskId}`,
                message: `Task "${taskName}" has been missed ${count} times. Consider adjusting the difficulty or reward.`,
                type: 'warning'
            });
        }
    });


    // 3. Check for "Morning Bird" behavior (tasks done early: 5 AM - 9 AM)
    let morningCount = 0;
    logs.forEach(l => {
        if (l.status === 'VERIFIED') {
            const hour = new Date(l.completed_at).getHours();
            if (hour >= 5 && hour < 9) morningCount++;
        }
    });

    if (morningCount >= 3) {
        recommendations.push({
            id: 'morning-bird',
            message: `${morningCount} tasks were completed early in the morning! Great start to the day!`,
            type: 'success'
        });
    }

    // 4. Check for High Streak (Celebration)
    const highStreakTask = tasks.find(t => (t.current_streak || 0) >= 7);
    if (highStreakTask) {
        recommendations.push({
            id: `streak-${highStreakTask.id}`,
            message: `Great job! "${highStreakTask.name}" has a ${highStreakTask.current_streak}-day streak!`,
            type: 'success'
        });
    }

    // 5. Consistent Performer (High Weekly Success Rate)
    // We need a quick calc for the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    const recentLogs = logs.filter(l => new Date(l.completed_at) >= oneWeekAgo);

    if (recentLogs.length >= 5) { // Minimum activity threshold
        const verifiedCount = recentLogs.filter(l => l.status === 'VERIFIED').length;
        const totalCount = recentLogs.filter(l => ['VERIFIED', 'FAILED', 'REJECTED'].includes(l.status)).length;

        if (totalCount > 0 && (verifiedCount / totalCount) >= 0.9) {
            recommendations.push({
                id: 'consistent-performer',
                message: `Consistent Performer! Over 90% success rate in the last week. Keep it up!`,
                type: 'success'
            });
        }
    }

    // 6. Neglected Task (Active but not completed in 7+ days)
    // Only applies to recurring tasks that are active
    tasks.filter(t => t.is_active !== false && t.type === 'RECURRING').forEach(task => {
        // Find last completion
        const taskLogs = logs.filter(l => l.task_id === task.id && l.status === 'VERIFIED');
        if (taskLogs.length === 0) return; // Never done, maybe new

        // Sort by date desc
        taskLogs.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
        const lastDone = new Date(taskLogs[0].completed_at);

        const diffTime = Math.abs(now.getTime() - lastDone.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 7) {
            recommendations.push({
                id: `neglected-${task.id}`,
                message: `Task "${task.name}" hasn't been done in ${diffDays} days. Is it still relevant?`,
                type: 'info'
            });
        }
    });

    return recommendations;
};

// Category Performance Metrics
export interface CategoryMetric {
    id: string;
    name: string;
    icon: string;
    earned: number;
    total: number;
    completed: number;
}

export const getCategoryPerformance = (
    categories: Category[],
    logs: ChildTaskLog[],
    transactions: CoinTransaction[],
    tasks: Task[]
): CategoryMetric[] => {
    const metrics: Record<string, CategoryMetric> = {};

    // Initialize
    categories.forEach(c => {
        metrics[c.id] = { id: c.id, name: c.name, icon: c.icon, earned: 0, total: 0, completed: 0 };
    });
    metrics['uncategorized'] = { id: 'uncategorized', name: 'Others', icon: 'default', earned: 0, total: 0, completed: 0 };

    // Process Logs (for completion rate)
    logs.forEach(log => {
        const task = tasks.find(t => t.id === log.task_id);
        const catId = task?.category_id || 'uncategorized';

        if (!metrics[catId]) metrics[catId] = { id: catId, name: 'Unknown', icon: 'default', earned: 0, total: 0, completed: 0 };

        metrics[catId].total++;
        if (['VERIFIED', 'COMPLETED'].includes(log.status)) {
            metrics[catId].completed++;
        }
    });

    // Process Transactions (for earned stars)
    transactions.forEach(tx => {
        if (tx.type === 'TASK_VERIFIED' && tx.amount > 0) {
            // We need to find the task to get the category
            // The transaction reference_id is the log_id
            const log = logs.find(l => l.id === tx.reference_id);
            const task = log ? tasks.find(t => t.id === log.task_id) : null;
            const catId = task?.category_id || 'uncategorized';

            if (metrics[catId]) {
                metrics[catId].earned += tx.amount;
            }
        }
    });

    return Object.values(metrics)
        .filter(m => m.total > 0 || m.earned > 0)
        .sort((a, b) => b.completed - a.completed);
};
