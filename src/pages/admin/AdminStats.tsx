import { useState } from 'react';
import { FaChartLine, FaCheckCircle, FaGift, FaSlidersH, FaTimesCircle, FaChild } from 'react-icons/fa';
import { AppCard, H1Header, IconWrapper, ToggleButton } from '../../components/design-system';
import { useAppStore } from '../../store/useAppStore';
import { parseRRule, isDateValid } from '../../utils/recurrence';

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
  const rejectedMissions = childLogs.filter(log => log.status === 'REJECTED' || log.status === 'FAILED' || log.status === 'EXCUSED');

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
        <AppCard className="bg-gradient-to-br from-info/10 to-base-100 border-info/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-info/10 text-info rounded-full">
              <FaChartLine className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-neutral">Completion Rate</h3>
          </div>
          {(() => {
            const completedCount = filteredHistory.filter(i => i.type === 'transaction' && i.data.type === 'TASK_VERIFIED').length;

            // Calculate Total Expected Tasks
            let expectedCount = 0;
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            let startDate = new Date(today);
            let endDate = new Date(today);

            if (timeFilter === 'week') {
              startDate.setDate(today.getDate() - 6);
            } else if (timeFilter === 'month') {
              startDate.setDate(today.getDate() - 29);
            }

            const activeTasks = tasks.filter(t => t.is_active !== false);

            // Iterate through each day in the range
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
              const currentDate = new Date(d);

              activeTasks.forEach(task => {
                // Determine which children are relevant for this task AND the current filter
                const relevantChildren = (task.assigned_to || []).filter(childId => {
                  if (selectedChildId !== 'all' && childId !== selectedChildId) return false;
                  return children.some(c => c.id === childId);
                });

                if (relevantChildren.length === 0) return;

                // Check if task is valid for this day
                if (task.recurrence_rule) {
                  const options = parseRRule(task.recurrence_rule);
                  const baseDate = new Date(task.created_at || new Date()); // Fallback to now if missing

                  if (isDateValid(currentDate, options, baseDate)) {
                    // If valid, it counts for EACH assigned child
                    expectedCount += relevantChildren.length;
                  }
                }
              });
            }

            // Fallback: If expected is 0 (e.g. no tasks), prevent division by zero
            // Also, if completed > expected (e.g. bonus tasks or logic drift), cap at 100%? 
            // No, let's show >100% if they did extra, or just clamp. 
            // Usually expected >= completed.
            if (expectedCount < completedCount) expectedCount = completedCount;

            const rate = expectedCount === 0 ? 0 : Math.round((completedCount / expectedCount) * 100);

            let colorClass = 'text-neutral/40';
            if (expectedCount > 0) {
              if (rate >= 80) colorClass = 'text-success';
              else if (rate >= 50) colorClass = 'text-warning';
              else colorClass = 'text-error';
            }

            return (
              <div>
                <div className="flex items-end gap-2">
                  <span className={`text-3xl font-bold ${colorClass}`}>{rate}%</span>
                  <span className="text-xs text-neutral/60 mb-1">success rate</span>
                </div>
                <p className="text-xs text-neutral/40 mt-2">
                  {completedCount} completed / {expectedCount} expected
                </p>
              </div>
            );
          })()}
        </AppCard>

        {/* Insight 2: Needs Focus */}
        <AppCard className="bg-gradient-to-br from-warning/10 to-base-100 border-warning/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-warning/10 text-warning rounded-full">
              <FaTimesCircle className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-neutral">Needs Focus</h3>
          </div>
          {(() => {
            const failures = filteredHistory.filter(i => i.type === 'rejected_mission' && i.data.status !== 'EXCUSED');
            if (failures.length === 0) {
              return <p className="text-sm text-neutral/60 italic">No missed missions in this period. Great job!</p>;
            }

            // Count failures by task_id
            const counts: Record<string, number> = {};
            failures.forEach(f => {
              // We know f.data is ChildTaskLog because we filtered by 'rejected_mission'
              const log = f.data as any;
              const taskId = log.task_id;
              counts[taskId] = (counts[taskId] || 0) + 1;
            });

            // Find max
            const mostMissedId = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
            const taskName = tasks.find(t => t.id === mostMissedId)?.name || 'Unknown Mission';
            const count = counts[mostMissedId];

            return (
              <div>
                <p className="font-bold text-neutral line-clamp-1" title={taskName}>{taskName}</p>
                <p className="text-xs text-error font-bold mt-1">{count} misses</p>
                <p className="text-xs text-neutral/40 mt-2">
                  Consider adjusting difficulty or rewards.
                </p>
              </div>
            );
          })()}
        </AppCard>

        {/* Insight 3: Star Flow */}
        <AppCard className="bg-gradient-to-br from-success/10 to-base-100 border-success/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-success/10 text-success rounded-full">
              <FaGift className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-neutral">Star Flow</h3>
          </div>
          {(() => {
            const txs = filteredHistory.filter(i => i.type === 'transaction').map(i => i.data);
            const earned = txs.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
            const spent = txs.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);

            return (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral/60">Earned</span>
                  <span className="font-bold text-success">+{earned}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral/60">Spent</span>
                  <span className="font-bold text-error">-{spent}</span>
                </div>
                <div className="h-px bg-base-200 my-1"></div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-neutral">Net</span>
                  <span className={`font-bold ${earned - spent >= 0 ? 'text-info' : 'text-warning'}`}>
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
          <h3 className="font-bold text-lg text-neutral">Transaction History</h3>
        </div>

        <div className="flex flex-col gap-4">
          {visibleHistory.length === 0 ? (
            <p className="text-center text-neutral/50 py-4">No activity found.</p>
          ) : (
            <>
              {visibleHistory.map((item) => {
                if (item.type === 'transaction') {
                  const tx = item.data;

                  let Icon = FaCheckCircle;
                  let iconBg = 'bg-success/10';
                  let iconColor = 'text-success';

                  if (tx.type === 'REWARD_REDEEMED') {
                    Icon = FaGift;
                    iconBg = 'bg-warning/10';
                    iconColor = 'text-warning';
                  } else if (tx.type === 'MANUAL_ADJ') {
                    Icon = FaSlidersH;
                    iconBg = 'bg-info/10';
                    iconColor = 'text-info';
                  }

                  return (
                    <div key={item.id} className="flex justify-between items-center border-b border-base-200 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${iconBg} ${iconColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-neutral">{getTxDescription(tx)}</p>
                          <p className="text-xs text-neutral/60">
                            {getChildName(tx.child_id)} • {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                          {tx.description && (
                            <p className="text-xs text-neutral/50 italic mt-0.5">
                              {tx.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`font-bold ${tx.amount > 0 ? 'text-success' : tx.amount < 0 ? 'text-error' : 'text-neutral/60'}`}>
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
                  const isExcused = log.status === 'EXCUSED';

                  return (
                    <div key={item.id} className="flex justify-between items-center border-b border-base-200 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isFailed ? 'bg-base-200 text-neutral/60' : isExcused ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'}`}>
                          {isExcused ? <FaChild className="w-4 h-4" /> : <FaTimesCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-neutral">{getRejectedMissionDetails(log)}</p>
                          <p className="text-xs text-neutral/60">
                            {getChildName(log.child_id)} • {new Date(log.completed_at).toLocaleDateString()}
                          </p>
                          {log.rejection_reason && !isExcused && (
                            <p className={`text-xs italic mt-0.5 ${isFailed ? 'text-neutral/60' : 'text-error'}`}>
                              {isFailed ? 'Missed Deadline' : `Reason: ${log.rejection_reason}`}
                            </p>
                          )}
                          {isExcused && (
                            <p className="text-xs italic mt-0.5 text-warning">
                              {log.notes || 'No reason provided'}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`font-bold ${isFailed ? 'text-neutral/40' : isExcused ? 'text-warning' : 'text-error'}`}>
                        <span className="text-xs uppercase">{isFailed ? 'Failed' : isExcused ? 'Excused' : 'Rejected'}</span>
                      </span>
                    </div>
                  );
                }
              })}

              {hasMore && (
                <button
                  className="btn btn-ghost btn-sm w-full text-neutral/60"
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
