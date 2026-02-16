import { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ToggleButton } from '../../components/design-system';
import { FaSearch, FaArrowLeft, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import HistoryList, { type HistoryItemEntry } from '../../components/shared/HistoryList';
import HistoryDetailModal from '../../components/modals/HistoryDetailModal';

type SortOption = 'date_desc' | 'date_asc' | 'cost_desc' | 'cost_asc';
type DateFilter = 'all' | 'this_month' | 'last_month';

const ClaimedRewardsHistory = () => {
    const navigate = useNavigate();
    const { activeChildId, children, transactions, rewards, categories } = useAppStore();
    const child = children.find(c => c.id === activeChildId);

    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState<DateFilter>('all');
    const [sortOption, setSortOption] = useState<SortOption>('date_desc');
    const [showFilters, setShowFilters] = useState(false);
    const [visibleCount, setVisibleCount] = useState(10);
    const LOAD_MORE_INCREMENT = 10;

    // Modal State
    const [selectedItem, setSelectedItem] = useState<HistoryItemEntry | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const childTransactions = useMemo(
        () => transactions.filter(t => t.child_id === child?.id && t.type === 'REWARD_REDEEMED'),
        [transactions, child?.id]
    );

    // Helper to get transaction details (consistent with other pages)
    const getTransactionDetails = (t: any) => {
        const reward = rewards.find(r => r.id === t.reference_id);
        const name = reward?.name || 'Reward Redeemed';
        const description = 'Spent Stars';
        return { name, description };
    };

    const formattedTransactions = useMemo(() => {
        return childTransactions.map(t => ({
            id: t.id,
            type: 'transaction' as const,
            data: t,
            date: t.created_at,
            details: getTransactionDetails(t)
        }));
    }, [childTransactions, rewards]);

    const filteredTransactions = useMemo(() => {
        let result = [...formattedTransactions];

        // 1. Search Query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(item => {
                const name = item.details.name.toLowerCase();
                return name.includes(lowerQuery);
            });
        }

        // 2. Date Filter
        const filterByDate = (dateStr: string) => {
            const date = new Date(dateStr);
            const now = new Date();
            const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

            if (dateFilter === 'this_month') return date >= startOfThisMonth;
            if (dateFilter === 'last_month') return date >= startOfLastMonth && date <= endOfLastMonth;
            return true;
        };

        if (dateFilter !== 'all') {
            result = result.filter(item => filterByDate(item.date));
        }

        // 3. Sort
        result.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            const costA = Math.abs(a.data.amount);
            const costB = Math.abs(b.data.amount);

            switch (sortOption) {
                case 'date_desc': return dateB - dateA;
                case 'date_asc': return dateA - dateB;
                case 'cost_desc': return costB - costA;
                case 'cost_asc': return costA - costB;
                default: return dateB - dateA;
            }
        });

        return result;
    }, [formattedTransactions, searchQuery, dateFilter, sortOption]);

    const displayedHistory = useMemo(() => {
        return filteredTransactions.slice(0, visibleCount);
    }, [filteredTransactions, visibleCount]);

    const hasMore = visibleCount < filteredTransactions.length;

    const handleItemClick = (item: HistoryItemEntry) => {
        setSelectedItem(item);
        setIsDetailOpen(true);
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
                    <h1 className="text-2xl font-bold text-neutral">Claimed Rewards</h1>
                </div>
            </div>

            {/* Search & Filter Controls */}
            <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral/40" />
                        <input
                            type="text"
                            placeholder="Search rewards..."
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
                            {/* Date Filter */}
                            <div>
                                <label className="text-xs font-bold text-neutral/60 mb-2 block uppercase">Time Period</label>
                                <div className="flex flex-wrap gap-2">
                                    <ToggleButton label="All Time" isActive={dateFilter === 'all'} onClick={() => setDateFilter('all')} />
                                    <ToggleButton label="This Month" isActive={dateFilter === 'this_month'} onClick={() => setDateFilter('this_month')} />
                                    <ToggleButton label="Last Month" isActive={dateFilter === 'last_month'} onClick={() => setDateFilter('last_month')} />
                                </div>
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
                                    <button
                                        className={`btn btn-xs sm:btn-sm rounded-full ${sortOption === 'cost_desc' ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
                                        onClick={() => setSortOption('cost_desc')}
                                    >
                                        Cost (High)
                                    </button>
                                    <button
                                        className={`btn btn-xs sm:btn-sm rounded-full ${sortOption === 'cost_asc' ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
                                        onClick={() => setSortOption('cost_asc')}
                                    >
                                        Cost (Low)
                                    </button>
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
                        const tx = item.data;
                        const details = item.details;
                        const reward = rewards.find(r => r.id === tx.reference_id);
                        const category = reward ? categories.find(c => c.id === reward.category) : null;

                        const entry: HistoryItemEntry = {
                            id: item.id,
                            type: 'redeemed',
                            title: details.name,
                            subtitle: new Date(tx.created_at).toLocaleDateString(),
                            description: details.description,
                            amount: tx.amount,
                            amountLabel: 'Redeemed',
                            status: 'warning',
                            categoryName: category?.name,
                            childName: child.name,
                            dateLabel: new Date(tx.created_at).toLocaleDateString(),
                            childId: tx.child_id,
                            referenceId: tx.reference_id
                        };
                        return { ...entry, onClick: () => handleItemClick(entry) };
                    })}
                    emptyMessage="No rewards found."
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
                onDelete={async () => { }} // Read-only
                readOnly={true}
            />
        </div>
    );
};

export default ClaimedRewardsHistory;
