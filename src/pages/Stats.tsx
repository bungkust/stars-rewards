import { useAppStore } from '../store/useAppStore';
import AdminStats from './admin/AdminStats';
import ChildStats from './child/ChildStats';

const Stats = () => {
    const { isAdminMode } = useAppStore();

    if (isAdminMode) {
        return <AdminStats />;
    }

    return <ChildStats />;
};

export default Stats;
