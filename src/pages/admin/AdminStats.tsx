import { useState } from 'react';
import { FaChartLine, FaCoins } from 'react-icons/fa';
import { AppCard } from '../../components/design-system/AppCard';
import { H1Header } from '../../components/design-system/H1Header';
import { IconWrapper } from '../../components/design-system/IconWrapper';
import { useAppStore } from '../../store/useAppStore';

const AdminStats = () => {
  const { children, transactions } = useAppStore();
  const [selectedChildId, setSelectedChildId] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('today');
  const [visibleTxCount, setVisibleTxCount] = useState(10);

  const handleTimeFilterChange = (filter: 'today' | 'week' | 'month') => {
    setTimeFilter(filter);
    setVisibleTxCount(10);
  };

  const filteredTransactions = transactions.filter(tx => {
    // 1. Child Filter
    if (selectedChildId !== 'all' && tx.child_id !== selectedChildId) return false;

    // 2. Time Filter
    const txDate = new Date(tx.created_at).getTime();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    if (timeFilter === 'today') {
      return txDate >= today;
    }
    if (timeFilter === 'week') {
      return txDate >= today - (6 * oneDay);
    }
    if (timeFilter === 'month') {
      return txDate >= today - (29 * oneDay);
    }

    return true;
  });

  const visibleTransactions = filteredTransactions.slice(0, visibleTxCount);
  const hasMore = visibleTransactions.length < filteredTransactions.length;

  const getChildName = (childId: string) => {
    return children.find(c => c.id === childId)?.name || 'Unknown';
  };

  const getTxDescription = (tx: typeof transactions[0]) => {
    if (tx.description) return tx.description;

    switch (tx.type) {
      case 'TASK_VERIFIED': return 'Mission Completed';
      case 'REWARD_REDEEMED': return 'Reward Redeemed';
      case 'MANUAL_ADJ': return 'Manual Adjustment';
      default: return 'Transaction';
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex justify-between items-center">
        <H1Header>Reports & Audit</H1Header>
      </div>

      {/* Filter */}
      <div className="flex flex-col gap-4">
        {/* Child Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            className={`btn btn-sm rounded-full ${selectedChildId === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedChildId('all')}
          >
            All Children
          </button>
          {children.map(child => (
            <button
              key={child.id}
              className={`btn btn-sm rounded-full ${selectedChildId === child.id ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSelectedChildId(child.id)}
            >
              {child.name}
            </button>
          ))}
        </div>

        {/* Time Filter */}
        <div className="tabs tabs-boxed bg-base-200 p-1 rounded-lg w-fit">
          <a
            className={`tab tab-sm rounded-md transition-all ${timeFilter === 'today' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-base-300'}`}
            onClick={() => handleTimeFilterChange('today')}
          >
            Today
          </a>
          <a
            className={`tab tab-sm rounded-md transition-all ${timeFilter === 'week' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-base-300'}`}
            onClick={() => handleTimeFilterChange('week')}
          >
            Week
          </a>
          <a
            className={`tab tab-sm rounded-md transition-all ${timeFilter === 'month' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-base-300'}`}
            onClick={() => handleTimeFilterChange('month')}
          >
            Month
          </a>
        </div>
      </div>

      <AppCard>
        <div className="flex items-center gap-3 mb-4">
          <IconWrapper icon={FaChartLine} />
          <h3 className="font-bold text-lg">Transaction History</h3>
        </div>

        <div className="flex flex-col gap-4">
          {visibleTransactions.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No transactions found.</p>
          ) : (
            <>
              {visibleTransactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center border-b border-base-200 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${tx.type === 'TASK_VERIFIED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      <FaCoins className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{getTxDescription(tx)}</p>
                      <p className="text-xs text-gray-500">
                        {getChildName(tx.child_id)} • {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold ${tx.amount > 0 ? 'text-green-600' : tx.amount < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                    {tx.amount !== 0 ? (
                      <>{tx.amount > 0 ? '+' : ''}{tx.amount}</>
                    ) : (
                      <span className="text-xs uppercase">
                        {tx.type === 'TASK_VERIFIED' ? 'Done' : tx.type === 'REWARD_REDEEMED' ? 'Redeemed' : '-'}
                      </span>
                    )}
                  </span>
                </div>
              ))}

              {hasMore && (
                <button
                  className="btn btn-ghost btn-sm w-full text-gray-500"
                  onClick={() => setVisibleTxCount(prev => prev + 10)}
                >
                  Load More
                </button>
              )}
            </>
          )}
        </div>
      </AppCard>
    </div>
  );
};

export default AdminStats;
