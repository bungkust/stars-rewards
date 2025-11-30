import { useAppStore } from '../../store/useAppStore';
import { FaTasks, FaStar, FaClock } from 'react-icons/fa';

const ChildTasks = () => {
  const { activeChildId, getTasksByChildId } = useAppStore();
  const tasks = activeChildId ? getTasksByChildId(activeChildId) : [];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-gray-800">My Missions</h2>
      
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <FaTasks className="w-16 h-16 mb-4 opacity-20" />
          <p>No missions found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <div key={task.id} className="card bg-white shadow-sm rounded-xl p-4 flex flex-row items-center gap-4">
              <div className="bg-base-200 p-3 rounded-full text-primary">
                <FaTasks />
              </div>
              <div className="flex-1">
                {/* Fixed: Use task.name instead of task.title */}
                <h3 className="font-bold text-gray-800">{task.name}</h3>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1 text-warning font-bold">
                    {/* Fixed: Use task.reward_value instead of task.reward */}
                    <FaStar /> {task.reward_value}
                  </span>
                  {/* task.duration removed as it's not in DB schema */}
                  {task.recurrence_rule && (
                    <span className="badge badge-ghost badge-sm">{task.recurrence_rule}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChildTasks;
