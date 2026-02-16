import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { H1Header, ToggleButton } from '../../components/design-system';
import { FaStar, FaTrophy, FaGift } from 'react-icons/fa';
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
import HistoryDetailModal from '../../components/modals/HistoryDetailModal';
import HistoryList, { type HistoryItemType, type HistoryItemEntry } from '../../components/shared/HistoryList';
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

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItemEntry | null>(null);

  const handleHistoryItemClick = (item: any) => {
    const childName = child?.name || 'Unknown';
    if (item.type === 'transaction') {
      const tx = item.data;
      const details = getTransactionDetails(tx);
      const log = tx.reference_id ? childLogs.find(l => l.id === tx.reference_id) : null;
      const task = log ? tasks.find(tsk => tsk.id === log.task_id) : null;

      let type: HistoryItemType = 'verified';
      if (tx.type === 'REWARD_REDEEMED') type = 'redeemed';
      else if (tx.type === 'MANUAL_ADJ') type = 'manual';

      const entry: HistoryItemEntry = {
        id: item.id,
        type,
        title: details.name,
        subtitle: `${childName} • ${new Date(tx.created_at).toLocaleDateString()}`,
        description: details.description,
        amount: tx.amount,
        amountLabel: tx.type === 'TASK_VERIFIED' ? 'Done' : tx.type === 'REWARD_REDEEMED' ? 'Redeemed' : '-',
        status: tx.amount > 0 ? 'success' : tx.type === 'REWARD_REDEEMED' ? 'warning' : tx.amount < 0 ? 'error' : 'neutral',
        notes: log?.notes,
        targetValue: task?.total_target_value,
        currentValue: log?.current_value,
        unit: task?.target_unit,
        childName,
        dateLabel: new Date(tx.created_at).toLocaleDateString(),
        childId: tx.child_id,
        taskId: task?.id,
        referenceId: tx.reference_id
      };
      setSelectedHistoryItem(entry);
    } else {
      const log = item.data;
      const details = getRejectedMissionDetails(log);
      const isFailed = log.status === 'FAILED';
      const isExcused = log.status === 'EXCUSED';
      let type: HistoryItemType = 'rejected';
      if (isFailed) type = 'failed';
      else if (isExcused) type = 'excused';

      const task = tasks.find(tsk => tsk.id === log.task_id);

      const entry: HistoryItemEntry = {
        id: item.id,
        type,
        title: details.name,
        subtitle: `${childName} • ${new Date(log.completed_at).toLocaleDateString()}`,
        description: isFailed ? 'Missed Deadline' : isExcused ? (log.notes || 'No reason provided') : `Reason: ${log.rejection_reason}`,
        amountLabel: log.status,
        status: isFailed ? 'neutral' : isExcused ? 'warning' : 'error',
        notes: log.notes,
        rejectionReason: log.rejection_reason,
        targetValue: task?.total_target_value,
        currentValue: log.current_value,
        unit: task?.target_unit,
        childName,
        dateLabel: new Date(log.completed_at).toLocaleDateString(),
        childId: log.child_id,
        taskId: log.task_id
      };
      setSelectedHistoryItem(entry);
    }
    setIsDetailsModalOpen(true);
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
        // Sort by Date DESC (Recent History)
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();

        return dateB - dateA;
      });

    return allItems;
  }, [childTransactions, rejectedMissions]);

  const visibleHistory = combinedHistory.slice(0, 10);

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

      {/* Claimed Rewards Section */}
      <div className="card bg-base-100 shadow-md rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-bold text-neutral">Claimed Rewards</h3>
        </div>

        <div className="flex flex-col gap-3">
          {childTransactions
            .filter(t => t.type === 'REWARD_REDEEMED')
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Recent first
            .slice(0, 3) // Limit to 3 for preview
            .map(transaction => {
              const details = getTransactionDetails(transaction);
              return (
                <button
                  key={transaction.id}
                  onClick={() => handleHistoryItemClick({ type: 'transaction', data: transaction, id: transaction.id })}
                  className="flex justify-between items-center border-b border-base-200 pb-3 last:border-none last:pb-0 hover:bg-base-50 transition-colors w-full text-left rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-warning/10 text-warning rounded-full">
                      <FaGift className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-neutral text-sm">{details.name}</span>
                      <span className="text-xs text-neutral/40">{formatDate(transaction.created_at)}</span>
                    </div>
                  </div>
                  <span className="font-bold text-error">
                    {Math.abs(transaction.amount)} Stars
                  </span>
                </button>
              );
            })}
          {childTransactions.filter(t => t.type === 'REWARD_REDEEMED').length === 0 && (
            <p className="text-neutral/40 text-center text-sm py-4">No rewards claimed yet.</p>
          )}

          {childTransactions.filter(t => t.type === 'REWARD_REDEEMED').length > 3 && (
            <Link to="/child/claimed-rewards" className="btn btn-ghost btn-sm w-full text-neutral/60 mt-1">
              Load More
            </Link>
          )}
        </div>
      </div>





      {/* Recent History (Simple List) */}
      <div className="card bg-base-100 shadow-md rounded-xl p-6">
        <div className="flex flex-col gap-3 mb-4">
          <h3 className="text-lg font-bold text-neutral">Recent History</h3>
        </div>

        <HistoryList
          items={visibleHistory.map(item => {
            if (item.type === 'transaction') {
              const transaction = item.data;
              const details = getTransactionDetails(transaction);

              let type: HistoryItemType = 'verified';
              if (transaction.type === 'REWARD_REDEEMED') type = 'redeemed';
              else if (transaction.type === 'MANUAL_ADJ') type = 'manual';

              return {
                id: item.id,
                type,
                title: details.name,
                subtitle: formatDate(transaction.created_at),
                description: details.description,
                amount: transaction.amount,
                amountLabel: transaction.type === 'TASK_VERIFIED' ? 'Done' : transaction.type === 'REWARD_REDEEMED' ? 'Redeemed' : '-',
                status: transaction.amount > 0 ? 'success' : transaction.amount < 0 ? 'error' : 'neutral',
                onClick: () => handleHistoryItemClick(item)
              };
            } else { // rejected_mission
              const log = item.data;
              const details = getRejectedMissionDetails(log);
              const isFailed = log.status === 'FAILED';
              const isExcused = log.status === 'EXCUSED';

              let type: HistoryItemType = 'rejected';
              let status: 'error' | 'warning' | 'neutral' = 'error';

              if (isFailed) {
                type = 'failed';
                status = 'neutral';
              } else if (isExcused) {
                type = 'excused';
                status = 'warning';
              }

              return {
                id: item.id,
                type,
                title: details.name,
                subtitle: formatDate(log.completed_at),
                description: isFailed ? 'Missed Deadline' : isExcused ? (log.notes || 'No reason provided') : `Reason: ${log.rejection_reason}`,
                amountLabel: isFailed ? 'Failed' : isExcused ? 'Excused' : 'Rejected',
                status,
                onClick: () => handleHistoryItemClick(item)
              };
            }
          })}
          emptyMessage="No activity in this period."
          footer={
            combinedHistory.length > 10 && (
              <Link to="/child/history" className="btn btn-ghost btn-sm w-full text-neutral/60 mt-2">
                Load More
              </Link>
            )
          }
        />
      </div>

      <HistoryDetailModal
        isOpen={isDetailsModalOpen}
        item={selectedHistoryItem}
        onClose={() => setIsDetailsModalOpen(false)}
        onDelete={async () => { }} // Read-only mode
        readOnly={true}
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

