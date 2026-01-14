import { useMemo, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { H1Header, ToggleButton } from '../../components/design-system';
import { FaStar, FaTrophy, FaChartPie, FaCheckCircle, FaGift, FaSlidersH, FaTimesCircle, FaChild } from 'react-icons/fa';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';
import TaskDetailsModal from '../../components/modals/TaskDetailsModal';
import type { CoinTransaction } from '../../types';

type Timeframe = 'week' | 'month';

interface ChartPoint {
  label: string;
  value: number;
}

const timeframeDescriptions: Record<Timeframe, string> = {
  week: 'Daily net stars earned over the last 7 days',
  month: 'Weekly totals for the past 4 weeks',
};

const timeframeOptions: { value: Timeframe; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

const ChildStats = () => {
  const { activeChildId, children, transactions, tasks, rewards, childLogs } = useAppStore();
  const [timeframe, setTimeframe] = useState<Timeframe>('week');
  const child = children.find(c => c.id === activeChildId);

  const childTransactions = useMemo(
    () => transactions.filter(t => t.child_id === child?.id),
    [transactions, child?.id]
  );

  // Get rejected mission logs for history display
  const rejectedMissions = useMemo(
    () => childLogs.filter(log => log.child_id === child?.id && (log.status === 'REJECTED' || log.status === 'FAILED' || log.status === 'EXCUSED')),
    [childLogs, child?.id]
  );

  const [historyFilter, setHistoryFilter] = useState<'today' | 'week' | 'month' | 'specific'>('today');
  const [specificDate, setSpecificDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tempDate, setTempDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [visibleHistoryCount, setVisibleHistoryCount] = useState(10);

  const handleHistoryFilterChange = (filter: 'today' | 'week' | 'month' | 'specific') => {
    setHistoryFilter(filter);
    setVisibleHistoryCount(10);
  };

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

  // Combine transactions and rejected missions for history
  const combinedHistory = useMemo(() => {
    const transactionItems = childTransactions.map(t => ({
      id: t.id,
      type: 'transaction' as const,
      data: t,
      date: t.created_at
    }));

    const rejectedItems = rejectedMissions.map(log => ({
      id: log.id,
      type: 'rejected_mission' as const,
      data: log,
      date: log.completed_at
    }));

    const allItems = [...transactionItems, ...rejectedItems]
      .sort((a, b) => {
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
            if (tx.amount < 0) return 3; // Reduction (Redeem or Penalty)
            return 6; // Fallback
          } else {
            const log = item.data;
            if (log.status === 'REJECTED' || log.status === 'FAILED') return 4;
            if (log.status === 'EXCUSED') return 5;
            return 6; // Fallback
          }
        };

        // Sort by Date DESC first (Recent History)
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();

        if (dateA !== dateB) {
          return dateB - dateA;
        }

        // Then by Weight (if dates are identical)
        const weightA = getWeight(a);
        const weightB = getWeight(b);
        return weightA - weightB;
      });

    // Apply Time Filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    return allItems.filter(item => {
      const itemDate = new Date(item.date).getTime();

      if (historyFilter === 'specific') {
        // Compare YYYY-MM-DD strings in local time
        const itemDateStr = new Date(item.date).toLocaleDateString('en-CA');
        return specificDate === itemDateStr;
      }

      if (historyFilter === 'today') {
        return itemDate >= today;
      }

      if (historyFilter === 'week') {
        return itemDate >= today - (6 * oneDay); // Last 7 days including today
      }

      if (historyFilter === 'month') {
        return itemDate >= today - (29 * oneDay); // Last 30 days
      }

      return true;
    });
  }, [childTransactions, rejectedMissions, historyFilter, specificDate]);

  const visibleHistory = combinedHistory.slice(0, visibleHistoryCount);
  const hasMoreHistory = visibleHistory.length < combinedHistory.length;

  // Calculate basic stats from transactions
  const earned = childTransactions
    .filter(t => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const spent = childTransactions
    .filter(t => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const chartData = useMemo(
    () => buildChartData(childTransactions, timeframe),
    [childTransactions, timeframe]
  );



  const chartNetTotal = chartData.reduce((acc, point) => acc + point.value, 0);
  const hasTransactions = childTransactions.length > 0;
  const chartMinValue = chartData.reduce((min, point) => Math.min(min, point.value), 0);
  const chartMaxValue = chartData.reduce((max, point) => Math.max(max, point.value), 0);
  const chartAbsMax = Math.max(Math.abs(chartMinValue), Math.abs(chartMaxValue));
  const yPadding = chartAbsMax === 0 ? 5 : chartAbsMax * 0.2;
  const yDomain: [number, number] = [
    Math.min(0, chartMinValue - yPadding),
    Math.max(5, chartMaxValue + yPadding),
  ];

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
      name = 'Manual Adjustment';
      description = t.description || (t.amount > 0 ? 'Bonus' : 'Penalty');
    }

    return { name, description };
  };

  // Helper to get rejected mission details
  const getRejectedMissionDetails = (log: typeof childLogs[0]) => {
    const task = tasks.find(tsk => tsk.id === log.task_id);
    const name = task?.name || 'Unknown Mission';
    const description = log.rejection_reason || 'Mission Rejected';
    return { name, description };
  };

  return (
    <div className="flex flex-col gap-6">
      <H1Header>My Stats</H1Header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card bg-base-100 shadow-md rounded-xl p-4 flex flex-col items-center text-center">
          <div className="p-3 bg-warning/10 text-warning rounded-full mb-2">
            <FaStar className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-neutral">{earned}</span>
          <span className="text-xs text-neutral/60 uppercase font-bold">Earned</span>
        </div>

        <div className="card bg-base-100 shadow-md rounded-xl p-4 flex flex-col items-center text-center">
          <div className="p-3 bg-primary/10 text-primary rounded-full mb-2">
            <FaTrophy className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-neutral">{spent}</span>
          <span className="text-xs text-neutral/60 uppercase font-bold">Spent</span>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="card bg-base-100 shadow-md rounded-xl p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-neutral">Progress Tracker</h3>
            <p className="text-xs text-neutral/60">{timeframeDescriptions[timeframe]}</p>
          </div>
          <div className="flex gap-2">
            {timeframeOptions.map(option => (
              <ToggleButton
                key={option.value}
                label={option.label}
                isActive={option.value === timeframe}
                onClick={() => setTimeframe(option.value)}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-neutral/60">Net change</span>
          <span
            className={`text-xl font-bold ${chartNetTotal >= 0 ? 'text-primary' : 'text-error'
              }`}
          >
            {chartNetTotal >= 0 ? '+' : '-'}
            {Math.abs(chartNetTotal)} Stars
          </span>
        </div>

        <div className="mt-6">
          {hasTransactions ? (
            <div className="h-56 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={yDomain}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    allowDecimals={false}
                  />
                  <Tooltip<number, string> content={(props) => <ChartTooltip {...props} />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#38BDF8"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#38BDF8', stroke: '#ffffff', strokeWidth: 1 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-sm text-neutral/40 py-6">
              No activity recorded in this range yet.
            </p>
          )}
        </div>
      </div>

      {/* Balance Chart Representation */}
      <div className="card bg-base-100 shadow-md rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <FaChartPie className="text-neutral/40" />
          <h3 className="text-lg font-bold text-neutral">Balance Breakdown</h3>
        </div>

        <div className="flex flex-col gap-4">
          {/* Current Balance Bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-neutral/60">Current Balance</span>
              <span className="font-bold text-primary">{child.current_balance} Stars</span>
            </div>
            <div className="w-full bg-base-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-primary h-4 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((child.current_balance / (earned || 1)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Spending Bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-neutral/60">Total Spent</span>
              <span className="font-bold text-error">{spent} Stars</span>
            </div>
            <div className="w-full bg-base-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-error h-4 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((spent / (earned || 1)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>



      {/* Recent History (Simple List) */}
      <div className="card bg-base-100 shadow-md rounded-xl p-6">
        <div className="flex flex-col gap-3 mb-4">
          <h3 className="text-lg font-bold text-neutral">Recent History</h3>

          {/* History Filter Tabs */}
          <div className="flex flex-wrap gap-2 items-center">
            <ToggleButton
              label="Today"
              isActive={historyFilter === 'today'}
              onClick={() => handleHistoryFilterChange('today')}
            />
            <ToggleButton
              label="Week"
              isActive={historyFilter === 'week'}
              onClick={() => handleHistoryFilterChange('week')}
            />
            <ToggleButton
              label="Month"
              isActive={historyFilter === 'month'}
              onClick={() => handleHistoryFilterChange('month')}
            />
            <ToggleButton
              label="Specific Date"
              isActive={historyFilter === 'specific'}
              onClick={() => handleHistoryFilterChange('specific')}
            />
            {historyFilter === 'specific' && (
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

        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {visibleHistory.map(item => {
              if (item.type === 'transaction') {
                const transaction = item.data;
                const details = getTransactionDetails(transaction);

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
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`flex justify-between items-center border-b border-base-200 pb-3 last:border-none last:pb-0 ${transaction.type === 'TASK_VERIFIED' ? 'cursor-pointer hover:bg-base-200/50 transition-colors rounded-lg px-2 -mx-2' : ''}`}
                    onClick={() => handleHistoryItemClick(item)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${iconBg} ${iconColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral text-sm">{details.name}</span>
                        <span className="text-xs text-neutral/40">{formatDate(transaction.created_at)}</span>
                        {details.description && (
                          <span className="text-xs text-neutral/50 italic mt-0.5">
                            {details.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`font-bold ${transaction.amount > 0 ? 'text-success' : transaction.amount < 0 ? 'text-error' : 'text-neutral/60'}`}>
                      {transaction.amount !== 0 ? (
                        <>{transaction.amount > 0 ? '+' : ''}{transaction.amount}</>
                      ) : (
                        <span className="text-xs uppercase">
                          {transaction.type === 'TASK_VERIFIED' ? 'Done' : transaction.type === 'REWARD_REDEEMED' ? 'Redeemed' : '-'}
                        </span>
                      )}
                    </span>
                  </motion.div>
                );
              } else if (item.type === 'rejected_mission') {
                const log = item.data;
                const details = getRejectedMissionDetails(log);
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
                    className="flex justify-between items-center border-b border-base-200 pb-3 last:border-none last:pb-0 cursor-pointer hover:bg-base-200/50 transition-colors rounded-lg px-2 -mx-2"
                    onClick={() => handleHistoryItemClick(item)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${isFailed ? 'bg-base-200 text-neutral/60' : isExcused ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'}`}>
                        {isExcused ? <FaChild className="w-4 h-4" /> : <FaTimesCircle className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral text-sm">{details.name}</span>
                        <span className="text-xs text-neutral/40">{formatDate(log.completed_at)}</span>
                        {log.rejection_reason && !isExcused && (
                          <span className={`text-xs italic mt-0.5 ${isFailed ? 'text-neutral/60' : 'text-error'}`}>
                            {isFailed ? 'Missed Deadline' : `Reason: ${log.rejection_reason}`}
                          </span>
                        )}
                        {isExcused && (
                          <span className="text-xs italic mt-0.5 text-warning">
                            {log.notes || 'No reason provided'}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`font-bold ${isFailed ? 'text-neutral/40' : isExcused ? 'text-warning' : 'text-error'}`}>
                      <span className="text-xs uppercase">{isFailed ? 'Failed' : isExcused ? 'Excused' : 'Rejected'}</span>
                    </span>
                  </motion.div>
                );

              }
              return null;
            })}
          </AnimatePresence>

          {visibleHistory.length === 0 && (
            <p className="text-neutral/40 text-center text-sm py-4">No activity in this period.</p>
          )}

          {hasMoreHistory && (
            <button
              className="btn btn-ghost btn-sm w-full text-neutral/60 mt-2"
              onClick={() => setVisibleHistoryCount(prev => prev + 10)}
            >
              Load More
            </button>
          )}
        </div>
      </div>

      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        task={selectedTaskDetails}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div >
  );
};

export default ChildStats;

const ChartTooltip = (props: TooltipContentProps<number, string>) => {
  const { active, payload, label } = props;
  if (!active || !payload || !payload.length) return null;
  const value = payload[0].value as number;

  return (
    <div className="rounded-lg border border-base-200 bg-base-100 px-3 py-2 shadow-md">
      <p className="text-xs text-neutral/40">{label}</p>
      <p className={`text-sm font-semibold ${value >= 0 ? 'text-primary' : 'text-error'}`}>
        {value >= 0 ? '+' : '-'}
        {Math.abs(value)} Stars
      </p>
    </div>
  );
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getStartOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const getStartOfWeek = (date: Date) => {
  const result = getStartOfDay(date);
  const day = result.getDay();
  result.setDate(result.getDate() - day);
  return result;
};

const getLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildChartData = (transactions: CoinTransaction[], timeframe: Timeframe): ChartPoint[] => {
  const today = getStartOfDay(new Date());

  if (timeframe === 'week') {
    const totalsByDay = transactions.reduce<Record<string, number>>((acc, transaction) => {
      const key = getLocalDateKey(new Date(transaction.created_at));
      acc[key] = (acc[key] || 0) + transaction.amount;
      return acc;
    }, {});

    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (6 - index));
      const key = getLocalDateKey(day);
      return {
        label: day.toLocaleDateString([], { weekday: 'short' }),
        value: totalsByDay[key] || 0,
      };
    });
  }

  if (timeframe === 'month') {
    const weekBuckets = [0, 0, 0, 0];
    transactions.forEach(transaction => {
      const date = getStartOfDay(new Date(transaction.created_at));
      const diffDays = Math.floor((today.getTime() - date.getTime()) / MS_PER_DAY);
      if (diffDays < 0) return;
      const bucket = Math.floor(diffDays / 7);
      if (bucket >= 0 && bucket < weekBuckets.length) {
        weekBuckets[bucket] += transaction.amount;
      }
    });

    const startOfCurrentWeek = getStartOfWeek(today);

    return Array.from({ length: 4 }, (_, index) => {
      const offset = weekBuckets.length - 1 - index;
      const weekStart = new Date(startOfCurrentWeek);
      weekStart.setDate(startOfCurrentWeek.getDate() - offset * 7);
      return {
        label: weekStart.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        value: weekBuckets[offset] || 0,
      };
    });
  }

  return [];
};

