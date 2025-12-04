import { useEffect, useRef, useState } from 'react';
import { IoEllipsisVertical } from 'react-icons/io5';
import { useAppStore } from '../../store/useAppStore';

interface HeaderProps {
  onParentLoginClick: () => void;
  onSettingsClick: () => void;
  onChildSelectClick?: () => void;
}

const Header = ({ onParentLoginClick, onSettingsClick, onChildSelectClick }: HeaderProps) => {
  const { activeChildId, children, isAdminMode, toggleAdminMode, logout } = useAppStore();
  const activeChild = children.find(c => c.id === activeChildId);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  const handleExitAdmin = () => {
    toggleAdminMode(false);
  };

  const headerGradient = isAdminMode
    ? 'bg-gradient-to-b from-emerald-100 via-green-50 to-white/90'
    : 'bg-gradient-to-b from-blue-100 to-white/90';
  const titleColor = isAdminMode ? 'text-emerald-700' : 'text-primary';
  const menuButtonColor = isAdminMode ? 'text-emerald-600' : 'text-gray-500';

  return (
    <div
      className={`navbar fixed top-0 left-0 right-0 z-50 px-4 h-auto min-h-16 pt-8 pb-2 ${headerGradient} backdrop-blur-sm shadow-sm`}
    >
      <div className="flex-1">
        {activeChild && !isAdminMode ? (
          <button
            className="btn btn-ghost gap-2 normal-case"
            onClick={onChildSelectClick}
          >
            <div className="avatar placeholder">
              <div className="bg-neutral-focus text-neutral-content rounded-full w-8">
                <img
                  src={activeChild.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChild.name}`}
                  alt={activeChild.name}
                />
              </div>
            </div>
            <span className={`text-lg font-bold ${titleColor}`}>{activeChild.name}</span>
          </button>
        ) : (
          <a className={`btn btn-ghost text-xl font-bold hover:bg-transparent ${titleColor}`}>
            {isAdminMode ? 'Parent Dashboard' : 'Stars Rewards'}
          </a>
        )}
      </div>
      <div className="flex-none">
        <div
          className={`dropdown dropdown-end ${isMenuOpen ? 'dropdown-open' : ''}`}
          ref={menuRef}
        >
          <button
            className={`btn btn-square btn-ghost hover:bg-white/50 ${menuButtonColor}`}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            title="More options"
          >
            <IoEllipsisVertical className="w-6 h-6" />
          </button>
          <ul className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-white/95 backdrop-blur rounded-box border border-base-200 min-w-44">
            {isAdminMode ? (
              <>
                <li>
                  <button
                    className="justify-between text-sm font-medium"
                    onClick={() => {
                      closeMenu();
                      handleExitAdmin();
                    }}
                  >
                    Back to Child
                  </button>
                </li>
                <li>
                  <button
                    className="justify-between text-sm font-medium text-error"
                    onClick={() => {
                      closeMenu();
                      logout().catch(() => { });
                    }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <button
                    className="justify-between text-sm font-medium"
                    onClick={() => {
                      closeMenu();
                      onParentLoginClick();
                    }}
                  >
                    Parent Login
                  </button>
                </li>
                <li>
                  <button
                    className="justify-between text-sm font-medium"
                    onClick={() => {
                      closeMenu();
                      onSettingsClick();
                    }}
                  >
                    Settings
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;
