import { IoSettingsOutline, IoArrowBackOutline } from 'react-icons/io5';
import { useAppStore } from '../../store/useAppStore';

interface HeaderProps {
  onSettingsClick: () => void;
}

const Header = ({ onSettingsClick }: HeaderProps) => {
  const { isAdminMode, toggleAdminMode } = useAppStore();

  const handleExitAdmin = () => {
    toggleAdminMode(false);
  };

  return (
    <div className="navbar fixed top-0 left-0 right-0 z-50 px-4 h-auto min-h-16 pt-8 pb-2 bg-gradient-to-b from-blue-100 to-white/90 backdrop-blur-sm shadow-sm">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl text-primary font-bold hover:bg-transparent">
          {isAdminMode ? 'Parent Dashboard' : 'Stars Rewards'}
        </a>
      </div>
      <div className="flex-none">
        {isAdminMode ? (
          <button 
            className="btn btn-square btn-ghost text-gray-600 hover:bg-white/50"
            onClick={handleExitAdmin}
            title="Exit Parent Mode (Return to Child)"
          >
            <IoArrowBackOutline className="w-6 h-6" />
          </button>
        ) : (
          <button 
            className="btn btn-square btn-ghost text-gray-500 hover:bg-white/50"
            onClick={onSettingsClick}
            title="Settings / Parent Mode"
          >
            <IoSettingsOutline className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
