import { useAppStore } from '../store/useAppStore';
import AdminTasks from './admin/AdminTasks';
import ChildTasks from './child/ChildTasks';

const Tasks = () => {
    const { isAdminMode } = useAppStore();

    if (isAdminMode) {
        return <AdminTasks />;
    }

    return <ChildTasks />;
};

export default Tasks;
