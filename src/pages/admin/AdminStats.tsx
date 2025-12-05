import { useState } from 'react';
import { FaChartLine, FaCheckCircle, FaGift, FaSlidersH, FaTimesCircle } from 'react-icons/fa';
import { AppCard, H1Header, IconWrapper, ToggleButton } from '../../components/design-system';
import { useAppStore } from '../../store/useAppStore';

const AdminStats = () => {
  const { children, transactions, childLogs, tasks } = useAppStore();
  const [selectedChildId, setSelectedChildId] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('today');
  const [visibleTxCount, setVisibleTxCount] = useState(10);

  const handleTimeFilterChange = (filter: 'today' | 'week' | 'month') => {
    setTimeFilter(filter);
    setVisibleTxCount(10);
  };

  // Get rejected mission logs
  const rejectedMissions = childLogs.filter(log => log.status === 'REJECTED' || log.status === 'FAILED');

  // Combine transactions and rejected missions
  const combinedHistory = [
    ...transactions.map(t => ({
      id: t.id,
      type: 'transaction' as const,
      data: t,
      date: t.created_at,
      child_id: t.child_id
    })),
    ...rejectedMissions.map(log => ({
      id: log.id,
      type: 'rejected_mission' as const,
      data: log,
      date: log.completed_at,
      child_id: log.child_id
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredHistory = combinedHistory.filter(item => {
    // 1. Child Filter
    if (selectedChildId !== 'all' && item.child_id !== selectedChildId) return false;

    // 2. Time Filter
    const itemDate = new Date(item.date).getTime();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    if (timeFilter === 'today') {
      return itemDate >= today;
    }
    if (timeFilter === 'week') {
      return itemDate >= today - (6 * oneDay);
    }
    if (timeFilter === 'month') {
      return itemDate >= today - (29 * oneDay);
    }

    return true;
  });

  const visibleHistory = filteredHistory.slice(0, visibleTxCount);
  const hasMore = visibleHistory.length < filteredHistory.length;

  const getChildName = (childId: string) => {
    return children.find(c => c.id === childId)?.name || 'Unknown';
  };

  const getTxDescription = (tx: typeof transactions[0]) => {
    switch (tx.type) {
      case 'TASK_VERIFIED': return 'Mission Completed';
      case 'REWARD_REDEEMED': return 'Reward Redeemed';
      case 'MANUAL_ADJ': return 'Manual Adjustment';
      default: return 'Transaction';
    }
  };

  const getRejectedMissionDetails = (log: typeof childLogs[0]) => {
    const task = tasks.find(tsk => tsk.id === log.task_id);
    const name = task?.name || 'Unknown Mission';
    return name;
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
          <ToggleButton
            label="All Children"
            isActive={selectedChildId === 'all'}
            onClick={() => setSelectedChildId('all')}
          />
          {children.map(child => (
            <ToggleButton
              key={child.id}
              label={child.name}
              isActive={selectedChildId === child.id}
              onClick={() => setSelectedChildId(child.id)}
            />
          ))}
        </div>

        {/* Time Filter */}
        <div className="flex gap-2">
          <ToggleButton
            label="Today"
            isActive={timeFilter === 'today'}
            onClick={() => handleTimeFilterChange('today')}
          />
          <ToggleButton
            label="Week"
            isActive={timeFilter === 'week'}
            onClick={() => handleTimeFilterChange('week')}
          />
          <ToggleButton
            label="Month"
            isActive={timeFilter === 'month'}
            onClick={() => handleTimeFilterChange('month')}
          />
        </div>
      </div>

      {/* Key Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Insight 1: Completion Rate */}
        <AppCard className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full">
              <FaChartLine className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-gray-700">Completion Rate</h3>
          </div>
          {(() => {
            const completed = filteredHistory.filter(i => i.type === 'transaction' && i.data.type === 'TASK_VERIFIED').length;
            const failed = filteredHistory.filter(i => i.type === 'rejected_mission').length;
            const total = completed + failed;
            const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

            let colorClass = 'text-gray-400';
            if (total > 0) {
              if (rate >= 80) colorClass = 'text-green-500';
              else if (rate >= 50) colorClass = 'text-yellow-500';
              else colorClass = 'text-red-500';
            }

            return (
              <div>
                <div className="flex items-end gap-2">
                  <span className={`text-3xl font-bold ${colorClass}`}>{rate}%</span>
                  <span className="text-xs text-gray-500 mb-1">success rate</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {completed} completed vs {failed} missed
                </p>
              </div>
            );
          })()}
        </AppCard>

        {/* Insight 2: Needs Focus */}
        <AppCard className="bg-gradient-to-br from-orange-50 to-white border-orange-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
              <FaTimesCircle className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-gray-700">Needs Focus</h3>
          </div>
          {(() => {
            const failures = filteredHistory.filter(i => i.type === 'rejected_mission');
            if (failures.length === 0) {
              return <p className="text-sm text-gray-500 italic">No missed missions in this period. Great job!</p>;
            }

            // Count failures by task_id
            const counts: Record<string, number> = {};
            failures.forEach(f => {
              const taskId = f.data.task_id;
              counts[taskId] = (counts[taskId] || 0) + 1;
            });

            // Find max
            const mostMissedId = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
            const taskName = tasks.find(t => t.id === mostMissedId)?.name || 'Unknown Mission';
            const count = counts[mostMissedId];

            return (
              <div>
                <p className="font-bold text-gray-800 line-clamp-1" title={taskName}>{taskName}</p>
                <p className="text-xs text-red-500 font-bold mt-1">{count} misses</p>
                <p className="text-xs text-gray-400 mt-2">
                  Consider adjusting difficulty or rewards.
                </p>
              </div>
            );
          })()}
        </AppCard>

        {/* Insight 3: Star Flow */}
        <AppCard className="bg-gradient-to-br from-green-50 to-white border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-100 text-green-600 rounded-full">
              <FaGift className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-gray-700">Star Flow</h3>
          </div>
          {(() => {
            const txs = filteredHistory.filter(i => i.type === 'transaction').map(i => i.data);
            const earned = txs.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
            const spent = txs.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);

            return (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Earned</span>
                  <span className="font-bold text-green-600">+{earned}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Spent</span>
                  <span className="font-bold text-red-500">-{spent}</span>
                </div>
                <div className="h-px bg-gray-200 my-1"></div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700">Net</span>
                  <span className={`font-bold ${earned - spent >= 0 ? 'text-blue-600' : 'text-orange-500'}`}>
                    {earned - spent > 0 ? '+' : ''}{earned - spent}
                  </span>
                </div>
              </div>
            );
          })()}
        </AppCard>
      </div>

      <AppCard>
        <div className="flex items-center gap-3 mb-4">
          <IconWrapper icon={FaChartLine} />
          <h3 className="font-bold text-lg">Transaction History</h3>
        </div>

        <div className="flex flex-col gap-4">
          {visibleHistory.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No activity found.</p>
          ) : (
            <>
              {visibleHistory.map((item) => {
                if (item.type === 'transaction') {
                  const tx = item.data;

                  let Icon = FaCheckCircle;
                  let iconBg = 'bg-green-100';
                  let iconColor = 'text-green-600';

                  if (tx.type === 'REWARD_REDEEMED') {
                    Icon = FaGift;
                    iconBg = 'bg-orange-100';
                    iconColor = 'text-orange-600';
                  } else if (tx.type === 'MANUAL_ADJ') {
                    Icon = FaSlidersH;
                    iconBg = 'bg-blue-100';
                    iconColor = 'text-blue-600';
                  }

                  return (
                    <div key={item.id} className="flex justify-between items-center border-b border-base-200 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${iconBg} ${iconColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{getTxDescription(tx)}</p>
                          <p className="text-xs text-gray-500">
                            {getChildName(tx.child_id)} • {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                          {tx.description && (
                            <p className="text-xs text-gray-500 italic mt-0.5">
                              {tx.description}
                            </p>
                          )}
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
                  );
                } else {
                  const log = item.data;
                  const isFailed = log.status === 'FAILED';

                  return (
                    <div key={item.id} className="flex justify-between items-center border-b border-base-200 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isFailed ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-600'}`}>
                          <FaTimesCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{getRejectedMissionDetails(log)}</p>
                          <p className="text-xs text-gray-500">
                            {getChildName(log.child_id)} • {new Date(log.completed_at).toLocaleDateString()}
                          </p>
                          {log.rejection_reason && (
                            <p className={`text-xs italic mt-0.5 ${isFailed ? 'text-gray-500' : 'text-red-500'}`}>
                              {isFailed ? 'Missed Deadline' : `Reason: ${log.rejection_reason}`}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`font-bold ${isFailed ? 'text-gray-400' : 'text-red-500'}`}>
                        <span className="text-xs uppercase">{isFailed ? 'Failed' : 'Rejected'}</span>
                      </span>
                    </div>
                  );
                }
              })}

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
