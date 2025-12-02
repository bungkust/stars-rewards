import { useMemo, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { H1Header } from '../../components/design-system/H1Header';
import { FaStar, FaTrophy, FaChartPie } from 'react-icons/fa';
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
    () => childLogs.filter(log => log.child_id === child?.id && log.status === 'REJECTED'),
    [childLogs, child?.id]
  );

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

    return [...transactionItems, ...rejectedItems]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [childTransactions, rejectedMissions]);

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
      name = t.description || 'Manual Adjustment';
      description = t.amount > 0 ? 'Bonus' : 'Penalty';
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

      {/* Progress Tracker */}
      <div className="card bg-white shadow-md rounded-xl p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Progress Tracker</h3>
            <p className="text-xs text-gray-500">{timeframeDescriptions[timeframe]}</p>
          </div>
          <div className="btn-group">
            {timeframeOptions.map(option => (
              <button
                key={option.value}
                className={`btn btn-sm ${
                  option.value === timeframe ? 'btn-primary text-white' : 'btn-ghost text-gray-500'
                }`}
                onClick={() => setTimeframe(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-gray-500">Net change</span>
          <span
            className={`text-xl font-bold ${
              chartNetTotal >= 0 ? 'text-primary' : 'text-error'
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
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 1 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-sm text-gray-400 py-6">
              No activity recorded in this range yet.
            </p>
          )}
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
          {combinedHistory
            .slice(0, 10)
            .map(item => {
              if (item.type === 'transaction') {
                const transaction = item.data;
                const details = getTransactionDetails(transaction);
                return (
                  <div key={item.id} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-none last:pb-0">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-700 text-sm">{details.name}</span>
                      <span className="text-xs text-gray-400">{formatDate(transaction.created_at)}</span>
                    </div>
                    <span className={`font-bold ${transaction.amount > 0 ? 'text-green-500' : transaction.amount < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                      {transaction.amount !== 0 ? (
                        <>{transaction.amount > 0 ? '+' : ''}{transaction.amount}</>
                      ) : (
                        <span className="text-xs uppercase">
                          {transaction.type === 'TASK_VERIFIED' ? 'Done' : transaction.type === 'REWARD_REDEEMED' ? 'Redeemed' : '-'}
                        </span>
                      )}
                    </span>
                  </div>
                );
              } else if (item.type === 'rejected_mission') {
                const log = item.data;
                const details = getRejectedMissionDetails(log);
                return (
                  <div key={item.id} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-none last:pb-0">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-700 text-sm">{details.name}</span>
                      <span className="text-xs text-gray-400">{formatDate(log.completed_at)}</span>
                      {log.rejection_reason && (
                        <span className="text-xs text-red-500 italic mt-1">
                          Reason: {log.rejection_reason}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-red-500">
                      <span className="text-xs uppercase">Rejected</span>
                    </span>
                  </div>
                );
              }
              return null;
            })}
            {combinedHistory.length === 0 && (
              <p className="text-gray-400 text-center text-sm">No activity yet.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default ChildStats;

const ChartTooltip = (props: TooltipContentProps<number, string>) => {
  const { active, payload, label } = props;
  if (!active || !payload || !payload.length) return null;
  const value = payload[0].value as number;

  return (
    <div className="rounded-lg border border-base-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs text-gray-400">{label}</p>
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

const getLocalDateKey = (date: Date) => date.toLocaleDateString('en-CA');

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

