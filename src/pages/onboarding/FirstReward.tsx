import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { FaGamepad, FaIceCream, FaTicketAlt, FaGift, FaCheckCircle } from 'react-icons/fa';
import { PrimaryButton } from '../../components/design-system/PrimaryButton';

const ICONS = [
  { id: 'game', icon: FaGamepad, label: 'Game' },
  { id: 'treat', icon: FaIceCream, label: 'Treat' },
  { id: 'event', icon: FaTicketAlt, label: 'Event' },
  { id: 'gift', icon: FaGift, label: 'Gift' },
];

const FirstReward = () => {
  const navigate = useNavigate();
  const { addReward, setOnboardingStep, toggleAdminMode, setActiveChild, children, isLoading } = useAppStore();
  
  const [name, setName] = useState('');
  const [cost, setCost] = useState(30); 
  const [selectedIcon, setSelectedIcon] = useState(ICONS[1].id); 
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCostAdjust = (amount: number) => {
    setCost(Math.max(1, cost + amount));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    const { error: dbError } = await addReward({
      name: name.trim(),
      cost_value: Number(cost),
      category: selectedIcon,
      type: 'ONE_TIME'
    });

    if (dbError) {
      setError('Failed to create reward. Please try again.');
      return;
    }

    // Instead of alert and redirect immediately, show success state
    setShowSuccess(true);
  };

  const handleFinish = () => {
    // Flow Completion
    setOnboardingStep('completed');
    toggleAdminMode(false);
    
    if (children.length > 0) {
      setActiveChild(children[0].id);
    }

    navigate('/'); 
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/90 p-6 animate-fade-in">
        <div className="bg-base-100 rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center transform scale-100 transition-transform">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">You're All Set!</h2>
          <p className="text-gray-500 mb-8">
            Your family profile is ready. Start verifying tasks and giving rewards!
          </p>
          
          <button 
            onClick={handleFinish}
            className="btn btn-primary w-full rounded-xl text-lg font-bold shadow-lg animate-bounce-subtle"
          >
            Let's Go! 🚀
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 p-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-primary text-center mb-2">Create First Reward</h1>
        <p className="text-gray-500 text-center mb-8">Give them something to work towards!</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Reward Name</span>
            </label>
            <input 
              type="text" 
              placeholder="e.g. 30 min TV Time" 
              className="input input-bordered w-full rounded-xl" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Cost (Stars)</span>
            </label>
            <div className="flex items-center gap-4">
              <input 
                type="number" 
                className="input input-bordered flex-1 rounded-xl text-center font-bold text-lg" 
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                min={1}
              />
              <button type="button" onClick={() => handleCostAdjust(1)} className="btn btn-circle btn-sm bg-base-200">+1</button>
              <button type="button" onClick={() => handleCostAdjust(10)} className="btn btn-circle btn-sm bg-base-200">+10</button>
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Icon Category</span>
            </label>
            <div className="flex gap-4 overflow-x-auto pb-2 justify-center">
              {ICONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedIcon(item.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all min-w-[80px] ${selectedIcon === item.id ? 'border-primary bg-blue-50' : 'border-transparent bg-base-100'}`}
                >
                  <item.icon className={`w-8 h-8 ${selectedIcon === item.id ? 'text-primary' : 'text-gray-400'}`} />
                  <span className="text-xs font-medium text-gray-600">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-error text-sm text-center">{error}</p>}

          <PrimaryButton 
            type="submit" 
            className="rounded-xl mt-4 text-white font-bold text-lg shadow-md"
            disabled={!name.trim() || isLoading}
          >
            {isLoading ? 'Finishing...' : 'Finish Setup'}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
};

export default FirstReward;
