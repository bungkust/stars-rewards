import { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ToggleButton, H1Header } from '../../components/design-system';
import { FaArrowLeft, FaFilter, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import HistoryList, { type HistoryItemType, type HistoryItemEntry } from '../../components/shared/HistoryList';
import HistoryDetailModal from '../../components/modals/HistoryDetailModal';

type SortOption = 'date_desc' | 'date_asc';
type DateFilter = 'all' | 'today' | 'week' | 'month' | 'specific';
type TypeFilter = 'all' | 'earned' | 'spent' | 'manual' | 'failed';

const AdminHistory = () => {
    const navigate = useNavigate();
    const { children, transactions, childLogs, tasks, rewards, categories, deleteTransaction, deleteChildLog } = useAppStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChildId, setSelectedChildId] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<DateFilter>('today');
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
    const [sortOption, setSortOption] = useState<SortOption>('date_desc');
    const [showFilters, setShowFilters] = useState(false);

    // Specific date filter state
    const [tempDate, setTempDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [specificDate, setSpecificDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [visibleCount, setVisibleCount] = useState(10);
    const LOAD_MORE_INCREMENT = 10;

    // Modal State
    const [selectedItem, setSelectedItem] = useState<HistoryItemEntry | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Helper to get transaction details
    const getTransactionDetails = (t: any) => {
        let name = '';
        let description = '';

        if (t.type === 'TASK_VERIFIED') {
            const log = childLogs.find(l => l.id === t.reference_id);
            if (log) {
                const task = tasks.find(tsk => tsk.id === log.task_id);
                name = task?.name || 'Unknown Mission';
            } else {
                name = 'Mission Completed';
            }
            description = 'Earned Stars';
        } else if (t.type === 'REWARD_REDEEMED') {
            const reward = rewards.find(r => r.id === t.reference_id);
            name = reward?.name || 'Reward Redeemed';
            description = 'Spent Stars';
        } else {
            name = 'Manual Adjustment';
            description = t.description || (t.amount > 0 ? 'Bonus' : 'Penalty');
        }

        return { name, description };
    };

    const getRejectedMissionDetails = (log: any) => {
        const task = tasks.find(tsk => tsk.id === log.task_id);
        const name = task?.name || 'Unknown Mission';
        const description = log.rejection_reason || 'Mission Rejected';
        return { name, description };
    };

    const getChildName = (childId: string) => children.find(c => c.id === childId)?.name || 'Unknown';

    // Combine transactions and rejected missions
    const combinedHistory = useMemo(() => {
        const transactionItems = transactions.map(t => ({
            id: t.id,
            type: 'transaction' as const,
            data: t,
            date: t.created_at,
            child_id: t.child_id,
            details: getTransactionDetails(t)
        }));

        const rejectedItems = childLogs
            .filter(log => ['REJECTED', 'FAILED', 'EXCUSED'].includes(log.status))
            .map(log => ({
                id: log.id,
                type: 'rejected_mission' as const,
                data: log,
                date: log.completed_at,
                child_id: log.child_id,
                details: getRejectedMissionDetails(log)
            }));

        return [...transactionItems, ...rejectedItems];
    }, [transactions, childLogs]);

    // Filtering and Sorting
    const filteredHistory = useMemo(() => {
        let result = [...combinedHistory];

        // 0. Child Filter
        if (selectedChildId !== 'all') {
            result = result.filter(item => item.child_id === selectedChildId);
        }

        // 1. Search Filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(item => {
                const name = item.details.name.toLowerCase();
                const childName = getChildName(item.child_id).toLowerCase();
                return name.includes(lowerQuery) || childName.includes(lowerQuery);
            });
        }

        // 2. Type Filter
        if (typeFilter !== 'all') {
            result = result.filter(item => {
                if (typeFilter === 'earned') return item.type === 'transaction' && item.data.amount > 0;
                if (typeFilter === 'spent') return item.type === 'transaction' && item.data.amount < 0;
                if (typeFilter === 'manual') return item.type === 'transaction' && item.data.type === 'MANUAL_ADJ';
                if (typeFilter === 'failed') return item.type === 'rejected_mission';
                return true;
            });
        }

        // 3. Date Filter
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const oneDay = 24 * 60 * 60 * 1000;

        result = result.filter(item => {
            const itemDate = new Date(item.date).getTime();
            if (dateFilter === 'specific') {
                const itemDateStr = new Date(item.date).toLocaleDateString('en-CA');
                return specificDate === itemDateStr;
            }
            if (dateFilter === 'today') return itemDate >= today;
            if (dateFilter === 'week') return itemDate >= today - (6 * oneDay);
            if (dateFilter === 'month') return itemDate >= today - (29 * oneDay);
            return true;
        });

        // 4. Sort
        result.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortOption === 'date_asc' ? dateA - dateB : dateB - dateA;
        });

        return result;
    }, [combinedHistory, selectedChildId, searchQuery, typeFilter, dateFilter, sortOption, specificDate]);

    // Reset visible count when filters change
    useMemo(() => {
        setVisibleCount(10);
    }, [selectedChildId, searchQuery, typeFilter, dateFilter, sortOption, specificDate]);

    const displayedHistory = useMemo(() => {
        return filteredHistory.slice(0, visibleCount);
    }, [filteredHistory, visibleCount]);

    const hasMore = visibleCount < filteredHistory.length;

    const handleItemClick = (item: HistoryItemEntry) => {
        setSelectedItem(item);
        setIsDetailOpen(true);
    };

    const handleDelete = async (item: HistoryItemEntry) => {
        if (!item) return;

        // Determine if it's a transaction or log based on type
        // This is a bit indirect because HistoryItemEntry type is 'verified' etc.
        // But we know 'verified', 'redeemed', 'manual' are likely transactions
        // and 'failed', 'rejected', 'excused' are logs.
        // More robustly: we could store the 'sourceType' ('transaction' | 'log') in the HistoryItemEntry but 
        // passing it through might be cleaner.
        // However, `deleteTransaction` handles `TASK_VERIFIED` logic.

        let result;
        if (['verified', 'redeemed', 'manual'].includes(item.type)) {
            // It's a transaction
            result = await deleteTransaction(item.id);
        } else {
            // It's a log
            result = await deleteChildLog(item.id);
        }

        if (result.error) {
            console.error('Failed to delete item:', result.error);
            alert('Failed to delete item');
        }

        // Modal will close automatically via props if we managed state there, 
        // but here we just await and close.
    };

    return (
        <div className="flex flex-col gap-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle btn-sm">
                    <FaArrowLeft />
                </button>
                <div className="flex-1">
                    <H1Header>Parent History</H1Header>
                </div>
            </div>

            {/* Child Filter (Horizontal Scroll) */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mt-2">
                <ToggleButton label="All Children" isActive={selectedChildId === 'all'} onClick={() => setSelectedChildId('all')} />
                {children.map(child => (
                    <ToggleButton key={child.id} label={child.name} isActive={selectedChildId === child.id} onClick={() => setSelectedChildId(child.id)} />
                ))}
            </div>

            {/* Search & Filter Controls */}
            <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral/40" />
                        <input
                            type="text"
                            placeholder="Search history..."
                            className="input input-bordered w-full pl-10 h-10 rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        className={`btn btn-sm h-10 w-10 btn-square rounded-xl ${showFilters ? 'btn-primary' : 'btn-ghost bg-base-200'}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FaFilter />
                    </button>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden flex flex-col gap-4 bg-base-100 p-4 rounded-xl border border-base-200 shadow-sm"
                        >
                            {/* Type Filter */}
                            <div>
                                <label className="text-xs font-bold text-neutral/60 mb-2 block uppercase">Filter By Type</label>
                                <div className="flex flex-wrap gap-2">
                                    <ToggleButton label="All" isActive={typeFilter === 'all'} onClick={() => setTypeFilter('all')} />
                                    <ToggleButton label="Earned" isActive={typeFilter === 'earned'} onClick={() => setTypeFilter('earned')} />
                                    <ToggleButton label="Spent" isActive={typeFilter === 'spent'} onClick={() => setTypeFilter('spent')} />
                                    <ToggleButton label="Manual" isActive={typeFilter === 'manual'} onClick={() => setTypeFilter('manual')} />
                                    <ToggleButton label="Failed" isActive={typeFilter === 'failed'} onClick={() => setTypeFilter('failed')} />
                                </div>
                            </div>

                            {/* Date Filter */}
                            <div>
                                <label className="text-xs font-bold text-neutral/60 mb-2 block uppercase">Time Period</label>
                                <div className="flex flex-wrap gap-2 items-center">
                                    <ToggleButton label="All Time" isActive={dateFilter === 'all'} onClick={() => setDateFilter('all')} />
                                    <ToggleButton label="Today" isActive={dateFilter === 'today'} onClick={() => setDateFilter('today')} />
                                    <ToggleButton label="Week" isActive={dateFilter === 'week'} onClick={() => setDateFilter('week')} />
                                    <ToggleButton label="Month" isActive={dateFilter === 'month'} onClick={() => setDateFilter('month')} />
                                    <ToggleButton label="Specific" isActive={dateFilter === 'specific'} onClick={() => setDateFilter('specific')} />
                                </div>
                                {dateFilter === 'specific' && (
                                    <div className="mt-3 flex gap-2">
                                        <input type="date" className="input input-sm input-bordered w-full" value={tempDate} onChange={(e) => setTempDate(e.target.value)} />
                                        <button className="btn btn-sm btn-primary" onClick={() => setSpecificDate(tempDate)}>Apply</button>
                                    </div>
                                )}
                            </div>

                            {/* Sort Filter */}
                            <div>
                                <label className="text-xs font-bold text-neutral/60 mb-2 block uppercase">Sort By</label>
                                <div className="flex flex-wrap gap-2">
                                    <button className={`btn btn-xs sm:btn-sm rounded-full ${sortOption === 'date_desc' ? 'btn-primary' : 'btn-ghost border border-base-300'}`} onClick={() => setSortOption('date_desc')}>Newest</button>
                                    <button className={`btn btn-xs sm:btn-sm rounded-full ${sortOption === 'date_asc' ? 'btn-primary' : 'btn-ghost border border-base-300'}`} onClick={() => setSortOption('date_asc')}>Oldest</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* List */}
            <div className="card bg-base-100 shadow-md rounded-xl overflow-hidden border border-base-200 p-4">
                <HistoryList
                    items={displayedHistory.map(item => {
                        const childName = getChildName(item.child_id);
                        if (item.type === 'transaction') {
                            const tx = item.data;
                            const details = item.details;
                            const log = tx.reference_id ? childLogs.find(l => l.id === tx.reference_id) : null;
                            const task = log ? tasks.find(tsk => tsk.id === log.task_id) : null;
                            const category = task ? categories.find(c => c.id === task.category_id) : null;

                            let type: HistoryItemType = 'verified';
                            if (tx.type === 'REWARD_REDEEMED') type = 'redeemed';
                            else if (tx.type === 'MANUAL_ADJ') type = 'manual';

                            const entry: HistoryItemEntry = {
                                id: item.id,
                                type,
                                title: details.name,
                                subtitle: `${childName} • ${new Date(tx.created_at).toLocaleDateString()}`,
                                description: details.description,
                                amount: tx.amount,
                                amountLabel: tx.type === 'TASK_VERIFIED' ? 'Done' : tx.type === 'REWARD_REDEEMED' ? 'Redeemed' : '-',
                                status: tx.amount > 0 ? 'success' : tx.amount < 0 ? 'error' : 'neutral',
                                categoryName: category?.name,
                                notes: log?.notes,
                                targetValue: task?.total_target_value,
                                currentValue: log?.current_value,
                                unit: task?.target_unit,
                                childName,
                                dateLabel: new Date(tx.created_at).toLocaleDateString(),
                                childId: tx.child_id,
                                taskId: task?.id,
                                referenceId: tx.reference_id
                            };
                            return { ...entry, onClick: () => handleItemClick(entry) };
                        } else {
                            const log = item.data;
                            const details = item.details;
                            const isFailed = log.status === 'FAILED';
                            const isExcused = log.status === 'EXCUSED';
                            let type: HistoryItemType = 'rejected';
                            if (isFailed) type = 'failed';
                            else if (isExcused) type = 'excused';

                            const task = tasks.find(tsk => tsk.id === log.task_id);
                            const category = task ? categories.find(c => c.id === task.category_id) : null;

                            const entry: HistoryItemEntry = {
                                id: item.id,
                                type,
                                title: details.name,
                                subtitle: `${childName} • ${new Date(log.completed_at).toLocaleDateString()}`,
                                description: isFailed ? 'Missed Deadline' : isExcused ? (log.notes || 'No reason provided') : `Reason: ${log.rejection_reason}`,
                                amountLabel: log.status,
                                status: isFailed ? 'neutral' : isExcused ? 'warning' : 'error',
                                categoryName: category?.name,
                                notes: log.notes,
                                rejectionReason: log.rejection_reason,
                                targetValue: task?.total_target_value,
                                currentValue: log.current_value,
                                unit: task?.target_unit,
                                childName,
                                dateLabel: new Date(log.completed_at).toLocaleDateString(),
                                childId: log.child_id,
                                taskId: log.task_id
                            };
                            return { ...entry, onClick: () => handleItemClick(entry) };
                        }
                    })}
                    emptyMessage="No history found matching your filters."
                    footer={
                        hasMore && (
                            <button
                                className="btn btn-ghost btn-sm w-full text-neutral/60 mt-2"
                                onClick={() => setVisibleCount(prev => prev + LOAD_MORE_INCREMENT)}
                            >
                                Load More
                            </button>
                        )
                    }
                />
            </div>

            <HistoryDetailModal
                isOpen={isDetailOpen}
                item={selectedItem}
                onClose={() => setIsDetailOpen(false)}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default AdminHistory;
