import { useLocation, useNavigate } from 'react-router-dom';
import { ChartLineUp, ClipboardText, Gift, House, Trophy } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdminMode } = useAppStore();

  const childItems = [
      { id: 'home', icon: House, label: 'Home', path: '/child' },
      { id: 'tasks', icon: ClipboardText, label: 'Missions', path: '/child/tasks' },
      { id: 'champ', icon: Trophy, label: 'Champ', path: '/child/loyalty' },
      { id: 'rewards', icon: Gift, label: 'Rewards', path: '/child/rewards' },
      { id: 'stats', icon: ChartLineUp, label: 'Stats', path: '/child/stats' },
    ];

  const navItems = isAdminMode
    ? [
      { id: 'home', icon: House, label: 'Home', path: '/parent' },
      { id: 'tasks', icon: ClipboardText, label: 'Missions', path: '/parent/tasks' },
      { id: 'champ', icon: Trophy, label: 'Champ', path: '/parent/loyalty' },
      { id: 'rewards', icon: Gift, label: 'Rewards', path: '/parent/rewards' },
      { id: 'stats', icon: ChartLineUp, label: 'Stats', path: '/parent/stats' },
    ]
    : childItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-base-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 flex justify-around items-center h-auto min-h-[4rem] pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const activeColor = isAdminMode ? 'text-emerald-600' : 'text-primary';
        const stateClasses = isActive ? `${activeColor} font-semibold` : 'text-neutral/40';
        return (
          <button
            key={item.id}
            className={`transition-colors duration-200 flex flex-col items-center gap-1 p-1.5 flex-1 ${stateClasses}`}
            onClick={() => navigate(item.path)}
          >
            <item.icon
              size={24}
              weight={isActive ? 'fill' : 'regular'}
              style={{ minWidth: '24px', minHeight: '24px', display: 'block' }}
            />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
