import { useState, useMemo, useEffect } from 'react';
import { FaChartLine, FaCheckCircle, FaGift, FaSlidersH, FaTimesCircle, FaChild, FaTrophy, FaExclamationTriangle, FaLightbulb, FaTimes } from 'react-icons/fa';
import { AppCard, H1Header, IconWrapper, ToggleButton } from '../../components/design-system';

import { useAppStore } from '../../store/useAppStore';
import { calculateCoinMetrics, getSuccessRatio, getTopTasks, getRecommendations, getCategoryPerformance } from '../../utils/analytics';
import { ICON_MAP } from '../../utils/icons';
import type { TimeFilter } from '../../utils/analytics';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';
import TaskDetailsModal from '../../components/modals/TaskDetailsModal';

const AdminStats = () => {
  const { children, transactions, childLogs, tasks, categories, isLoading } = useAppStore();
  const [selectedChildId, setSelectedChildId] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [specificDate, setSpecificDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tempDate, setTempDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [visibleTxCount, setVisibleTxCount] = useState(10);
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);

  // Load dismissed state on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dismissed_insights_v1');
      if (stored) {
        const { date, ids } = JSON.parse(stored);
        // Simple local date check (YYYY-MM-DD)
        const today = new Date().toLocaleDateString('en-CA');

        if (date === today) {
          setDismissedInsights(ids);
        } else {
          // Reset if date changed (new day = show insights again)
          localStorage.removeItem('dismissed_insights_v1');
        }
      }
    } catch (e) {
      console.error('Failed to load dismissed insights', e);
    }
  }, []);

  const handleDismiss = (id: string) => {
    const newIds = [...dismissedInsights, id];
    setDismissedInsights(newIds);

    const today = new Date().toLocaleDateString('en-CA');
    localStorage.setItem('dismissed_insights_v1', JSON.stringify({
      date: today,
      ids: newIds
    }));
  };

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

    const filterItem = (dateStr: string, childId: string, isLog: boolean = false, status?: string) => {
      const date = new Date(dateStr).getTime();

      if (timeFilter === 'specific') {
        // Compare YYYY-MM-DD strings in local time
        const itemDateStr = new Date(dateStr).toLocaleDateString('en-CA');
        return specificDate === itemDateStr;
      }

      // Special case: Show yesterday's failures/excused in 'Today' view
      // This allows parents to see what happened yesterday without switching to 'Week'
      if (timeFilter === 'today' && isLog && (status === 'FAILED' || status === 'EXCUSED')) {
        const yesterday = today - oneDay;
        // Check if it's exactly yesterday (or after yesterday start)
        // We use >= yesterday because 'today' variable is start of today. 
        // 'yesterday' variable is start of yesterday.
        if (date >= yesterday) {
          if (selectedChildId !== 'all' && childId !== selectedChildId) return false;
          return true;
        }
      }

      if (date < startTime) return false;
      if (selectedChildId !== 'all' && childId !== selectedChildId) return false;
      return true;
    };

    const filteredTransactions = transactions.filter(t => filterItem(t.created_at, t.child_id));
    const filteredLogs = childLogs.filter(l => filterItem(l.completed_at, l.child_id, true, l.status));

    return { filteredTransactions, filteredLogs };
  }, [transactions, childLogs, timeFilter, selectedChildId, specificDate]);

  const { filteredTransactions, filteredLogs } = filteredData;

  // Calculate Metrics
  const coinMetrics = useMemo(() => calculateCoinMetrics(filteredTransactions), [filteredTransactions]);
  const successMetrics = useMemo(() => getSuccessRatio(filteredLogs, tasks, children, timeFilter, selectedChildId), [filteredLogs, tasks, children, timeFilter, selectedChildId]);
  const topSuccessTasks = useMemo(() => getTopTasks(filteredLogs, tasks, 'success'), [filteredLogs, tasks]);
  const topFailTasks = useMemo(() => getTopTasks(filteredLogs, tasks, 'fail'), [filteredLogs, tasks]);
  const rawRecommendations = useMemo(() => getRecommendations(filteredLogs, tasks), [filteredLogs, tasks]);

  const recommendations = useMemo(() =>
    rawRecommendations.filter(r => !dismissedInsights.includes(r.id)),
    [rawRecommendations, dismissedInsights]);

  // Category Metrics
  const categoryMetrics = useMemo(() =>
    getCategoryPerformance(categories, filteredLogs, filteredTransactions, tasks),
    [categories, filteredLogs, filteredTransactions, tasks]
  );

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

  const [statusFilter, setStatusFilter] = useState<'all' | 'earned' | 'spent' | 'failed'>('all');

  // Filtered History based on Status
  const finalHistory = useMemo(() => {
    return visibleHistory.filter(item => {
      if (statusFilter === 'all') return true;

      if (statusFilter === 'earned') {
        return item.type === 'transaction' && item.data.amount > 0;
      }

      if (statusFilter === 'spent') {
        return item.type === 'transaction' && item.data.amount < 0;
      }

      if (statusFilter === 'failed') {
        return item.type === 'rejected_mission';
      }

      return true;
    });
  }, [visibleHistory, statusFilter]);

  const getChildName = (childId: string) => children.find(c => c.id === childId)?.name || 'Unknown';

  const getTxDescription = (tx: typeof transactions[0]) => {
    switch (tx.type) {
      case 'TASK_VERIFIED': {
        const log = childLogs.find(l => l.id === tx.reference_id);
        const task = log ? tasks.find(t => t.id === log.task_id) : null;
        return task ? task.name : 'Mission Completed';
      }
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
    { name: 'Verified', value: successMetrics.verified, color: '#4ADE80' }, // success
    { name: 'Failed', value: successMetrics.failed, color: '#F87171' }, // error
    { name: 'Excused', value: successMetrics.excused, color: '#FBBF24' }, // warning
    { name: 'Review', value: successMetrics.pendingReview, color: '#60A5FA' }, // blue-400
    ...(timeFilter === 'today' ? [{ name: 'To Do', value: successMetrics.todo, color: '#E5E7EB' }] : []) // base-200
  ];

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<any>(null);

  const handleHistoryItemClick = (item: any) => {
    let task = null;

    if (item.type === 'transaction') {
      const tx = item.data;
      if (tx.type === 'TASK_VERIFIED') {
        const log = childLogs.find(l => l.id === tx.reference_id);
        if (log) {
          task = tasks.find(t => t.id === log.task_id);
        }
      }
    } else {
      const log = item.data;
      task = tasks.find(t => t.id === log.task_id);
    }

    if (task) {
      setSelectedTaskDetails(task);
      setIsDetailsModalOpen(true);
    }
  };

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
        <div className="flex flex-wrap gap-2 items-center">
          {['today', 'week', 'month'].map((f) => (
            <ToggleButton key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} isActive={timeFilter === f} onClick={() => handleTimeFilterChange(f as TimeFilter)} />
          ))}
          <ToggleButton label="Specific Date" isActive={timeFilter === 'specific'} onClick={() => handleTimeFilterChange('specific')} />

          {timeFilter === 'specific' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={tempDate}
                onChange={(e) => setTempDate(e.target.value)}
                className="input input-sm input-bordered rounded-full"
              />
              <button
                className="btn btn-sm btn-primary rounded-full"
                onClick={() => setSpecificDate(tempDate)}
              >
                Apply
              </button>
            </div>
          )}
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
            <div key={rec.id} className={`alert ${rec.type === 'warning' ? 'alert-warning' : rec.type === 'success' ? 'alert-success' : 'alert-info'} shadow-sm text-sm py-2 relative pr-8`}>
              <span>{rec.message}</span>
              <button
                onClick={() => handleDismiss(rec.id)}
                className="absolute right-2 top-2 p-1 opacity-50 hover:opacity-100 transition-opacity"
              >
                <FaTimes className="w-3 h-3" />
              </button>
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
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-neutral/40">{successMetrics.verified}/{successMetrics.total}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <span className="text-neutral/60">Verified ({successMetrics.verified})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-error"></div>
                <span className="text-neutral/60">Failed ({successMetrics.failed})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-warning"></div>
                <span className="text-neutral/60">Excused ({successMetrics.excused})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-neutral/60">Review ({successMetrics.pendingReview})</span>
              </div>
              {timeFilter === 'today' && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-base-200"></div>
                  <span className="text-neutral/60">To Do ({successMetrics.todo})</span>
                </div>
              )}
            </div>
          </div>
        </AppCard>


      </div>

      {/* Category Performance */}
      <AppCard>
        <div className="flex items-center gap-3 mb-4">
          <IconWrapper icon={FaChartLine} className="bg-primary/10 text-primary" />
          <h3 className="font-bold text-lg text-neutral">Category Performance</h3>
        </div>
        {categoryMetrics.length === 0 ? (
          <p className="text-center text-neutral/50 py-4">No data available for this period.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {categoryMetrics.map((cat) => {
              const Icon = ICON_MAP[cat.icon] || ICON_MAP['default'];
              const percentage = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;

              return (
                <div key={cat.id} className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-base-200 text-neutral/60">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-neutral text-sm">{cat.name}</span>
                      <span className="text-xs font-bold text-primary">{cat.earned} Stars</span>
                    </div>
                    <div className="w-full bg-base-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-neutral/40">{cat.completed}/{cat.total} Completed</span>
                      <span className="text-[10px] text-neutral/40">{percentage}% Success</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AppCard>



      {/* M4: Top Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Success */}
        <AppCard className="bg-success/5 border-success/10">
          <div className="flex items-center gap-2 mb-3">
            <FaTrophy className="text-success w-4 h-4" />
            <h3 className="font-bold text-neutral">Most Completed</h3>
          </div>
          {topSuccessTasks.length === 0 ? (
            <p className="text-xs text-neutral/40 italic">No data yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {topSuccessTasks.map((t, i) => (
                <div key={t.id} className="flex justify-between items-center text-sm">
                  <span className="text-neutral font-medium truncate flex-1">{i + 1}. {t.name}</span>
                  <span className="font-bold text-success">{t.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </AppCard>

        {/* Top Failures */}
        <AppCard className="bg-error/5 border-error/10">
          <div className="flex items-center gap-2 mb-3">
            <FaExclamationTriangle className="text-error w-4 h-4" />
            <h3 className="font-bold text-neutral">Most Failed</h3>
          </div>
          {topFailTasks.length === 0 ? (
            <p className="text-xs text-neutral/40 italic">Great job! No failures.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {topFailTasks.map((t, i) => (
                <div key={t.id} className="flex justify-between items-center text-sm">
                  <span className="text-neutral font-medium truncate flex-1">{i + 1}. {t.name}</span>
                  <span className="font-bold text-error">{t.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </AppCard>


      </div>



      {/* Transaction History */}
      <AppCard>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <IconWrapper icon={FaChartLine} />
            <h3 className="font-bold text-lg text-neutral">Transaction History</h3>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {[
              { id: 'all', label: 'All' },
              { id: 'earned', label: 'Earned' },
              { id: 'spent', label: 'Spent' },
              { id: 'failed', label: 'Failed' }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id as any)}
                className={`btn btn-xs sm:btn-sm rounded-full normal-case ${statusFilter === filter.id
                  ? 'btn-primary text-white'
                  : 'btn-ghost bg-base-200 text-neutral/60'
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {finalHistory.slice(0, visibleTxCount).map((item) => {
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
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`flex justify-between items-center border-b border-base-200 pb-3 last:border-0 last:pb-0 ${tx.type === 'TASK_VERIFIED' ? 'cursor-pointer hover:bg-base-200/50 transition-colors rounded-lg px-2 -mx-2' : ''}`}
                    onClick={() => handleHistoryItemClick(item)}
                  >
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
                  </motion.div>
                );
              } else {
                const log = item.data;
                const isFailed = log.status === 'FAILED';
                const isExcused = log.status === 'EXCUSED';
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="flex justify-between items-center border-b border-base-200 pb-3 last:border-0 last:pb-0 cursor-pointer hover:bg-base-200/50 transition-colors rounded-lg px-2 -mx-2"
                    onClick={() => handleHistoryItemClick(item)}
                  >
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
                  </motion.div>
                );
              }
            })}
          </AnimatePresence>

          {visibleHistory.length === 0 && <p className="text-center text-neutral/50 py-4">No activity found.</p>}

          {visibleHistory.length > visibleTxCount && (
            <button className="btn btn-ghost btn-sm w-full text-neutral/60" onClick={() => setVisibleTxCount(prev => prev + 10)}>
              Load More
            </button>
          )}
        </div>
      </AppCard>

      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        task={selectedTaskDetails}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div >
  );
};

export default AdminStats;
