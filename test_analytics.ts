
// Mock Types
interface Category {
    id: string;
    name: string;
    icon: string;
    is_default?: boolean;
}

interface Task {
    id: string;
    parent_id: string;
    name: string;
    category_id: string;
    reward_value: number;
    type: string;
    is_active: boolean;
    created_at: string;
    assigned_to?: string[];
}

interface ChildTaskLog {
    id: string;
    parent_id: string;
    child_id: string;
    task_id: string;
    status: string;
    completed_at: string;
}

interface CoinTransaction {
    id: string;
    parent_id: string;
    child_id: string;
    amount: number;
    type: string;
    reference_id?: string;
    created_at: string;
}

interface CategoryMetric {
    id: string;
    name: string;
    icon: string;
    earned: number;
    total: number;
    completed: number;
}

// Function under test
const getCategoryPerformance = (
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

// Mock Data
const categories: Category[] = [
    { id: 'cat1', name: 'Hygiene', icon: 'soap', is_default: true },
    { id: 'cat2', name: 'Study', icon: 'book', is_default: true }
];

const tasks: Task[] = [
    { id: 'task1', parent_id: 'p1', name: 'Clean Room', category_id: 'cat1', reward_value: 10, type: 'ONE_TIME', is_active: true, created_at: '', assigned_to: ['child1'] },
    { id: 'task2', parent_id: 'p1', name: 'Read Book', category_id: 'cat2', reward_value: 10, type: 'ONE_TIME', is_active: true, created_at: '', assigned_to: ['child2'] }
];

const logs: ChildTaskLog[] = [
    { id: 'log1', parent_id: 'p1', child_id: 'child1', task_id: 'task1', status: 'VERIFIED', completed_at: '2023-01-01T10:00:00Z' },
    { id: 'log2', parent_id: 'p1', child_id: 'child2', task_id: 'task2', status: 'FAILED', completed_at: '2023-01-01T10:00:00Z' }
];

const transactions: CoinTransaction[] = [
    { id: 'tx1', parent_id: 'p1', child_id: 'child1', amount: 10, type: 'TASK_VERIFIED', reference_id: 'log1', created_at: '2023-01-01T10:00:00Z' }
];

console.log('--- Test Case 1: Filter for Child 1 (Should show Hygiene) ---');
const filteredLogs1 = logs.filter(l => l.child_id === 'child1');
const filteredTx1 = transactions.filter(t => t.child_id === 'child1');
const metrics1 = getCategoryPerformance(categories, filteredLogs1, filteredTx1, tasks);
console.log(JSON.stringify(metrics1, null, 2));

console.log('\n--- Test Case 2: Filter for Child 2 (Should be EMPTY) ---');
const filteredLogs2 = logs.filter(l => l.child_id === 'child2');
const filteredTx2 = transactions.filter(t => t.child_id === 'child2');
const metrics2 = getCategoryPerformance(categories, filteredLogs2, filteredTx2, tasks);
console.log(JSON.stringify(metrics2, null, 2));

console.log('\n--- Test Case 3: All Children (Should show Hygiene) ---');
const metricsAll = getCategoryPerformance(categories, logs, transactions, tasks);
console.log(JSON.stringify(metricsAll, null, 2));
