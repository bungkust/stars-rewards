import { useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaTasks, FaChartLine } from 'react-icons/fa';
import { IoGiftOutline } from 'react-icons/io5';
import { useAppStore } from '../../store/useAppStore';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdminMode } = useAppStore();

  const navItems = [
    { id: 'home', icon: FaHome, label: 'Home', path: isAdminMode ? '/parent' : '/child' },
    { id: 'tasks', icon: FaTasks, label: 'Missions', path: '/tasks' },
    { id: 'rewards', icon: IoGiftOutline, label: 'Rewards', path: '/rewards' },
    { id: 'stats', icon: FaChartLine, label: 'Stats', path: '/stats' },
  ];

  return (
    <div className="btm-nav bg-white border-t border-base-200 shadow-lg z-50 pb-safe py-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const activeColor = isAdminMode ? 'text-emerald-600' : 'text-primary';
        const stateClasses = isActive ? `${activeColor} font-semibold` : 'text-gray-400';
        return (
          <button
            key={item.id}
            className={`transition-colors duration-200 flex flex-col items-center gap-1 ${stateClasses}`}
            onClick={() => navigate(item.path)}
          >
            <item.icon className="h-6 w-6" />
            <span className="btm-nav-label text-xs font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
