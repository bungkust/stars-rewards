import { useAppStore } from '../store/useAppStore';
import AdminRewards from './admin/AdminRewards';
import ChildRewards from './child/ChildRewards';

const Rewards = () => {
    const { isAdminMode } = useAppStore();

    if (isAdminMode) {
        return <AdminRewards />;
    }

    return <ChildRewards />;
};

export default Rewards;
