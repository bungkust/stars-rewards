import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { FaArrowLeft, FaGamepad, FaIceCream, FaTicketAlt, FaGift, FaTrash, FaChevronDown, FaCheck } from 'react-icons/fa';
import { AlertModal } from '../../components/design-system';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';

const ICONS = [
  { id: 'game', icon: FaGamepad, label: 'Game' },
  { id: 'treat', icon: FaIceCream, label: 'Treat' },
  { id: 'event', icon: FaTicketAlt, label: 'Event' },
  { id: 'gift', icon: FaGift, label: 'Gift' },
];

const AdminRewardForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addReward, updateReward, deleteReward, tasks, rewards } = useAppStore();
  
  const [name, setName] = useState('');
  const [cost, setCost] = useState(10);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0].id);
  const [type, setType] = useState<'ONE_TIME' | 'UNLIMITED' | 'ACCUMULATIVE'>('UNLIMITED');
  const [requiredTaskId, setRequiredTaskId] = useState('');
  const [requiredTaskCount, setRequiredTaskCount] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Load existing reward if editing
  useEffect(() => {
    if (id) {
      const rewardToEdit = rewards.find(r => r.id === id);
      if (rewardToEdit) {
        setName(rewardToEdit.name);
        setCost(rewardToEdit.cost_value);
        setSelectedIcon(rewardToEdit.category || ICONS[0].id);
        setType(rewardToEdit.type as any);
        if (rewardToEdit.required_task_id) setRequiredTaskId(rewardToEdit.required_task_id);
        if (rewardToEdit.required_task_count) setRequiredTaskCount(rewardToEdit.required_task_count);
      }
    }
  }, [id, rewards]);

  const handleCostAdjust = (amount: number) => {
    setCost(Math.max(0, cost + amount)); // Allow 0 cost for accumulative rewards if desired
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const rewardData = {
      name,
      cost_value: Number(cost),
      category: selectedIcon,
      type,
      required_task_id: type === 'ACCUMULATIVE' ? requiredTaskId : undefined,
      required_task_count: type === 'ACCUMULATIVE' ? Number(requiredTaskCount) : undefined,
    };

    if (id) {
      await updateReward(id, rewardData);
    } else {
      await addReward(rewardData);
    }
    
    navigate('/admin/rewards');
  };

  const handleDelete = async () => {
    // Currently not implementing hard delete, maybe just visual removal or soft delete if backend supported it.
    // For now, skipping delete or we can implement it in dataService if requested.
    // Assuming "Edit" is the main request.
    alert("Delete functionality not yet implemented.");
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn btn-circle btn-ghost btn-sm">
            <FaArrowLeft />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">{id ? 'Edit Reward' : 'New Reward'}</h2>
        </div>
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
              
              <Listbox value={requiredTaskId} onChange={setRequiredTaskId}>
                <div className="relative">
                  <ListboxButton className="relative w-full cursor-pointer rounded-xl bg-white py-3 pl-4 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 sm:text-sm min-h-[3rem] text-base">
                    <span className={`block truncate ${!requiredTaskId ? 'text-gray-400' : 'text-gray-900'}`}>
                      {tasks.find(t => t.id === requiredTaskId)?.name || 'Select a mission...'}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                      <FaChevronDown className="h-3 w-3 text-gray-400" aria-hidden="true" />
                    </span>
                  </ListboxButton>
                  <ListboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50">
                    {tasks.map((task) => (
                      <ListboxOption
                        key={task.id}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-blue-50 text-primary' : 'text-gray-900'
                          }`
                        }
                        value={task.id}
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                              {task.name}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                <FaCheck className="h-3 w-3" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </div>
              </Listbox>
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
              <label className="label">
                 <span className="label-text-alt text-gray-500">How many times must the mission be completed?</span>
              </label>
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
          {id ? 'Update Reward' : 'Save Reward'}
        </button>
      </form>

      <AlertModal
        isOpen={isDeleteModalOpen}
        title="Delete Reward"
        message="Are you sure you want to delete this reward?"
        confirmText="Delete"
        type="danger"
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AdminRewardForm;

