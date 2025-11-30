import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTasks, FaPencilAlt } from 'react-icons/fa';
import { WarningCTAButton } from '../../components/design-system/WarningCTAButton';
import { AppCard } from '../../components/design-system/AppCard';
import { H1Header } from '../../components/design-system/H1Header';
import { IconWrapper } from '../../components/design-system/IconWrapper';
import { useAppStore } from '../../store/useAppStore';

const AdminTasks = () => {
  const navigate = useNavigate();
  const { tasks } = useAppStore();

  return (
    <div className="relative min-h-full pb-20 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <H1Header>Manage Missions</H1Header>
      </div>

      <div className="grid gap-4">
        {tasks.length === 0 ? (
           <div className="text-center py-10 text-gray-500">
             No missions created yet. Click below to add one!
           </div>
        ) : (
          tasks.map((task) => (
            <AppCard key={task.id} className="flex flex-row items-center gap-4 !p-4">
              <div className="bg-base-200 p-3 rounded-lg">
                <IconWrapper icon={FaTasks} className="text-gray-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-700">{task.name}</h3>
                <p className="text-sm text-gray-500">
                  {task.recurrence_rule || 'One-time'} • {task.reward_value} Stars
                </p>
              </div>
              <button 
                className="btn btn-ghost btn-sm btn-circle text-gray-400"
                onClick={() => navigate(`/admin/tasks/${task.id}/edit`)}
              >
                <FaPencilAlt />
              </button>
            </AppCard>
          ))
        )}
      </div>

      <WarningCTAButton onClick={() => navigate('/admin/tasks/new')}>
        <FaPlus className="w-6 h-6" />
        <span className="ml-2 hidden sm:inline">Add Mission</span>
      </WarningCTAButton>
    </div>
  );
};

export default AdminTasks;
