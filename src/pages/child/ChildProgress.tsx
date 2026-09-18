import { useAppStore } from '../../store/useAppStore';
import GamificationPanel from '../../components/child/GamificationPanel';

const ChildProgress = () => {
  const { activeChildId, children, childLogs, tasks, xpTransactions, transactions, getTasksByChildId } = useAppStore();
  const child = children.find(c => c.id === activeChildId);
  const childTasks = activeChildId ? getTasksByChildId(activeChildId) : tasks;

  if (!activeChildId || !child) return null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral">{child.name}&apos;s Progress</h2>
        <p className="mt-1 text-sm font-medium text-neutral/60">XP helps unlock badges, titles, frames, and future streak helpers.</p>
      </div>
      <GamificationPanel
        childId={activeChildId}
        logs={childLogs}
        tasks={childTasks}
        xpTransactions={xpTransactions}
        transactions={transactions}
      />
    </div>
  );
};

export default ChildProgress;
