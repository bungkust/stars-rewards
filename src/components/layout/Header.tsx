import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMenu } from 'react-icons/io5';
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
  const navigate = useNavigate();

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
    navigate('/child');
  };

  const headerGradient = 'bg-gradient-to-b from-primary/20 to-base-100/90';
  const titleColor = 'text-neutral';
  const menuButtonColor = 'text-neutral';

  return (
    <div
      className={`navbar fixed top-0 left-0 right-0 z-50 px-4 h-auto pt-[env(safe-area-inset-top)] pb-2 ${headerGradient} backdrop-blur-sm shadow-sm`}
    >
      <div className="flex-1">
        {activeChild && !isAdminMode && (
          <div
            className="btn btn-ghost gap-2 normal-case hover:bg-transparent cursor-default"
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
          </div>
        )}
        {isAdminMode && (
          <div className="flex items-center gap-2">
            <span className={`text-xl font-bold ${titleColor}`}>Parent Dashboard</span>
          </div>
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
            <IoMenu className="w-6 h-6" />
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
                    className="justify-between text-sm font-medium"
                    onClick={() => {
                      closeMenu();
                      onSettingsClick();
                    }}
                  >
                    Settings
                  </button>
                </li>
                <li>
                  <button
                    className="justify-between text-sm font-medium"
                    onClick={() => {
                      closeMenu();
                      logout().catch(() => { });
                    }}
                  >
                    Switch Profile
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
                      onSettingsClick(); // This is now handleProtectedSettings from Layout
                    }}
                  >
                    Settings
                  </button>
                </li>
                <li>
                  <button
                    className="justify-between text-sm font-medium"
                    onClick={() => {
                      closeMenu();
                      if (onChildSelectClick) onChildSelectClick();
                    }}
                  >
                    Switch Profile
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
