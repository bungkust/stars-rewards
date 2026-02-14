import { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ToggleButton } from '../../components/design-system';
import { FaGift, FaSearch, FaArrowLeft, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

type SortOption = 'date_desc' | 'date_asc' | 'cost_desc' | 'cost_asc';
type DateFilter = 'all' | 'this_month' | 'last_month';

const ClaimedRewardsHistory = () => {
    const navigate = useNavigate();
    const { activeChildId, children, transactions, rewards } = useAppStore();
    const child = children.find(c => c.id === activeChildId);

    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState<DateFilter>('all');
    const [sortOption, setSortOption] = useState<SortOption>('date_desc');
    const [showFilters, setShowFilters] = useState(false);

    const childTransactions = useMemo(
        () => transactions.filter(t => t.child_id === child?.id && t.type === 'REWARD_REDEEMED'),
        [transactions, child?.id]
    );

    const getRewardName = (id?: string) => {
        const reward = rewards.find(r => r.id === id);
        return reward?.name || 'Unknown Reward';
    };

    const filteredTransactions = useMemo(() => {
        let result = [...childTransactions];

        // 1. Search Query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(t => {
                const name = getRewardName(t.reference_id);
                return name.toLowerCase().includes(lowerQuery);
            });
        }

        // 2. Date Filter
        // Helper to check date range
        const filterByDate = (dateStr: string) => {
            const date = new Date(dateStr);
            const now = new Date();
            const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

            if (dateFilter === 'this_month') {
                return date >= startOfThisMonth;
            } else if (dateFilter === 'last_month') {
                return date >= startOfLastMonth && date <= endOfLastMonth;
            }
            return true;
        };

        if (dateFilter !== 'all') {
            result = result.filter(t => filterByDate(t.created_at));
        }


        // 3. Sort
        result.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            const costA = Math.abs(a.amount);
            const costB = Math.abs(b.amount);

            switch (sortOption) {
                case 'date_desc': return dateB - dateA;
                case 'date_asc': return dateA - dateB;
                case 'cost_desc': return costB - costA; // High score (cost) first
                case 'cost_asc': return costA - costB;
                default: return dateB - dateA;
            }
        });

        return result;
    }, [childTransactions, rewards, searchQuery, dateFilter, sortOption]);

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
            <div className="card bg-base-100 shadow-md rounded-xl overflow-hidden border border-base-200">
                <div className="flex flex-col">
                    {filteredTransactions.length > 0 ? (
                        filteredTransactions.map(transaction => (
                            <div key={transaction.id} className="flex justify-between items-center p-4 border-b border-base-200 last:border-none hover:bg-base-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-warning/10 text-warning rounded-full">
                                        <FaGift className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-neutral text-sm">{getRewardName(transaction.reference_id)}</span>
                                        <span className="text-xs text-neutral/50">{formatDate(transaction.created_at)}</span>
                                    </div>
                                </div>
                                <span className="font-bold text-error whitespace-nowrap text-sm">
                                    {Math.abs(transaction.amount)} Stars
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-neutral/40">
                            <FaGift className="w-12 h-12 mb-3 opacity-20" />
                            <p>No rewards found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClaimedRewardsHistory;
