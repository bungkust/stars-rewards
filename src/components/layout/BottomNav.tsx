import { useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaTasks, FaChartLine } from 'react-icons/fa';
import { IoGiftOutline } from 'react-icons/io5';
import { useAppStore } from '../../store/useAppStore';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdminMode } = useAppStore();

  const navItems = isAdminMode 
    ? [
        { id: 'admin-home', icon: FaHome, label: 'Home', path: '/admin/dashboard' },
        { id: 'admin-tasks', icon: FaTasks, label: 'Missions', path: '/admin/tasks' },
        { id: 'admin-rewards', icon: IoGiftOutline, label: 'Rewards', path: '/admin/rewards' },
        { id: 'admin-stats', icon: FaChartLine, label: 'Stats', path: '/admin/stats' },
      ]
    : [
        { id: 'home', icon: FaHome, label: 'Home', path: '/' },
        { id: 'tasks', icon: FaTasks, label: 'Missions', path: '/tasks' },
        { id: 'rewards', icon: IoGiftOutline, label: 'Rewards', path: '/rewards' },
        { id: 'stats', icon: FaChartLine, label: 'Stats', path: '/stats' },
      ];

  return (
    <div className="btm-nav bg-white border-t border-base-200 shadow-lg z-50 pb-safe">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const activeColor = isAdminMode ? 'text-emerald-600' : 'text-primary';
        return (
          <button
            key={item.id}
            className={`${isActive ? `active ${activeColor}` : 'text-gray-400'} transition-colors duration-200`}
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
