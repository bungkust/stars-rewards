import { useAppStore } from '../store/useAppStore';
import AdminDashboard from './admin/AdminDashboard';
import ChildDashboard from './child/ChildDashboard';

const Dashboard = () => {
    const { isAdminMode } = useAppStore();

    if (isAdminMode) {
        return <AdminDashboard />;
    }

    return <ChildDashboard />;
};

export default Dashboard;
