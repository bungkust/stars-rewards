import type { Task, ChildTaskLog, CoinTransaction, Child } from '../types';
import { parseRRule, isDateValid } from './recurrence';

export type TimeFilter = 'today' | 'week' | 'month';

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
    pending: number;
    total: number;
}

interface TopTask {
    id: string;
    name: string;
    count: number;
}

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
    // 1. Calculate Total Expected (Theoretical Max)
    let totalExpected = 0;
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

    // Iterate through each day in the range to calculate Total Expected
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const currentDate = new Date(d);

        activeTasks.forEach(task => {
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
                }
            }
        });
    }

    // 2. Filter Logs for the period
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime() + (24 * 60 * 60 * 1000) - 1; // End of day

    const periodLogs = logs.filter(l => {
        if (selectedChildId !== 'all' && l.child_id !== selectedChildId) return false;
        const logTime = new Date(l.completed_at).getTime();
        return logTime >= startTimestamp && logTime <= endTimestamp;
    });

    // 3. Count Statuses
    const verified = periodLogs.filter(l => l.status === 'VERIFIED').length;
    const failed = periodLogs.filter(l => l.status === 'FAILED' || l.status === 'REJECTED').length;
    const excused = periodLogs.filter(l => l.status === 'EXCUSED').length;
    // Note: PENDING_EXCUSE is technically pending, but we can track it if needed.
    // For now, let's treat it as pending.

    // 4. Derive Pending
    // Pending is what's left from Total Expected after accounting for all final/semi-final states
    // We use Math.max(0) because sometimes logs might exceed expected if logic drifts or manual entries occur
    const processedCount = verified + failed + excused;
    const pending = Math.max(0, totalExpected - processedCount);

    // 5. Calculate Rate
    // Rate = Verified / (Total - Excused)
    // We exclude Excused from the denominator as they are "neutral"
    const denominator = totalExpected - excused;
    const rate = denominator <= 0 ? 0 : Math.round((verified / denominator) * 100);

    return {
        rate,
        verified,
        failed,
        excused,
        pending,
        total: totalExpected
    };
};

// M4: Top 3 Success / Fail
export const getTopTasks = (
    logs: ChildTaskLog[],
    tasks: Task[],
    type: 'success' | 'fail'
): TopTask[] => {
    // Filter logs based on type
    const targetLogs = logs.filter(l => {
        if (type === 'success') return l.status === 'VERIFIED';
        if (type === 'fail') return l.status === 'FAILED' || l.status === 'REJECTED';
        return false;
    });

    // Count occurrences
    const counts: Record<string, number> = {};
    targetLogs.forEach(l => {
        counts[l.task_id] = (counts[l.task_id] || 0) + 1;
    });

    // Convert to array and sort
    return Object.entries(counts)
        .map(([id, count]) => ({
            id,
            name: tasks.find(t => t.id === id)?.name || 'Unknown Task',
            count
        }))
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

    // 1. Check for high failure rate tasks
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

    // 2. Check for "Night Owl" behavior (tasks done late)
    let nightCount = 0;
    logs.forEach(l => {
        if (l.status === 'VERIFIED') {
            const hour = new Date(l.completed_at).getHours();
            if (hour >= 21 || hour < 6) nightCount++;
        }
    });

    if (nightCount >= 3) {
        recommendations.push({
            id: 'night-owl',
            message: `${nightCount} tasks were completed late at night. Consider setting earlier deadlines?`,
            type: 'info'
        });
    }

    // 3. Check for high streak (Celebration)
    const highStreakTask = tasks.find(t => (t.current_streak || 0) >= 7);
    if (highStreakTask) {
        recommendations.push({
            id: `streak-${highStreakTask.id}`,
            message: `Great job! "${highStreakTask.name}" has a ${highStreakTask.current_streak}-day streak!`,
            type: 'success'
        });
    }

    return recommendations;
};
