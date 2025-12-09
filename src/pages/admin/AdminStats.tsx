import { useState, useMemo } from 'react';
import { FaChartLine, FaCheckCircle, FaGift, FaSlidersH, FaTimesCircle, FaChild, FaTrophy, FaExclamationTriangle, FaLightbulb, FaPiggyBank, FaWallet, FaBalanceScale } from 'react-icons/fa';
import { AppCard, H1Header, IconWrapper, ToggleButton } from '../../components/design-system';
import { useAppStore } from '../../store/useAppStore';
import { calculateCoinMetrics, getSuccessRatio, getTopTasks, getExceptionRate, getRedemptionRatio, getRecommendations } from '../../utils/analytics';
import type { TimeFilter } from '../../utils/analytics';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const AdminStats = () => {
  const { children, transactions, childLogs, tasks, isLoading } = useAppStore();
  const [selectedChildId, setSelectedChildId] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [visibleTxCount, setVisibleTxCount] = useState(10);

  const handleTimeFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter);
    setVisibleTxCount(10);
  };

  // Filter Data based on Time and Child
  const filteredData = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    let startTime = today;
    if (timeFilter === 'week') startTime = today - (6 * oneDay);
    if (timeFilter === 'month') startTime = today - (29 * oneDay);

    const filterItem = (dateStr: string, childId: string) => {
      const date = new Date(dateStr).getTime();
      if (date < startTime) return false;
      if (selectedChildId !== 'all' && childId !== selectedChildId) return false;
      return true;
    };

    const filteredTransactions = transactions.filter(t => filterItem(t.created_at, t.child_id));
    const filteredLogs = childLogs.filter(l => filterItem(l.completed_at, l.child_id));

    return { filteredTransactions, filteredLogs };
  }, [transactions, childLogs, timeFilter, selectedChildId]);

  const { filteredTransactions, filteredLogs } = filteredData;

  // Calculate Metrics
  const coinMetrics = useMemo(() => calculateCoinMetrics(filteredTransactions), [filteredTransactions]);
  const successMetrics = useMemo(() => getSuccessRatio(filteredLogs, tasks, children, timeFilter, selectedChildId), [filteredLogs, tasks, children, timeFilter, selectedChildId]);
  const topSuccessTasks = useMemo(() => getTopTasks(filteredLogs, tasks, 'success'), [filteredLogs, tasks]);
  const topFailTasks = useMemo(() => getTopTasks(filteredLogs, tasks, 'fail'), [filteredLogs, tasks]);
  const exceptionMetrics = useMemo(() => getExceptionRate(filteredLogs), [filteredLogs]);
  const redemptionMetrics = useMemo(() => getRedemptionRatio(filteredTransactions), [filteredTransactions]);
  const recommendations = useMemo(() => getRecommendations(filteredLogs, tasks), [filteredLogs, tasks]);

  // History List (Combined & Sorted)
  const visibleHistory = useMemo(() => {
    const rejectedMissions = filteredLogs.filter(log => ['REJECTED', 'FAILED', 'EXCUSED'].includes(log.status));

    const combined = [
      ...filteredTransactions.map(t => ({
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
    ].sort((a, b) => {
      // Sort Priority:
      // 1. Approve (TASK_VERIFIED)
      // 2. Manual Add (MANUAL_ADJ > 0)
      // 3. Reduction (REWARD_REDEEMED or MANUAL_ADJ < 0)
      // 4. Rejected (REJECTED or FAILED)
      // 5. Excused (EXCUSED)

      const getWeight = (item: typeof a) => {
        if (item.type === 'transaction') {
          const tx = item.data;
          if (tx.type === 'TASK_VERIFIED') return 1;
          if (tx.type === 'MANUAL_ADJ' && tx.amount > 0) return 2;
          if (tx.amount < 0) return 3;
          return 6;
        } else {
          const log = item.data;
          if (log.status === 'REJECTED' || log.status === 'FAILED') return 4;
          if (log.status === 'EXCUSED') return 5;
          return 6;
        }
      };

      const weightA = getWeight(a);
      const weightB = getWeight(b);

      if (weightA !== weightB) return weightA - weightB;

      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return combined;
  }, [filteredTransactions, filteredLogs]);

  const getChildName = (childId: string) => children.find(c => c.id === childId)?.name || 'Unknown';

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
    return task?.name || 'Unknown Mission';
  };

  // Donut Chart Data
  const donutData = [
    { name: 'Success', value: successMetrics.completed, color: '#4ADE80' }, // success
    { name: 'Remaining', value: Math.max(0, successMetrics.expected - successMetrics.completed), color: '#E5E7EB' } // base-200
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pb-20 animate-pulse">
        <div className="h-8 w-48 bg-base-200 rounded"></div>
        <div className="h-10 w-full bg-base-200 rounded"></div>
        <div className="h-32 w-full bg-base-200 rounded"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-40 bg-base-200 rounded"></div>
          <div className="h-40 bg-base-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex justify-between items-center">
        <H1Header>Reports & Audit</H1Header>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <ToggleButton label="All Children" isActive={selectedChildId === 'all'} onClick={() => setSelectedChildId('all')} />
          {children.map(child => (
            <ToggleButton key={child.id} label={child.name} isActive={selectedChildId === child.id} onClick={() => setSelectedChildId(child.id)} />
          ))}
        </div>
        <div className="flex gap-2">
          {['today', 'week', 'month'].map((f) => (
            <ToggleButton key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} isActive={timeFilter === f} onClick={() => handleTimeFilterChange(f as TimeFilter)} />
          ))}
        </div>
      </div>

      {/* Recommendations (Smart Insights) */}
      {recommendations.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1 px-1">
            <FaLightbulb className="text-warning w-4 h-4" />
            <h3 className="font-bold text-neutral text-sm">Smart Insights</h3>
          </div>
          {recommendations.map(rec => (
            <div key={rec.id} className={`alert ${rec.type === 'warning' ? 'alert-warning' : rec.type === 'success' ? 'alert-success' : 'alert-info'} shadow-sm text-sm py-2`}>
              <span>{rec.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* M2: Net Gain (Large Card) */}
      <AppCard className="bg-gradient-to-br from-primary/10 to-base-100 border-primary/20">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-neutral/60 font-bold text-sm uppercase mb-1">Net Star Gain</h2>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-black ${coinMetrics.net >= 0 ? 'text-primary' : 'text-error'}`}>
                {coinMetrics.net > 0 ? '+' : ''}{coinMetrics.net}
              </span>
              <span className="text-sm font-bold text-neutral/40">stars</span>
            </div>
            <p className="text-xs text-neutral/50 mt-2">
              Earned <span className="text-success font-bold">{coinMetrics.earned}</span> • Spent <span className="text-error font-bold">{coinMetrics.spent}</span>
            </p>
          </div>
          <div className="p-3 bg-primary/20 text-primary rounded-full">
            <FaChartLine className="w-6 h-6" />
          </div>
        </div>
      </AppCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* M1: Success Ratio (Donut) */}
        <AppCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-neutral">Success Rate</h3>
            <div className={`badge ${successMetrics.rate >= 80 ? 'badge-success' : successMetrics.rate >= 50 ? 'badge-warning' : 'badge-error'} gap - 1`}>
              {successMetrics.rate}%
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-24 w-24 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    innerRadius={35}
                    outerRadius={45}
                    paddingAngle={0}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell - ${index} `} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-neutral/40">{successMetrics.completed}/{successMetrics.expected}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <span className="text-neutral/60">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-base-200"></div>
                <span className="text-neutral/60">Remaining/Missed</span>
              </div>
            </div>
          </div>
        </AppCard>

        {/* M6: Redemption Ratio (Saver vs Spender) */}
        <AppCard>
          <div className="flex items-center gap-2 mb-2">
            <div className={`p - 2 rounded - full ${redemptionMetrics.type === 'Saver' ? 'bg-success/10 text-success' : redemptionMetrics.type === 'Spender' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'} `}>
              {redemptionMetrics.type === 'Saver' ? <FaPiggyBank className="w-4 h-4" /> : redemptionMetrics.type === 'Spender' ? <FaWallet className="w-4 h-4" /> : <FaBalanceScale className="w-4 h-4" />}
            </div>
            <h3 className="font-bold text-neutral">Spending Habit</h3>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-neutral">{redemptionMetrics.type}</span>
          </div>
          <div className="w-full bg-base-200 rounded-full h-2.5 mt-3 mb-1">
            <div className={`bg - primary h - 2.5 rounded - full`} style={{ width: `${Math.min(100, redemptionMetrics.ratio)}% ` }}></div>
          </div>
          <p className="text-xs text-neutral/40">
            Spends {redemptionMetrics.ratio}% of earnings.
          </p>
        </AppCard>
      </div>

      {/* M4: Top Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Success */}
        <AppCard className="bg-success/5 border-success/10">
          <div className="flex items-center gap-2 mb-3">
            <FaTrophy className="text-success w-4 h-4" />
            <h3 className="font-bold text-neutral">Top Completed</h3>
          </div>
          {topSuccessTasks.length === 0 ? (
            <p className="text-xs text-neutral/40 italic">No data yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {topSuccessTasks.map((t, i) => (
                <div key={t.id} className="flex justify-between items-center text-sm">
                  <span className="text-neutral font-medium truncate flex-1">{i + 1}. {t.name}</span>
                  <span className="font-bold text-success">{t.count}</span>
                </div>
              ))}
            </div>
          )}
        </AppCard>

        {/* Top Failures */}
        <AppCard className="bg-error/5 border-error/10">
          <div className="flex items-center gap-2 mb-3">
            <FaExclamationTriangle className="text-error w-4 h-4" />
            <h3 className="font-bold text-neutral">Needs Focus</h3>
          </div>
          {topFailTasks.length === 0 ? (
            <p className="text-xs text-neutral/40 italic">Great job! No failures.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {topFailTasks.map((t, i) => (
                <div key={t.id} className="flex justify-between items-center text-sm">
                  <span className="text-neutral font-medium truncate flex-1">{i + 1}. {t.name}</span>
                  <span className="font-bold text-error">{t.count}</span>
                </div>
              ))}
            </div>
          )}
        </AppCard>

        {/* M5: Exception Rate */}
        <AppCard>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-warning/10 text-warning rounded-full">
              <FaChild className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-neutral">Exception Rate</h3>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-neutral">{exceptionMetrics.rate}%</span>
            <span className="text-xs text-neutral/60 mb-1">of tasks excused</span>
          </div>
          <p className="text-xs text-neutral/40 mt-2">
            {exceptionMetrics.count} excused out of {exceptionMetrics.total} total tasks.
          </p>
        </AppCard>
      </div>



      {/* Transaction History */}
      <AppCard>
        <div className="flex items-center gap-3 mb-4">
          <IconWrapper icon={FaChartLine} />
          <h3 className="font-bold text-lg text-neutral">Transaction History</h3>
        </div>

        <div className="flex flex-col gap-4">
          {visibleHistory.slice(0, visibleTxCount).map((item) => {
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
                      {tx.description && <p className="text-xs text-neutral/50 italic mt-0.5">{tx.description}</p>}
                    </div>
                  </div>
                  <span className={`font-bold ${tx.amount > 0 ? 'text-success' : tx.amount < 0 ? 'text-error' : 'text-neutral/60'}`}>
                    {tx.amount !== 0 ? <>{tx.amount > 0 ? '+' : ''}{tx.amount}</> : <span className="text-xs uppercase">{tx.type === 'TASK_VERIFIED' ? 'Done' : '-'}</span>}
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
                      {isExcused && <p className="text-xs italic mt-0.5 text-warning">{log.notes || 'No reason provided'}</p>}
                    </div>
                  </div>
                  <span className={`font-bold ${isFailed ? 'text-neutral/40' : isExcused ? 'text-warning' : 'text-error'}`}>
                    <span className="text-xs uppercase">{isFailed ? 'Failed' : isExcused ? 'Excused' : 'Rejected'}</span>
                  </span>
                </div>
              );
            }
          })}

          {visibleHistory.length === 0 && <p className="text-center text-neutral/50 py-4">No activity found.</p>}

          {visibleHistory.length > visibleTxCount && (
            <button className="btn btn-ghost btn-sm w-full text-neutral/60" onClick={() => setVisibleTxCount(prev => prev + 10)}>
              Load More
            </button>
          )}
        </div>
      </AppCard>
    </div >
  );
};

export default AdminStats;
