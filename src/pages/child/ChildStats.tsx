import { useAppStore } from '../../store/useAppStore';
import { H1Header } from '../../components/design-system/H1Header';
import { FaStar, FaTrophy, FaChartPie } from 'react-icons/fa';

const ChildStats = () => {
  const { activeChildId, children, transactions, tasks, rewards, childLogs } = useAppStore();
  const child = children.find(c => c.id === activeChildId);

  if (!child) return <div>Loading...</div>;

  // Helper to format date friendly
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    
    if (isToday) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Helper to get transaction details
  const getTransactionDetails = (t: typeof transactions[0]) => {
    let name = '';
    let description = '';

    if (t.type === 'TASK_VERIFIED') {
      // Find log to get task_id
      // Note: reference_id matches log.id
      const log = childLogs.find(l => l.id === t.reference_id);
      if (log) {
        const task = tasks.find(tsk => tsk.id === log.task_id);
        name = task?.name || 'Unknown Mission';
      } else {
        name = 'Mission Completed'; // Fallback if log not found in recent cache
      }
      description = 'Earned Stars';
    } else if (t.type === 'REWARD_REDEEMED') {
      // reference_id matches reward.id
      const reward = rewards.find(r => r.id === t.reference_id);
      name = reward?.name || 'Reward Redeemed';
      description = 'Spent Stars';
    } else {
      name = t.description || 'Manual Adjustment';
      description = t.amount > 0 ? 'Bonus' : 'Penalty';
    }

    return { name, description };
  };

  // Calculate basic stats from transactions
  const earned = transactions
    .filter(t => t.child_id === child.id && t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const spent = transactions
    .filter(t => t.child_id === child.id && t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  return (
    <div className="flex flex-col gap-6">
      <H1Header>My Stats</H1Header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card bg-white shadow-md rounded-xl p-4 flex flex-col items-center text-center">
          <div className="p-3 bg-yellow-100 text-warning rounded-full mb-2">
            <FaStar className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-gray-800">{earned}</span>
          <span className="text-xs text-gray-500 uppercase font-bold">Earned</span>
        </div>

        <div className="card bg-white shadow-md rounded-xl p-4 flex flex-col items-center text-center">
          <div className="p-3 bg-blue-100 text-primary rounded-full mb-2">
            <FaTrophy className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-gray-800">{spent}</span>
          <span className="text-xs text-gray-500 uppercase font-bold">Spent</span>
        </div>
      </div>

      {/* Balance Chart Representation */}
      <div className="card bg-white shadow-md rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <FaChartPie className="text-gray-400" />
          <h3 className="text-lg font-bold text-gray-700">Balance Breakdown</h3>
        </div>

        <div className="flex flex-col gap-4">
          {/* Current Balance Bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Current Balance</span>
              <span className="font-bold text-primary">{child.current_balance} Stars</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-primary h-4 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((child.current_balance / (earned || 1)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Spending Bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Total Spent</span>
              <span className="font-bold text-error">{spent} Stars</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-error h-4 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((spent / (earned || 1)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent History (Simple List) */}
      <div className="card bg-white shadow-md rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4">Recent History</h3>
        <div className="flex flex-col gap-3">
          {transactions
            .filter(t => t.child_id === child.id)
            .slice(0, 10)
            .map(t => {
              const details = getTransactionDetails(t);
              return (
                <div key={t.id} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-none last:pb-0">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-700 text-sm">{details.name}</span>
                    <span className="text-xs text-gray-400">{formatDate(t.created_at)}</span>
                  </div>
                  <span className={`font-bold ${t.amount > 0 ? 'text-green-500' : t.amount < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                    {t.amount !== 0 ? (
                      <>{t.amount > 0 ? '+' : ''}{t.amount}</>
                    ) : (
                      <span className="text-xs uppercase">
                        {t.type === 'TASK_VERIFIED' ? 'Done' : t.type === 'REWARD_REDEEMED' ? 'Redeemed' : '-'}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
            {transactions.filter(t => t.child_id === child.id).length === 0 && (
              <p className="text-gray-400 text-center text-sm">No activity yet.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default ChildStats;

