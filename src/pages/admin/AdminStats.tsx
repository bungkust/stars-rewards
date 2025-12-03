import { useState } from 'react';
import { FaChartLine, FaCoins } from 'react-icons/fa';
import { AppCard } from '../../components/design-system/AppCard';
import { H1Header } from '../../components/design-system/H1Header';
import { IconWrapper } from '../../components/design-system/IconWrapper';
import { useAppStore } from '../../store/useAppStore';

type DateRange = 'today' | '7days' | '30days';

const AdminStats = () => {
  const { children, transactions } = useAppStore();
  const [selectedChildId, setSelectedChildId] = useState<string>('all');
  const [selectedRange, setSelectedRange] = useState<DateRange>('today');
  const [historyPageSize, setHistoryPageSize] = useState(10);

  // Helper to check if a date falls within the selected range
  const isDateInSelectedRange = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (selectedRange) {
      case 'today':
        return date >= today;
      case '7days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return date >= sevenDaysAgo;
      case '30days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return date >= thirtyDaysAgo;
      default:
        return true;
    }
  };

  const filteredTransactions = transactions.filter(tx =>
    (selectedChildId === 'all' || tx.child_id === selectedChildId) &&
    isDateInSelectedRange(tx.created_at)
  );

  const getChildName = (childId: string) => {
    return children.find(c => c.id === childId)?.name || 'Unknown';
  };

  const getTxDescription = (tx: typeof transactions[0]) => {
    if (tx.description) return tx.description;
    
    switch(tx.type) {
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

      {/* Child Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          className={`btn btn-sm rounded-full ${selectedChildId === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => {
            setSelectedChildId('all');
            setHistoryPageSize(10);
          }}
        >
          All Children
        </button>
        {children.map(child => (
          <button
            key={child.id}
            className={`btn btn-sm rounded-full ${selectedChildId === child.id ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => {
              setSelectedChildId(child.id);
              setHistoryPageSize(10);
            }}
          >
            {child.name}
          </button>
        ))}
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-700">Filter by time period:</span>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedRange('today');
              setHistoryPageSize(10);
            }}
            className={`btn btn-sm ${selectedRange === 'today' ? 'btn-primary text-white' : 'btn-ghost text-gray-500'}`}
          >
            Today
          </button>
          <button
            onClick={() => {
              setSelectedRange('7days');
              setHistoryPageSize(10);
            }}
            className={`btn btn-sm ${selectedRange === '7days' ? 'btn-primary text-white' : 'btn-ghost text-gray-500'}`}
          >
            7 Days
          </button>
          <button
            onClick={() => {
              setSelectedRange('30days');
              setHistoryPageSize(10);
            }}
            className={`btn btn-sm ${selectedRange === '30days' ? 'btn-primary text-white' : 'btn-ghost text-gray-500'}`}
          >
            30 Days
          </button>
        </div>
      </div>

      <AppCard>
        <div className="flex items-center gap-3 mb-4">
          <IconWrapper icon={FaChartLine} />
          <h3 className="font-bold text-lg">Transaction History</h3>
        </div>
        
        <div className="flex flex-col gap-4">
          {filteredTransactions.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No transactions found.</p>
          ) : (
            <>
              {filteredTransactions.slice(0, historyPageSize).map((tx) => (
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
              {filteredTransactions.length > historyPageSize && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setHistoryPageSize(prev => prev + 10)}
                    className="btn btn-sm btn-outline btn-primary"
                  >
                    Load More ({filteredTransactions.length - historyPageSize} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </AppCard>
    </div>
  );
};

export default AdminStats;
