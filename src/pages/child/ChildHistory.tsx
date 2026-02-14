import { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ToggleButton } from '../../components/design-system';
import { FaArrowLeft, FaFilter, FaCheckCircle, FaGift, FaSlidersH, FaTimesCircle, FaChild, FaHistory, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

type SortOption = 'date_desc' | 'date_asc';
type DateFilter = 'all' | 'today' | 'week' | 'month' | 'specific';
type TypeFilter = 'all' | 'earned' | 'spent' | 'manual' | 'failed';

const ChildHistory = () => {
    const navigate = useNavigate();
    const { activeChildId, children, transactions, childLogs, tasks, rewards } = useAppStore();
    const child = children.find(c => c.id === activeChildId);

    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState<DateFilter>('all');
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
    const [sortOption, setSortOption] = useState<SortOption>('date_desc');
    const [showFilters, setShowFilters] = useState(false);

    // Specific date filter state
    const [tempDate, setTempDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [specificDate, setSpecificDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const childTransactions = useMemo(
        () => transactions.filter(t => t.child_id === child?.id),
        [transactions, child?.id]
    );

    const rejectedMissions = useMemo(
        () => childLogs.filter(log => log.child_id === child?.id && (log.status === 'REJECTED' || log.status === 'FAILED' || log.status === 'EXCUSED')),
        [childLogs, child?.id]
    );

    // Helper to get transaction details (Reused logic)
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

    // Combine transactions and rejected missions for history
    const combinedHistory = useMemo(() => {
        const transactionItems = childTransactions.map(t => ({
            id: t.id,
            type: 'transaction' as const,
            data: t,
            date: t.created_at,
            details: getTransactionDetails(t) // Pre-calculate details for filtering
        }));

        const rejectedItems = rejectedMissions.map(log => ({
            id: log.id,
            type: 'rejected_mission' as const,
            data: log,
            date: log.completed_at,
            details: getRejectedMissionDetails(log) // Pre-calculate details for filtering
        }));

        return [...transactionItems, ...rejectedItems];
    }, [childTransactions, rejectedMissions]);

    // Filtering and Sorting
    const filteredHistory = useMemo(() => {
        let result = [...combinedHistory];

        // 0. Search Filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(item => {
                const name = item.details.name.toLowerCase();
                return name.includes(lowerQuery);
            });
        }

        // 1. Type Filter
        if (typeFilter !== 'all') {
            result = result.filter(item => {
                if (typeFilter === 'earned') {
                    return item.type === 'transaction' && item.data.amount > 0;
                }
                if (typeFilter === 'spent') {
                    return item.type === 'transaction' && item.data.amount < 0;
                }
                if (typeFilter === 'manual') {
                    return item.type === 'transaction' && item.data.type === 'MANUAL_ADJ';
                }
                if (typeFilter === 'failed') {
                    return item.type === 'rejected_mission';
                }
                return true;
            });
        }

        // 2. Date Filter
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

        // 3. Sort
        result.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();

            if (sortOption === 'date_asc') return dateA - dateB;
            return dateB - dateA; // Default Newest
        });

        return result;
    }, [combinedHistory, typeFilter, dateFilter, sortOption, specificDate]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (!child) return <div>Loading...</div>;

    return (
        <div className="flex flex-col gap-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle btn-sm">
                    <FaArrowLeft />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-neutral">History</h1>
                </div>
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
                                        <input
                                            type="date"
                                            className="input input-sm input-bordered w-full"
                                            value={tempDate}
                                            onChange={(e) => setTempDate(e.target.value)}
                                        />
                                        <button className="btn btn-sm btn-primary" onClick={() => setSpecificDate(tempDate)}>Apply</button>
                                    </div>
                                )}
                            </div>

                            {/* Sort Filter */}
                            <div>
                                <label className="text-xs font-bold text-neutral/60 mb-2 block uppercase">Sort By</label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        className={`btn btn-xs sm:btn-sm rounded-full ${sortOption === 'date_desc' ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
                                        onClick={() => setSortOption('date_desc')}
                                    >
                                        Newest
                                    </button>
                                    <button
                                        className={`btn btn-xs sm:btn-sm rounded-full ${sortOption === 'date_asc' ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
                                        onClick={() => setSortOption('date_asc')}
                                    >
                                        Oldest
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* List */}
            <div className="card bg-base-100 shadow-md rounded-xl overflow-hidden border border-base-200">
                <div className="flex flex-col">
                    {filteredHistory.length > 0 ? (
                        filteredHistory.map(item => {
                            if (item.type === 'transaction') {
                                const transaction = item.data;
                                const details = item.details;

                                let Icon = FaCheckCircle;
                                let iconBg = 'bg-success/10';
                                let iconColor = 'text-success';

                                if (transaction.type === 'REWARD_REDEEMED') {
                                    Icon = FaGift;
                                    iconBg = 'bg-warning/10';
                                    iconColor = 'text-warning';
                                } else if (transaction.type === 'MANUAL_ADJ') {
                                    Icon = FaSlidersH;
                                    iconBg = 'bg-info/10';
                                    iconColor = 'text-info';
                                }

                                return (
                                    <div key={item.id} className="flex justify-between items-center p-4 border-b border-base-200 last:border-none hover:bg-base-50 transition-colors">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className={`p-3 rounded-full ${iconBg} ${iconColor}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <span className="font-bold text-neutral text-sm truncate">{details.name}</span>
                                                <span className="text-xs text-neutral/40">{formatDate(transaction.created_at)}</span>
                                                {details.description && <span className="text-xs text-neutral/50 italic mt-0.5">{details.description}</span>}
                                            </div>
                                        </div>
                                        <span className={`font-bold whitespace-nowrap text-sm ${transaction.amount > 0 ? 'text-success' : transaction.amount < 0 ? 'text-error' : 'text-neutral/60'}`}>
                                            {transaction.amount !== 0 ? (
                                                <>{transaction.amount > 0 ? '+' : ''}{transaction.amount} Stars</>
                                            ) : (
                                                <span className="uppercase text-xs">{transaction.type === 'TASK_VERIFIED' ? 'Done' : '-'}</span>
                                            )}
                                        </span>
                                    </div>
                                );
                            } else {
                                const log = item.data;
                                const details = item.details;
                                const isFailed = log.status === 'FAILED';
                                const isExcused = log.status === 'EXCUSED';

                                return (
                                    <div key={item.id} className="flex justify-between items-center p-4 border-b border-base-200 last:border-none hover:bg-base-50 transition-colors">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className={`p-3 rounded-full ${isFailed ? 'bg-base-200 text-neutral/60' : isExcused ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'}`}>
                                                {isExcused ? <FaChild className="w-5 h-5" /> : <FaTimesCircle className="w-5 h-5" />}
                                            </div>
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <span className="font-bold text-neutral text-sm truncate">{details.name}</span>
                                                <span className="text-xs text-neutral/40">{formatDate(log.completed_at)}</span>
                                                {log.rejection_reason && !isExcused && <span className={`text-xs italic mt-0.5 ${isFailed ? 'text-neutral/60' : 'text-error'}`}>{isFailed ? 'Missed Deadline' : `Reason: ${log.rejection_reason}`}</span>}
                                                {isExcused && <span className="text-xs italic mt-0.5 text-warning">{log.notes || 'No reason provided'}</span>}
                                            </div>
                                        </div>
                                        <span className={`font-bold whitespace-nowrap text-sm ${isFailed ? 'text-neutral/40' : isExcused ? 'text-warning' : 'text-error'}`}>
                                            <span className="uppercase text-xs">{isFailed ? 'Failed' : isExcused ? 'Excused' : 'Rejected'}</span>
                                        </span>
                                    </div>
                                );
                            }
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-neutral/40">
                            <FaHistory className="w-12 h-12 mb-3 opacity-20" />
                            <p>No history found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChildHistory;
