import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaChartLine, FaCheckCircle, FaLightbulb, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { AppCard, H1Header, IconWrapper, ToggleButton } from '../../components/design-system';
import HistoryList, { type HistoryItemType, type HistoryItemEntry } from '../../components/shared/HistoryList';
import AdminHistoryDetailModal from '../../components/modals/AdminHistoryDetailModal';

import { useAppStore } from '../../store/useAppStore';
import { calculateCoinMetrics, getRecommendations, getCategoryPerformance } from '../../utils/analytics';
import { ICON_MAP } from '../../utils/icons';
import type { TimeFilter } from '../../utils/analytics';

const AdminStats = () => {
  const navigate = useNavigate();
  const { transactions, childLogs, children, tasks, categories, isLoading, deleteTransaction, deleteChildLog } = useAppStore();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  const [selectedChildId, setSelectedChildId] = useState<string>('all');
  const [tempDate, setTempDate] = useState(new Date().toISOString().split('T')[0]);
  const [specificDate, setSpecificDate] = useState(new Date().toISOString().split('T')[0]);
  const [dismissedInsights, setDismissedInsights] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('dismissed_insights');
      if (stored) {
        const parsed: Record<string, string> = JSON.parse(stored);
        const today = new Date().toISOString().split('T')[0];
        // Only keep IDs dismissed TODAY
        return Object.keys(parsed).filter(id => parsed[id] === today);
      }
    } catch (e) {
      console.error('Failed to parse dismissed insights', e);
    }
    return [];
  });
  const visibleCount = 10;

  // Modal State
  const [selectedItem, setSelectedItem] = useState<HistoryItemEntry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Effect to clean up old dismissals from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dismissed_insights');
      if (stored) {
        const parsed: Record<string, string> = JSON.parse(stored);
        const today = new Date().toISOString().split('T')[0];
        const newStorage: Record<string, string> = {};
        let changed = false;

        Object.entries(parsed).forEach(([id, date]) => {
          if (date === today) {
            newStorage[id] = date;
          } else {
            changed = true;
          }
        });

        if (changed) {
          localStorage.setItem('dismissed_insights', JSON.stringify(newStorage));
        }
      }
    } catch (e) {
      // Ignore errors
    }
  }, []);

  const handleTimeFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter);
    // visibleCount reset handled by mounting if needed, but here we just slice top 10 always for dashboard
    if (filter === 'specific') {
      setSpecificDate(tempDate);
    }
  };

  const handleDismiss = (id: string) => {
    setDismissedInsights(prev => {
      const newDismissed = [...prev, id];
      // Update Local Storage
      try {
        const today = new Date().toISOString().split('T')[0];
        const stored = localStorage.getItem('dismissed_insights');
        const parsed = stored ? JSON.parse(stored) : {};
        parsed[id] = today;
        localStorage.setItem('dismissed_insights', JSON.stringify(parsed));
      } catch (e) {
        console.error('Failed to save dismissed insight', e);
      }
      return newDismissed;
    });
  };

  const handleItemClick = (item: HistoryItemEntry) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleDelete = async (item: HistoryItemEntry) => {
    if (!item) return;

    let result;
    // Basic logic based on type to determine if it's transaction or log
    if (['verified', 'redeemed', 'manual'].includes(item.type)) {
      result = await deleteTransaction(item.id);
    } else {
      result = await deleteChildLog(item.id);
    }

    if (result.error) {
      console.error('Failed to delete item:', result.error);
      alert('Failed to delete item');
    }
  };

  // Filter Data
  const filteredData = useMemo(() => {
    let filteredTx = transactions;
    let filteredLogs = childLogs;

    // 1. Filter by Child
    if (selectedChildId !== 'all') {
      filteredTx = filteredTx.filter(t => t.child_id === selectedChildId);
      filteredLogs = filteredLogs.filter(l => l.child_id === selectedChildId);
    } else {
      // Only include active children to match Current Balance
      const activeChildIds = children.map(c => c.id);
      filteredTx = filteredTx.filter(t => activeChildIds.includes(t.child_id));
      filteredLogs = filteredLogs.filter(l => activeChildIds.includes(l.child_id));
    }

    // 2. Filter by Time
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const filterDate = (dateStr: string) => {
      const date = new Date(dateStr);
      if (timeFilter === 'all') {
        return true;
      }
      if (timeFilter === 'today') {
        return date >= today;
      }
      if (timeFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return date >= weekAgo;
      }
      if (timeFilter === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        return date >= monthAgo;
      }
      if (timeFilter === 'specific') {
        const target = new Date(specificDate);
        return date.getDate() === target.getDate() &&
          date.getMonth() === target.getMonth() &&
          date.getFullYear() === target.getFullYear();
      }
      return true;
    };

    filteredTx = filteredTx.filter(t => filterDate(t.created_at));
    filteredLogs = filteredLogs.filter(l => filterDate(l.completed_at));

    return { filteredTx, filteredLogs };
  }, [transactions, childLogs, selectedChildId, timeFilter, specificDate]);

  const { filteredTx: filteredTransactions, filteredLogs } = filteredData;

  // Calculate Metrics
  const coinMetrics = useMemo(() => calculateCoinMetrics(filteredTransactions), [filteredTransactions]);
  const missionCount = filteredLogs.filter(l => l.status === 'VERIFIED').length;

  // Calculate Current Balance
  const currentBalance = useMemo(() => {
    if (selectedChildId === 'all') {
      return children.reduce((acc, child) => acc + child.current_balance, 0);
    }
    return children.find(c => c.id === selectedChildId)?.current_balance || 0;
  }, [children, selectedChildId]);

  const recommendations = useMemo(() => {
    const allRecs = getRecommendations(filteredLogs, tasks);
    return allRecs.filter(rec => !dismissedInsights.includes(rec.id));
  }, [filteredLogs, tasks, dismissedInsights]);

  // Category Performance
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
      // Sort by Date DESC (Newest First)
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

  const displayedHistory = useMemo(() => {
    return finalHistory.slice(0, visibleCount);
  }, [finalHistory, visibleCount]);

  const hasMore = visibleCount < finalHistory.length;

  const getChildName = (childId: string) => children.find(c => c.id === childId)?.name || 'Unknown';

  // Enhanced description helpers
  const getTxDetails = (tx: typeof transactions[0]) => {
    let title = 'Transaction';
    let description = '';

    switch (tx.type) {
      case 'TASK_VERIFIED': {
        const log = childLogs.find(l => l.id === tx.reference_id);
        const task = log ? tasks.find(t => t.id === log.task_id) : null;
        title = task ? task.name : 'Mission Completed';
        description = 'Earned Stars';
        break;
      }
      case 'REWARD_REDEEMED': {
        title = 'Reward Redeemed';
        const desc = tx.description || '';
        const rewardIdx = desc.indexOf(':');
        description = rewardIdx > -1 ? desc.substring(rewardIdx + 2) : 'Spent Stars';
        break;
      }
      case 'MANUAL_ADJ':
        title = 'Manual Adjustment';
        description = tx.description || (tx.amount > 0 ? 'Bonus' : 'Penalty');
        break;
    }
    return { title, description };
  };

  const getRejectedMissionDetails = (log: typeof childLogs[0]) => {
    const task = tasks.find(tsk => tsk.id === log.task_id);
    const title = task?.name || 'Unknown Mission';
    const description = log.status === 'FAILED' ? 'Missed Deadline' : log.status === 'EXCUSED' ? (log.notes || 'Excused') : (log.rejection_reason || 'Rejected');
    return { title, description };
  };

  // Donut Chart Data




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
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle btn-sm">
          <FaArrowLeft />
        </button>
        <div className="flex-1">
          <H1Header>Parent Stats</H1Header>
        </div>
        <button
          onClick={() => navigate('/admin/history')}
          className="btn btn-ghost btn-sm text-primary font-bold"
        >
          Parent History
        </button>
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
          {['today', 'week', 'month', 'all'].map((f) => (
            <ToggleButton key={f} label={f === 'all' ? 'All Time' : f.charAt(0).toUpperCase() + f.slice(1)} isActive={timeFilter === f} onClick={() => handleTimeFilterChange(f as TimeFilter)} />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Balance */}
        <AppCard className="bg-gradient-to-br from-yellow-400/10 to-base-100 border-yellow-400/20">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-neutral/60 font-bold text-sm uppercase mb-1">Current Balance</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-warning">
                  {currentBalance}
                </span>
                <span className="text-sm font-bold text-neutral/40">stars</span>
              </div>
              <p className="text-xs text-neutral/50 mt-2">
                Total available in wallet
              </p>
            </div>
            <div className="p-3 bg-warning/20 text-warning rounded-full">
              <FaCheckCircle className="w-6 h-6" />
            </div>
          </div>
        </AppCard>

        {/* M2: Net Gain */}
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
                Earned <span className="text-success font-bold">{coinMetrics.earned}</span> • Spent <span className="text-error font-bold">{coinMetrics.spent}</span> • from {missionCount} missions
              </p>
            </div>
            <div className="p-3 bg-primary/20 text-primary rounded-full">
              <FaChartLine className="w-6 h-6" />
            </div>
          </div>
        </AppCard>
      </div>



      {/* Category Performance */}
      <AppCard>
        <div className="flex items-center gap-3 mb-4">
          <IconWrapper icon={FaChartLine} className="bg-info/10 text-info" />
          <h3 className="font-bold text-lg text-neutral">Category Performance</h3>
        </div>
        <div className="flex flex-col gap-4">
          {categoryMetrics.map((cat) => {
            const Icon = ICON_MAP[cat.icon as keyof typeof ICON_MAP] || ICON_MAP['default'];
            const percentage = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;

            return (
              <div key={cat.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-base-200 text-neutral/60">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-neutral text-sm truncate pr-2">{cat.name}</span>
                      <span className="text-xs font-bold text-primary flex-shrink-0">{cat.earned} Stars</span>
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

                {/* Child Breakdown (Only when 'All Children' is selected) */}
                {selectedChildId === 'all' && Object.keys(cat.childStats || {}).length > 0 && (
                  <div className="pl-14 pr-2 flex flex-col gap-1">
                    {Object.entries(cat.childStats).map(([childId, stats]) => {
                      if (stats.earned === 0 && stats.completed === 0) return null;
                      const childName = children.find(c => c.id === childId)?.name || 'Unknown';
                      return (
                        <div key={childId} className="flex justify-between items-center text-[10px] text-neutral/50">
                          <span>{childName}</span>
                          <div className="flex gap-2">
                            <span>{stats.completed} done</span>
                            <span className="font-bold text-primary/70">{stats.earned} stars</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AppCard>

      {/* Transaction History */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-neutral text-lg">History</h3>
          <div className="flex gap-2">
            <ToggleButton label="All" isActive={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
            <ToggleButton label="Earned" isActive={statusFilter === 'earned'} onClick={() => setStatusFilter('earned')} />
            <ToggleButton label="Spent" isActive={statusFilter === 'spent'} onClick={() => setStatusFilter('spent')} />
            <ToggleButton label="Failed" isActive={statusFilter === 'failed'} onClick={() => setStatusFilter('failed')} />
          </div>
        </div>

        <div className="card bg-base-100 shadow-md rounded-xl p-6">
          <HistoryList
            items={displayedHistory.map(item => {
              if (item.type === 'transaction') {
                const tx = item.data;
                const isPositive = tx.amount > 0;
                let type: HistoryItemType = 'verified';
                if (tx.type === 'REWARD_REDEEMED') type = 'redeemed';
                else if (tx.type === 'MANUAL_ADJ') type = 'manual';

                const { title, description } = getTxDetails(tx);

                // metadata
                const log = tx.reference_id ? childLogs.find(l => l.id === tx.reference_id) : null;
                const task = log ? tasks.find(t => t.id === log.task_id) : null;
                const category = task ? categories.find(c => c.id === task.category_id) : null;

                const entry: HistoryItemEntry = {
                  id: item.id,
                  type,
                  title,
                  subtitle: `${getChildName(tx.child_id)} • ${new Date(tx.created_at).toLocaleDateString()}`,
                  description,
                  amount: tx.amount,
                  amountLabel: tx.type === 'TASK_VERIFIED' ? 'Done' : tx.type === 'REWARD_REDEEMED' ? 'Redeemed' : '-',
                  status: isPositive ? 'success' : 'error',
                  categoryName: category?.name,
                  notes: log?.notes,
                  targetValue: task?.total_target_value,
                  currentValue: log?.current_value,
                  unit: task?.target_unit,
                  childName: getChildName(tx.child_id),
                  dateLabel: new Date(tx.created_at).toLocaleDateString(),
                  childId: tx.child_id,
                  taskId: task?.id,
                  referenceId: tx.reference_id
                };
                return { ...entry, onClick: () => handleItemClick(entry) };
              } else {
                const log = item.data;
                let type: HistoryItemType = 'rejected';
                let status: 'error' | 'warning' | 'neutral' = 'error';

                if (log.status === 'FAILED') {
                  type = 'failed';
                  status = 'neutral';
                } else if (log.status === 'EXCUSED') {
                  type = 'excused';
                  status = 'warning';
                }

                const { title, description } = getRejectedMissionDetails(log);
                const task = tasks.find(tsk => tsk.id === log.task_id);
                const category = task ? categories.find(c => c.id === task.category_id) : null;

                const entry: HistoryItemEntry = {
                  id: item.id,
                  type,
                  title,
                  subtitle: `${getChildName(log.child_id)} • ${log.status} • ${new Date(log.completed_at).toLocaleDateString()}`,
                  description,
                  amountLabel: log.status,
                  status,
                  categoryName: category?.name,
                  notes: log.notes,
                  rejectionReason: log.rejection_reason,
                  targetValue: task?.total_target_value,
                  currentValue: log.current_value,
                  unit: task?.target_unit,
                  childName: getChildName(log.child_id),
                  dateLabel: new Date(log.completed_at).toLocaleDateString(),
                  childId: log.child_id,
                  taskId: log.task_id
                };
                return { ...entry, onClick: () => handleItemClick(entry) };
              }
            })}
            emptyMessage="No history found for this period."
            footer={
              hasMore && (
                <Link to="/parent/history" className="btn btn-ghost btn-sm w-full text-neutral/60 mt-2">
                  Load More
                </Link>
              )
            }
          />
        </div>
      </div>

      <AdminHistoryDetailModal
        isOpen={isDetailOpen}
        item={selectedItem}
        onClose={() => setIsDetailOpen(false)}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AdminStats;
