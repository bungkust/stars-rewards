import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { FaArrowLeft, FaGamepad, FaIceCream, FaTicketAlt, FaGift, FaChevronDown, FaCheck, FaInfinity, FaCheckCircle, FaTrophy, FaPizzaSlice, FaBicycle, FaBook, FaPalette, FaStar, FaImage } from 'react-icons/fa';
import { AlertModal } from '../../components/design-system';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { convertToWebP } from '../../utils/imageUtils';
import { REWARD_ICONS as ICONS } from '../../utils/icons';



const REWARD_TEMPLATES = [
  { title: 'Screen Time', cost: 50, icon: 'game' },
  { title: 'Ice Cream', cost: 80, icon: 'treat' },
  { title: 'Movie Night', cost: 150, icon: 'event' },
  { title: 'New Game', cost: 200, icon: 'game' },
  { title: 'New Toy', cost: 250, icon: 'gift' },
  { title: 'Play in Park', cost: 30, icon: 'activity' },
];

const removeEmojis = (str: string) => str.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '');

const AdminRewardForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addReward, updateReward, tasks, rewards, children, isLoading } = useAppStore();

  const [name, setName] = useState('');
  const [cost, setCost] = useState(10);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0].id);
  const [type, setType] = useState<'ONE_TIME' | 'UNLIMITED' | 'ACCUMULATIVE'>('UNLIMITED');
  const [requiredTaskId, setRequiredTaskId] = useState('');
  const [requiredTaskCount, setRequiredTaskCount] = useState(1);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const webpDataUrl = await convertToWebP(file, 1);
        setImageUrl(webpDataUrl);
        setSelectedIcon('');
      } catch (err: any) {
        alert(err.message || 'Failed to process image');
      }
    }
  };

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
        setDescription(rewardToEdit.description || '');

        if (rewardToEdit.icon) setSelectedIcon(rewardToEdit.icon);
        if (rewardToEdit.image_url) {
          setImageUrl(rewardToEdit.image_url);
          setSelectedIcon('');
        }

        if (rewardToEdit.assigned_to && rewardToEdit.assigned_to.length > 0) {
          setSelectedChildIds(rewardToEdit.assigned_to);
        } else {
          // Fallback for old rewards: assign to all (or none? let's do all for backward compatibility if needed, but user asked for default none for new. For edit, if missing, maybe all is safer to show it exists?)
          // Actually, if it's undefined, it means it was visible to everyone before. So ALL is correct fallback.
          setSelectedChildIds(children.map(c => c.id));
        }
      }
    } else {
      // New Reward: Default to NONE
      setSelectedChildIds([]);
    }
  }, [id, rewards, children]);

  const toggleChildSelection = (childId: string) => {
    setSelectedChildIds(prev =>
      prev.includes(childId)
        ? prev.filter(id => id !== childId)
        : [...prev, childId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedChildIds.length === 0 || !name) {
      return;
    }

    const rewardData = {
      name,
      cost_value: Number(cost),
      category: selectedIcon,
      type,
      required_task_id: type === 'ACCUMULATIVE' ? requiredTaskId : undefined,
      required_task_count: type === 'ACCUMULATIVE' ? Number(requiredTaskCount) : undefined,
      assigned_to: selectedChildIds,
      description: description.trim() || undefined,
      icon: imageUrl ? undefined : selectedIcon,
      image_url: imageUrl || undefined,
    };

    if (id) {
      await updateReward(id, rewardData);
    } else {
      await addReward(rewardData);
    }

    navigate('/parent/rewards');
  };

  const isFormValid = name.trim().length > 0 && selectedChildIds.length > 0 && cost >= 0;

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
            id="rewardName"
            name="rewardName"
            type="text"
            placeholder="e.g. 30 min iPad, Ice Cream"
            className="input input-bordered w-full rounded-xl"
            value={name}
            onChange={(e) => setName(removeEmojis(e.target.value))}
            onInput={(e) => setName(removeEmojis(e.currentTarget.value))}
            maxLength={25}
            required
          />
          <div className="flex justify-end mt-1 px-1">
            <span className={`text-xs ${name.length >= 25 ? 'text-error font-bold' : 'text-gray-500'}`}>
              {name.length}/25 {name.length >= 25 && "(Max Length)"}
            </span>
          </div>
          
          {!id && (
            <div className="mt-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Quick Suggestions</span>
              <div className="grid grid-cols-2 gap-2.5">
                {REWARD_TEMPLATES.map(t => (
                  <button
                    key={t.title}
                    type="button"
                    onClick={() => { setName(t.title); setCost(t.cost); setSelectedIcon(t.icon); }}
                    className="group relative flex items-center justify-between w-full px-3 py-2 bg-white border-2 border-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:border-primary hover:bg-primary/5 transition-all shadow-sm active:scale-95 text-left"
                  >
                    <span className="line-clamp-2 leading-tight mr-1">{t.title}</span> 
                    <span className="shrink-0 flex items-center gap-0.5 bg-primary/10 text-primary px-1.5 py-0.5 rounded-md text-[10px] font-black tracking-wide">
                      {t.cost} <FaStar className="w-2.5 h-2.5" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold">Reward Description</span>
            <span className="label-text-alt text-gray-600 font-bold">(Optional)</span>
          </label>
          <textarea
            id="rewardDescription"
            name="rewardDescription"
            className="textarea textarea-bordered w-full rounded-xl h-24"
            placeholder="Describe the reward details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onInput={(e) => setDescription(e.currentTarget.value)}
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold text-gray-500 uppercase text-xs tracking-wider">Reward Cost</span>
          </label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[10, 20, 50, 100].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setCost(val)}
                className={`btn btn-sm ${cost === val ? 'btn-primary' : 'btn-ghost bg-base-200'}`}
              >
                {val}
              </button>
            ))}
          </div>
          <div className="relative">
            <input
              id="rewardCost"
              name="rewardCost"
              type="number"
              className="input input-bordered w-full rounded-xl pl-12 font-bold text-lg"
              value={cost}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val <= 9999) setCost(val);
              }}
              onInput={(e) => {
                const val = Number(e.currentTarget.value);
                if (val <= 9999) setCost(val);
              }}
              min={0}
              max={9999}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
              <span className="text-xs font-black">STAR</span>
            </div>
          </div>
          <label className="label">
            <span className="label-text-alt text-gray-600 font-bold">Set to 0 for free rewards</span>
          </label>
        </div>

        <div className="form-control w-full mt-4">
          <label className="label mb-1">
            <span className="label-text font-bold text-gray-500 uppercase text-xs tracking-wider">Reward Type</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setType('UNLIMITED')}
              className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${type === 'UNLIMITED'
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-transparent bg-gray-50 hover:bg-gray-100'
                }`}
            >
              <FaInfinity className={`text-2xl mb-2 ${type === 'UNLIMITED' ? 'text-primary' : 'text-gray-400'}`} />
              <span className={`font-bold text-sm ${type === 'UNLIMITED' ? 'text-gray-800' : 'text-gray-500'}`}>Unlimited</span>
              <span className="text-[10px] text-gray-400 text-center mt-1">Redeem anytime</span>
            </button>

            <button
              type="button"
              onClick={() => setType('ONE_TIME')}
              className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${type === 'ONE_TIME'
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-transparent bg-gray-50 hover:bg-gray-100'
                }`}
            >
              <FaCheckCircle className={`text-2xl mb-2 ${type === 'ONE_TIME' ? 'text-primary' : 'text-gray-400'}`} />
              <span className={`font-bold text-sm ${type === 'ONE_TIME' ? 'text-gray-800' : 'text-gray-500'}`}>One-time</span>
              <span className="text-[10px] text-gray-400 text-center mt-1">Single use only</span>
            </button>

            <button
              type="button"
              onClick={() => setType('ACCUMULATIVE')}
              className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${type === 'ACCUMULATIVE'
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-transparent bg-gray-50 hover:bg-gray-100'
                }`}
            >
              <FaTrophy className={`text-2xl mb-2 ${type === 'ACCUMULATIVE' ? 'text-primary' : 'text-gray-400'}`} />
              <span className={`font-bold text-sm ${type === 'ACCUMULATIVE' ? 'text-gray-800' : 'text-gray-500'}`}>Milestone</span>
              <span className="text-[10px] text-gray-400 text-center mt-1">Unlock by tasks</span>
            </button>
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
                  <ListboxOptions modal={false} className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50">
                    <div className="sticky top-0 z-10 bg-white px-2 py-2 border-b border-gray-100">
                      <input
                        type="text"
                        className="input input-sm input-bordered w-full rounded-lg"
                        placeholder="Search missions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    {tasks
                      .filter(task => task.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((task) => (
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
                    {tasks.filter(task => task.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                      <div className="py-2 px-4 text-gray-500 text-sm italic">
                        No missions found.
                      </div>
                    )}
                  </ListboxOptions>
                </div>
              </Listbox>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold">Required Completions</span>
              </label>
              <input
                id="requiredCompletions"
                name="requiredCompletions"
                type="number"
                className="input input-bordered w-full rounded-xl"
                value={requiredTaskCount}
                onChange={(e) => setRequiredTaskCount(Number(e.target.value))}
                onInput={(e) => setRequiredTaskCount(Number(e.currentTarget.value))}
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
            <span className="label-text font-bold">Reward Icon / Image</span>
            <span className="label-text-alt text-gray-500 font-bold">(Optional custom icon)</span>
          </label>
          <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            {/* Custom Image Upload */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn bg-white btn-sm w-full font-bold border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 shadow-sm"
                >
                  <FaImage className="mr-2" /> Upload Custom Photo
                </button>
                <p className="text-[10px] text-gray-500 mt-1.5 text-center font-bold">Max 1MB. Auto-converted to WebP.</p>
              </div>
              
              {imageUrl && (
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-primary shadow-sm bg-white">
                    <img src={imageUrl} alt="Custom" className="w-full h-full object-contain" />
                  </div>
                  <button
                    type="button"
                    onClick={() => { setImageUrl(''); setSelectedIcon(ICONS[0].id); }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center text-xs shadow-md border-2 border-white font-black hover:scale-110 transition-transform"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="divider my-1 text-xs font-bold text-gray-400">OR</div>

            {/* Predefined Icons */}
            <div className={`grid grid-cols-4 gap-3 ${imageUrl ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
              {ICONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { setSelectedIcon(item.id); setImageUrl(''); }}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all aspect-square ${selectedIcon === item.id && !imageUrl
                    ? 'border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary'
                    : 'border-transparent bg-white hover:bg-gray-100 text-gray-400 shadow-sm'
                    }`}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase tracking-wide">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold">Assign To</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {children.map(child => {
              const isSelected = selectedChildIds.includes(child.id);
              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => toggleChildSelection(child.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent bg-base-100 shadow-sm hover:bg-base-200'
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                    }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="avatar">
                    <div className="w-8 h-8 rounded-full">
                      <img src={child.avatar_url} alt={child.name} />
                    </div>
                  </div>
                  <span className={`font-bold ${isSelected ? 'text-primary' : 'text-gray-600'}`}>
                    {child.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary rounded-xl w-full mt-4 text-white font-bold text-lg shadow-md disabled:bg-gray-300 disabled:text-gray-500"
          disabled={!isFormValid || isLoading}
        >
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

