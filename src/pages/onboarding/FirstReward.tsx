import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { PrimaryButton } from '../../components/design-system/PrimaryButton';
import { FaGamepad, FaIceCream, FaTicketAlt, FaGift, FaChevronDown, FaCheck } from 'react-icons/fa';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';

const ICONS = [
  { id: 'game', icon: FaGamepad, label: 'Game' },
  { id: 'treat', icon: FaIceCream, label: 'Treat' },
  { id: 'event', icon: FaTicketAlt, label: 'Event' },
  { id: 'gift', icon: FaGift, label: 'Gift' },
];

const FirstReward = () => {
  const navigate = useNavigate();
  const { addReward, setOnboardingStep, isLoading, tasks } = useAppStore();

  const [name, setName] = useState('');
  const [cost, setCost] = useState(50);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0].id);
  const [type, setType] = useState<'ONE_TIME' | 'UNLIMITED' | 'ACCUMULATIVE'>('UNLIMITED');
  const [requiredTaskId, setRequiredTaskId] = useState('');
  const [requiredTaskCount, setRequiredTaskCount] = useState(1);
  const [error, setError] = useState('');

  const handleCostAdjust = (amount: number) => {
    setCost(Math.max(0, cost + amount));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a reward name');
      return;
    }

    const rewardData = {
      name,
      cost_value: Number(cost),
      category: selectedIcon,
      type,
      required_task_id: type === 'ACCUMULATIVE' ? requiredTaskId : undefined,
      required_task_count: type === 'ACCUMULATIVE' ? Number(requiredTaskCount) : undefined,
    };

    const { error: rewardError } = await addReward(rewardData);

    if (rewardError) {
      setError('Failed to create reward');
      return;
    }

    setOnboardingStep('completed');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center app-gradient p-6 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-primary text-center mb-2">Create First Reward</h1>
        <p className="text-gray-500 text-center mb-8">What can they redeem their stars for?</p>

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
              autoFocus
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
                min={0}
              />
              <button type="button" onClick={() => handleCostAdjust(1)} className="btn btn-circle btn-sm bg-base-200">+1</button>
              <button type="button" onClick={() => handleCostAdjust(10)} className="btn btn-circle btn-sm bg-base-200">+10</button>
            </div>
            <label className="label">
              <span className="label-text-alt text-gray-500">Set to 0 for Milestone Rewards</span>
            </label>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Reward Type</span>
            </label>
            <div className="flex flex-col gap-3">
              <div className="flex gap-4">
                <label className="label cursor-pointer justify-start gap-2 border rounded-xl p-3 flex-1 hover:bg-base-200 transition-colors bg-white/50">
                  <input
                    type="radio"
                    name="type"
                    className="radio radio-primary"
                    checked={type === 'UNLIMITED'}
                    onChange={() => setType('UNLIMITED')}
                  />
                  <div className="flex flex-col">
                    <span className="label-text font-bold">Unlimited</span>
                    <span className="text-xs text-gray-500">Multiple times</span>
                  </div>
                </label>
                <label className="label cursor-pointer justify-start gap-2 border rounded-xl p-3 flex-1 hover:bg-base-200 transition-colors bg-white/50">
                  <input
                    type="radio"
                    name="type"
                    className="radio radio-primary"
                    checked={type === 'ONE_TIME'}
                    onChange={() => setType('ONE_TIME')}
                  />
                  <div className="flex flex-col">
                    <span className="label-text font-bold">One-time</span>
                    <span className="text-xs text-gray-500">Once only</span>
                  </div>
                </label>
              </div>

              <label className="label cursor-pointer justify-start gap-2 border rounded-xl p-3 hover:bg-base-200 transition-colors bg-white/50">
                <input
                  type="radio"
                  name="type"
                  className="radio radio-primary"
                  checked={type === 'ACCUMULATIVE'}
                  onChange={() => setType('ACCUMULATIVE')}
                />
                <div className="flex flex-col">
                  <span className="label-text font-bold">Milestone / Accumulative</span>
                  <span className="text-xs text-gray-500">Unlock after completing specific tasks</span>
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
                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-50 text-primary' : 'text-gray-900'
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
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all min-w-[80px] ${selectedIcon === item.id ? 'border-primary bg-blue-50' : 'border-transparent bg-white/50'}`}
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
            className="rounded-xl mt-4 shadow-md text-lg font-bold"
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
