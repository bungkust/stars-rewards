import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { FaArrowLeft, FaGamepad, FaIceCream, FaTicketAlt, FaGift } from 'react-icons/fa';

const ICONS = [
  { id: 'game', icon: FaGamepad, label: 'Game' },
  { id: 'treat', icon: FaIceCream, label: 'Treat' },
  { id: 'event', icon: FaTicketAlt, label: 'Event' },
  { id: 'gift', icon: FaGift, label: 'Gift' },
];

const AdminRewardForm = () => {
  const navigate = useNavigate();
  const { addReward, tasks } = useAppStore();
  
  const [name, setName] = useState('');
  const [cost, setCost] = useState(10);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0].id);
  const [type, setType] = useState<'ONE_TIME' | 'UNLIMITED' | 'ACCUMULATIVE'>('UNLIMITED');
  const [requiredTaskId, setRequiredTaskId] = useState('');
  const [requiredTaskCount, setRequiredTaskCount] = useState(1);

  const handleCostAdjust = (amount: number) => {
    setCost(Math.max(0, cost + amount)); // Allow 0 cost for accumulative rewards if desired
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await addReward({
      name,
      cost_value: Number(cost),
      category: selectedIcon,
      type,
      required_task_id: type === 'ACCUMULATIVE' ? requiredTaskId : undefined,
      required_task_count: type === 'ACCUMULATIVE' ? Number(requiredTaskCount) : undefined,
    });
    
    navigate('/admin/rewards');
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn btn-circle btn-ghost btn-sm">
          <FaArrowLeft />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">New Reward</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold">Reward Name</span>
          </label>
          <input 
            type="text" 
            placeholder="e.g. 30 min iPad" 
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
            <span className="label-text font-bold">Reward Type</span>
          </label>
          <div className="flex flex-col gap-3">
            <div className="flex gap-4">
              <label className="label cursor-pointer justify-start gap-2 border rounded-xl p-3 flex-1 hover:bg-base-200 transition-colors">
                <input 
                  type="radio" 
                  name="type" 
                  className="radio radio-primary" 
                  checked={type === 'UNLIMITED'}
                  onChange={() => setType('UNLIMITED')} 
                />
                <div className="flex flex-col">
                  <span className="label-text font-bold">Unlimited</span>
                  <span className="text-xs text-gray-500">Can be redeemed multiple times</span>
                </div>
              </label>
              <label className="label cursor-pointer justify-start gap-2 border rounded-xl p-3 flex-1 hover:bg-base-200 transition-colors">
                <input 
                  type="radio" 
                  name="type" 
                  className="radio radio-primary" 
                  checked={type === 'ONE_TIME'}
                  onChange={() => setType('ONE_TIME')} 
                />
                <div className="flex flex-col">
                  <span className="label-text font-bold">One-time</span>
                  <span className="text-xs text-gray-500">Can be redeemed only once</span>
                </div>
              </label>
            </div>

            <label className="label cursor-pointer justify-start gap-2 border rounded-xl p-3 hover:bg-base-200 transition-colors">
              <input 
                type="radio" 
                name="type" 
                className="radio radio-primary" 
                checked={type === 'ACCUMULATIVE'}
                onChange={() => setType('ACCUMULATIVE')} 
              />
              <div className="flex flex-col">
                <span className="label-text font-bold">Accumulative</span>
                <span className="text-xs text-gray-500">Unlock after completing a task multiple times</span>
              </div>
            </label>
          </div>
        </div>

        {type === 'ACCUMULATIVE' && (
          <div className="card bg-base-200 p-4 rounded-xl animate-fade-in">
            <h3 className="font-bold text-gray-700 mb-3">Unlock Requirements</h3>
            
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text font-bold">Required Mission</span>
              </label>
              <select 
                className="select select-bordered w-full rounded-xl"
                value={requiredTaskId}
                onChange={(e) => setRequiredTaskId(e.target.value)}
                required={type === 'ACCUMULATIVE'}
              >
                <option value="" disabled>Select a mission...</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>{task.name}</option>
                ))}
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold">Required Completions</span>
              </label>
              <input 
                type="number" 
                className="input input-bordered w-full rounded-xl"
                value={requiredTaskCount}
                onChange={(e) => setRequiredTaskCount(Number(e.target.value))}
                min={1}
                required={type === 'ACCUMULATIVE'}
              />
            </div>
          </div>
        )}

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold">Icon Category</span>
          </label>
          <div className="flex gap-4 overflow-x-auto pb-2">
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

        <button type="submit" className="btn btn-primary rounded-xl w-full mt-4 text-white font-bold text-lg shadow-md">
          Save Reward
        </button>
      </form>
    </div>
  );
};

export default AdminRewardForm;

