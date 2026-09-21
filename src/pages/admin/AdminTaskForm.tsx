import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { FaArrowLeft, FaUserCheck, FaCommentDots, FaTshirt, FaSmile, FaShapes, FaStar, FaImage, FaSoap, FaClock, FaBook, FaUsers, FaTrash, FaChevronDown, FaCheck } from 'react-icons/fa';
import { AlertModal, AppCard, ToggleButton } from '../../components/design-system';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { generateRRule, parseRRule, WEEKDAYS } from '../../utils/recurrence';
import type { RecurrenceOptions } from '../../utils/recurrence';
import { convertToWebP } from '../../utils/imageUtils';
import { TASK_ICONS } from '../../utils/icons';
import { getDefaultMissionXpValue } from '../../utils/xpUtils';

const DIFFICULTY_PRESETS = [
  { label: 'MILESTONE', value: 0, xp: 5, desc: 'No Star Reward (Trigger for Milestone)', color: 'bg-gray-50 text-gray-600 border-gray-200' },
  { label: 'EASY', value: 5, xp: 10, desc: 'Quick daily win (e.g., Brush teeth)', color: 'bg-green-50 text-green-600 border-green-200' },
  { label: 'MEDIUM', value: 10, xp: 10, desc: 'Daily responsibility (e.g., Make bed)', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { label: 'HARD', value: 15, xp: 15, desc: 'Habit formation (e.g., Practice music)', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { label: 'SPECIAL', value: 25, xp: 20, desc: 'One-off project (e.g., Wash car)', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { label: 'EPIC', value: 50, xp: 30, desc: 'Major achievement (e.g., Good grades)', color: 'bg-rose-50 text-rose-600 border-rose-200' },
];

const TASK_TEMPLATES = [
  { title: 'Brush Teeth', reward: 5, xp: 10 },
  { title: 'Make Bed', reward: 10, xp: 10 },
  { title: 'Homework', reward: 15, xp: 10 },
  { title: 'Clean Room', reward: 20, xp: 10 },
  { title: 'Help at Home', reward: 10, xp: 10 },
  { title: 'Read a Book', reward: 15, xp: 10 },
];

const removeEmojis = (str: string) => str.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '');

const ICON_MAP: Record<string, any> = {
  'soap': FaSoap,
  'clock': FaClock,
  'user-check': FaUserCheck,
  'book': FaBook,
  'users': FaUsers,
  'message-circle': FaCommentDots,
  'shirt': FaTshirt,
  'smile': FaSmile,
  'default': FaShapes
};

const AdminTaskForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get task ID from URL if editing
  const { addTask, updateTask, tasks, children, categories, isLoading } = useAppStore();

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [reward, setReward] = useState(10);
  const [xpReward, setXpReward] = useState(10);
  const [expiryTime, setExpiryTime] = useState(''); // Default empty (Optional)
  const [repetition, setRepetition] = useState('Once');
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [maxCompletions, setMaxCompletions] = useState(1);
  const [description, setDescription] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCustomRecurrence, setIsCustomRecurrence] = useState(false);
  const [customOptions, setCustomOptions] = useState<RecurrenceOptions>({
    frequency: 'WEEKLY',
    interval: 1,
    byDay: ['MO', 'WE', 'FR']
  });
  const [isProgressTask, setIsProgressTask] = useState(false);
  const [targetValue, setTargetValue] = useState(1);
  const [targetUnit, setTargetUnit] = useState('');

  const [selectedIcon, setSelectedIcon] = useState('star');
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Convert to WebP, passing max size of 1MB
        const webpDataUrl = await convertToWebP(file, 1);
        setImageUrl(webpDataUrl);
        setSelectedIcon('');
      } catch (err: any) {
        alert(err.message || 'Failed to process image');
      }
    }
  };

  // Load existing task if editing
  useEffect(() => {
    if (id) {
      const taskToEdit = tasks.find(t => t.id === id);
      if (taskToEdit) {
        setTitle(taskToEdit.name);
        setCategoryId(taskToEdit.category_id || '');
        setReward(taskToEdit.reward_value);
        setXpReward(taskToEdit.xp_reward ?? getDefaultMissionXpValue(!!taskToEdit.total_target_value && taskToEdit.total_target_value > 1));
        setExpiryTime(taskToEdit.expiry_time || '');
        setMaxCompletions(taskToEdit.max_completions_per_day || 1);
        setIsActive(taskToEdit.is_active !== false);
        setDescription(taskToEdit.description || '');
        if (taskToEdit.assigned_to && taskToEdit.assigned_to.length > 0) {
          setSelectedChildIds(taskToEdit.assigned_to);
        } else {
          // Fallback for old tasks without assignment (shouldn't happen but safe)
          setSelectedChildIds(children.map(c => c.id));
        }

        const rule = taskToEdit.recurrence_rule || 'Once';
        if (['Once', 'Daily', 'Weekly', 'Monthly'].includes(rule)) {
          setRepetition(rule);
          setIsCustomRecurrence(false);
        } else {
          setRepetition('Custom');
          setIsCustomRecurrence(true);
          setCustomOptions(parseRRule(rule));
        }

        if (taskToEdit.total_target_value && taskToEdit.total_target_value > 0) {
          setIsProgressTask(true);
          setTargetValue(taskToEdit.total_target_value);
          setTargetUnit(taskToEdit.target_unit || '');
        } else {
          setIsProgressTask(false);
        }

        if (taskToEdit.icon) setSelectedIcon(taskToEdit.icon);
        if (taskToEdit.image_url) {
          setImageUrl(taskToEdit.image_url);
          setSelectedIcon('');
        }
      }
    } else {
      // New Task: Default to NONE
      setSelectedChildIds([]);
    }
  }, [id, tasks, children]);

  const handleRepetitionTypeChange = (type: string) => {
    setRepetition(type);
    if (type === 'Custom') {
      setIsCustomRecurrence(true);
    } else {
      setIsCustomRecurrence(false);
    }
  };

  const toggleChildSelection = (childId: string) => {
    setSelectedChildIds(prev =>
      prev.includes(childId)
        ? prev.filter(id => id !== childId)
        : [...prev, childId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation is handled by disabled button, but double check here
    if (selectedChildIds.length === 0 || !title || !categoryId) {
      return;
    }

    let finalRule = repetition;
    if (isCustomRecurrence) {
      finalRule = generateRRule(customOptions);
    }

    const taskData = {
      name: title,
      category_id: categoryId,
      reward_value: Number(reward),
      xp_reward: Number(xpReward),
      type: (finalRule === 'Once' ? 'ONE_TIME' : 'RECURRING') as "ONE_TIME" | "RECURRING",
      recurrence_rule: finalRule,
      is_active: isActive,
      expiry_time: expiryTime,
      assigned_to: selectedChildIds,
      max_completions_per_day: maxCompletions,
      total_target_value: isProgressTask ? targetValue : undefined,
      target_unit: isProgressTask ? targetUnit : undefined,
      description: description.trim() || undefined,
      icon: imageUrl ? undefined : selectedIcon,
      image_url: imageUrl || undefined,
    };

    if (id) {
      await updateTask(id, taskData);
    } else {
      await addTask(taskData);
    }

    navigate('/parent/tasks');
  };

  const handleDelete = async () => {
    if (id) {
      await updateTask(id, { is_active: false });
      navigate('/parent/tasks');
    }
  };

  const isFormValid = title.trim().length > 0 && selectedChildIds.length > 0 && reward >= 0 && xpReward >= 0 && categoryId && (!isProgressTask || (targetValue > 0 && targetUnit.trim().length > 0));

  const selectedCategory = categories.find(c => c.id === categoryId);
  const SelectedCategoryIcon = selectedCategory ? (ICON_MAP[selectedCategory.icon] || ICON_MAP['default']) : null;
  const selectedTaskIcon = TASK_ICONS.find(i => i.id === selectedIcon) || TASK_ICONS[0];
  const TaskIconComp = selectedTaskIcon.icon;
  const currentPreset = DIFFICULTY_PRESETS.find(p => p.value === reward);

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn btn-circle btn-ghost btn-sm">
            <FaArrowLeft />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">{id ? 'Edit Mission' : 'New Mission'}</h2>
        </div>
        {id && (
          <button onClick={() => setIsDeleteModalOpen(true)} className="btn btn-ghost btn-circle text-error">
            <FaTrash />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold">Mission Title</span>
          </label>
          <input
            id="taskTitle"
            name="taskTitle"
            type="text"
            placeholder="e.g. Brush Teeth, Feed the dog"
            className="input input-bordered w-full rounded-xl"
            value={title}
            onChange={(e) => setTitle(removeEmojis(e.target.value))}
            onInput={(e) => setTitle(removeEmojis(e.currentTarget.value))}
            maxLength={25}
            required
          />
          <div className="flex justify-end mt-1 px-1">
            <span className={`text-xs ${title.length >= 25 ? 'text-error font-bold' : 'text-gray-500'}`}>
              {title.length}/25 {title.length >= 25 && "(Max Length)"}
            </span>
          </div>
          
          {!id && (
            <div className="mt-3">
              <label className="label py-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quick Templates</span>
              </label>
              <Listbox value="" onChange={(selectedTitle: string) => {
                const t = TASK_TEMPLATES.find(tpl => tpl.title === selectedTitle);
                if (t) {
                  setTitle(t.title);
                  setReward(t.reward);
                  setXpReward(t.xp);
                }
              }}>
                <div className="relative">
                  <ListboxButton className="relative w-full cursor-pointer rounded-xl bg-white py-2.5 pl-4 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500/20 sm:text-sm min-h-[2.75rem] text-sm shadow-xs">
                    <span className="text-gray-400 font-medium">Select a quick template...</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                      <FaChevronDown className="h-3 w-3 text-gray-400" aria-hidden="true" />
                    </span>
                  </ListboxButton>
                  <ListboxOptions modal={false} className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-xl ring-1 ring-black/5 focus:outline-none z-50 border border-base-200">
                    {TASK_TEMPLATES.map((t) => (
                      <ListboxOption
                        key={t.title}
                        value={t.title}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2.5 px-4 text-xs font-semibold ${
                            active ? 'bg-emerald-50 text-emerald-900' : 'text-neutral'
                          }`
                        }
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-800">{t.title}</span>
                          <span className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-md text-[11px] font-black">
                            {t.reward} <FaStar className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </div>
              </Listbox>
            </div>
          )}
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold">Mission Description</span>
            <span className="label-text-alt text-gray-600 font-bold">(Optional)</span>
          </label>
          <textarea
            id="taskDescription"
            name="taskDescription"
            className="textarea textarea-bordered w-full rounded-xl h-24"
            placeholder="Describe the mission details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onInput={(e) => setDescription(e.currentTarget.value)}
          />
        </div>

        <div className="form-control w-full">
          <label className="label mb-1">
            <span className="label-text font-bold text-gray-500 uppercase text-xs tracking-wider">Category</span>
          </label>
          <Listbox value={categoryId} onChange={setCategoryId}>
            <div className="relative">
              <ListboxButton className="relative w-full cursor-pointer rounded-xl bg-white py-3 pl-4 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500/20 sm:text-sm min-h-[3rem] text-base shadow-xs">
                <span className="flex items-center gap-2.5 truncate">
                  {SelectedCategoryIcon && <SelectedCategoryIcon className="text-emerald-700 text-lg flex-shrink-0" />}
                  <span className={`font-bold ${selectedCategory ? 'text-gray-900' : 'text-gray-400 font-normal'}`}>
                    {selectedCategory ? selectedCategory.name : 'Select a category...'}
                  </span>
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <FaChevronDown className="h-3 w-3 text-gray-400" aria-hidden="true" />
                </span>
              </ListboxButton>
              <ListboxOptions modal={false} className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-xl ring-1 ring-black/5 focus:outline-none z-50 border border-base-200">
                {categories.map((cat) => {
                  const Icon = ICON_MAP[cat.icon] || ICON_MAP['default'];
                  return (
                    <ListboxOption
                      key={cat.id}
                      value={cat.id}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2.5 pl-10 pr-4 text-xs font-semibold ${
                          active ? 'bg-emerald-50 text-emerald-900' : 'text-neutral'
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <div className="flex items-center gap-2.5">
                            <Icon className={`text-base ${selected ? 'text-emerald-700' : 'text-gray-500'}`} />
                            <span className={`font-bold truncate ${selected ? 'text-emerald-700' : 'text-gray-900'}`}>
                              {cat.name}
                            </span>
                          </div>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-600">
                              <FaCheck className="h-3.5 w-3.5" aria-hidden="true" />
                            </span>
                          )}
                        </>
                      )}
                    </ListboxOption>
                  );
                })}
              </ListboxOptions>
            </div>
          </Listbox>
        </div>

        {/* Mission Icon/Image Selector */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold">Mission Icon / Image</span>
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
                    onClick={() => { setImageUrl(''); setSelectedIcon('star'); }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center text-xs shadow-md border-2 border-white font-black hover:scale-110 transition-transform"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="divider my-1 text-xs font-bold text-gray-400">OR</div>

            {/* Predefined Icons Dropdown */}
            <div className={imageUrl ? 'opacity-50 pointer-events-none grayscale' : ''}>
              <Listbox value={selectedIcon} onChange={(val: string) => { setSelectedIcon(val); setImageUrl(''); }}>
                <div className="relative">
                  <ListboxButton className="relative w-full cursor-pointer rounded-xl bg-white py-2.5 pl-4 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500/20 sm:text-sm min-h-[3rem] text-sm shadow-xs">
                    <span className="flex items-center gap-3">
                      <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                        <TaskIconComp className="w-5 h-5" />
                      </span>
                      <span className="font-bold text-gray-800 uppercase tracking-wide text-xs">{selectedTaskIcon.label}</span>
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                      <FaChevronDown className="h-3 w-3 text-gray-400" aria-hidden="true" />
                    </span>
                  </ListboxButton>
                  <ListboxOptions modal={false} className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-xl ring-1 ring-black/5 focus:outline-none z-50 border border-base-200">
                    {TASK_ICONS.map((item) => {
                      const IconComp = item.icon;
                      return (
                        <ListboxOption
                          key={item.id}
                          value={item.id}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2.5 pl-10 pr-4 text-xs font-semibold ${
                              active ? 'bg-emerald-50 text-emerald-900' : 'text-neutral'
                            }`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <div className="flex items-center gap-3">
                                <IconComp className={`w-5 h-5 ${selected ? 'text-emerald-700' : 'text-gray-500'}`} />
                                <span className={`font-bold ${selected ? 'text-emerald-700' : 'text-gray-900'} uppercase tracking-wide text-xs`}>
                                  {item.label}
                                </span>
                              </div>
                              {selected && (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-600">
                                  <FaCheck className="h-3.5 w-3.5" aria-hidden="true" />
                                </span>
                              )}
                            </>
                          )}
                        </ListboxOption>
                      );
                    })}
                  </ListboxOptions>
                </div>
              </Listbox>
            </div>
          </div>
        </div>

        {/* Mission Style Selector */}
        <div className="form-control w-full">
          <label className="label mb-1">
            <span className="label-text font-bold text-gray-500 uppercase text-xs tracking-wider">Mission Style</span>
          </label>
          <Listbox
            value={isProgressTask ? 'progress' : 'simple'}
            onChange={(val: string) => {
              const isProgress = val === 'progress';
              setIsProgressTask(isProgress);
              setXpReward(getDefaultMissionXpValue(isProgress));
            }}
          >
            <div className="relative">
              <ListboxButton className="relative w-full cursor-pointer rounded-xl bg-white py-3 pl-4 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500/20 sm:text-sm min-h-[3rem] text-base shadow-xs">
                <span className="flex items-center gap-2.5 truncate">
                  <span className="font-bold text-gray-900">
                    {isProgressTask ? 'Progress (Target)' : 'Simple (Checklist)'}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({isProgressTask ? 'Count towards a goal number' : 'Standard completion check'})
                  </span>
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <FaChevronDown className="h-3 w-3 text-gray-400" aria-hidden="true" />
                </span>
              </ListboxButton>
              <ListboxOptions modal={false} className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-xl ring-1 ring-black/5 focus:outline-none z-50 border border-base-200">
                {[
                  { value: 'simple', label: 'Simple (Checklist)', desc: 'Standard single tap completion check' },
                  { value: 'progress', label: 'Progress (Target)', desc: 'Numeric counter goal (e.g. 5 cups of water)' },
                ].map((opt) => (
                  <ListboxOption
                    key={opt.value}
                    value={opt.value}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2.5 pl-10 pr-4 text-xs font-semibold ${
                        active ? 'bg-emerald-50 text-emerald-900' : 'text-neutral'
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <div className="flex flex-col">
                          <span className={`font-bold ${selected ? 'text-emerald-700' : 'text-gray-900'}`}>
                            {opt.label}
                          </span>
                          <span className="text-[11px] text-gray-400 font-normal mt-0.5">{opt.desc}</span>
                        </div>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-600">
                            <FaCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        </div>

        {isProgressTask && (
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold">Target Amount</span>
              </label>
              <input
                id="targetAmount"
                name="targetAmount"
                type="number"
                min="1"
                className="input input-bordered w-full rounded-xl"
                value={targetValue}
                onChange={(e) => setTargetValue(Math.max(1, parseInt(e.target.value) || 1))}
                onInput={(e) => setTargetValue(Math.max(1, parseInt(e.currentTarget.value) || 1))}
              />
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold">Unit</span>
              </label>
              <input
                id="targetUnit"
                name="targetUnit"
                type="text"
                placeholder="e.g. Cups, Pages"
                className="input input-bordered w-full rounded-xl"
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                onInput={(e) => setTargetUnit(e.currentTarget.value)}
              />
            </div>
          </div>
        )}

        <div className="form-control w-full">
          <label className="label mb-1">
            <span className="label-text font-bold text-gray-500 uppercase text-xs tracking-wider">Suggested Rewards</span>
          </label>
          <Listbox
            value={reward}
            onChange={(val: number) => {
              const preset = DIFFICULTY_PRESETS.find(p => p.value === val);
              if (preset) {
                setReward(preset.value);
                setXpReward(preset.xp);
              }
            }}
          >
            <div className="relative">
              <ListboxButton className="relative w-full cursor-pointer rounded-xl bg-white py-3 pl-4 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500/20 sm:text-sm min-h-[3rem] text-base shadow-xs">
                <span className="flex items-center justify-between pr-4 truncate">
                  <span className="flex items-center gap-2">
                    <span className="font-black text-primary">{reward} Stars</span>
                    <span className="text-xs font-bold text-gray-500">
                      {currentPreset ? `(${currentPreset.label} • ${currentPreset.xp} XP)` : '(Custom Amount)'}
                    </span>
                  </span>
                  {currentPreset && (
                    <span className="text-xs text-gray-400 truncate max-w-[140px] hidden sm:inline">
                      {currentPreset.desc}
                    </span>
                  )}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <FaChevronDown className="h-3 w-3 text-gray-400" aria-hidden="true" />
                </span>
              </ListboxButton>
              <ListboxOptions modal={false} className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-xl ring-1 ring-black/5 focus:outline-none z-50 border border-base-200">
                {DIFFICULTY_PRESETS.map((preset) => (
                  <ListboxOption
                    key={preset.label}
                    value={preset.value}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2.5 pl-10 pr-4 text-xs font-semibold ${
                        active ? 'bg-emerald-50 text-emerald-900' : 'text-neutral'
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className={`font-bold ${selected ? 'text-emerald-700' : 'text-gray-900'}`}>
                              {preset.label} ({preset.value} Stars, {preset.xp} XP)
                            </span>
                            <p className="text-[11px] text-gray-400 font-normal">{preset.desc}</p>
                          </div>
                        </div>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-600">
                            <FaCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Reward (Stars)</span>
            </label>
            <input
              id="rewardValue"
              name="rewardValue"
              type="number"
              className="input input-bordered w-full rounded-xl"
              value={reward}
              onChange={(e) => setReward(Number(e.target.value))}
              onInput={(e) => setReward(Number(e.currentTarget.value))}
              min={0}
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">XP Reward</span>
            </label>
            <input
              id="xpReward"
              name="xpReward"
              type="number"
              className="input input-bordered w-full rounded-xl"
              value={xpReward}
              onChange={(e) => setXpReward(Number(e.target.value))}
              onInput={(e) => setXpReward(Number(e.currentTarget.value))}
              min={0}
            />
            <label className="label">
              <span className="label-text-alt text-xs text-gray-600 font-medium">XP levels up badges and titles. It does not affect star balance.</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Expired Time</span>
              <span className="label-text-alt text-gray-400">(Optional)</span>
            </label>
            <input
              id="expiryTime"
              name="expiryTime"
              type="time"
              className="input input-bordered w-full rounded-xl"
              value={expiryTime}
              onChange={(e) => setExpiryTime(e.target.value)}
              onInput={(e) => setExpiryTime(e.currentTarget.value)}
            />
            <label className="label">
              <span className="label-text-alt text-xs text-gray-600 font-medium">Task will auto-fail if not done by this time.</span>
            </label>
          </div>
        </div>

        {repetition !== 'Once' && (
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Max Completions per Day</span>
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="btn btn-circle btn-sm btn-ghost border-gray-300"
                onClick={() => setMaxCompletions(Math.max(1, maxCompletions - 1))}
              >
                -
              </button>
              <span className="text-xl font-bold w-8 text-center">{maxCompletions}</span>
              <button
                type="button"
                className="btn btn-circle btn-sm btn-ghost border-gray-300"
                onClick={() => setMaxCompletions(maxCompletions + 1)}
              >
                +
              </button>
              <span className="text-xs text-gray-400 ml-2">
                Child can claim this {maxCompletions} time{maxCompletions > 1 ? 's' : ''} per day.
              </span>
            </div>
          </div>
        )}

        <div className="form-control w-full">
          <label className="label mb-1">
            <span className="label-text font-bold text-gray-500 uppercase text-xs tracking-wider">Repetition</span>
          </label>

          {/* Main Repetition Listbox */}
          <Listbox
            value={isCustomRecurrence ? 'Custom' : repetition}
            onChange={(val) => handleRepetitionTypeChange(val)}
          >
            <div className="relative mb-4">
              <ListboxButton className="relative w-full cursor-pointer rounded-xl bg-white py-3 pl-4 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500/20 sm:text-sm min-h-[3rem] text-base shadow-xs">
                <span className="flex items-center gap-2.5 truncate">
                  <span className="font-bold text-gray-900">
                    {isCustomRecurrence ? 'Custom Schedule' : repetition}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({isCustomRecurrence
                      ? 'Custom interval & days'
                      : repetition === 'Once'
                        ? 'One-time mission'
                        : repetition === 'Daily'
                          ? 'Repeats every day'
                          : repetition === 'Weekly'
                            ? 'Repeats once a week'
                            : 'Repeats once a month'})
                  </span>
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <FaChevronDown className="h-3 w-3 text-gray-400" aria-hidden="true" />
                </span>
              </ListboxButton>
              <ListboxOptions modal={false} className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-xl ring-1 ring-black/5 focus:outline-none z-50 border border-base-200">
                {[
                  { value: 'Once', label: 'Once', desc: 'Single-time mission, disappears after completion' },
                  { value: 'Daily', label: 'Daily', desc: 'Resets and repeats every day' },
                  { value: 'Weekly', label: 'Weekly', desc: 'Resets and repeats once every week' },
                  { value: 'Monthly', label: 'Monthly', desc: 'Resets and repeats once every month' },
                  { value: 'Custom', label: 'Custom', desc: 'Set custom interval, weekdays, or month patterns' },
                ].map((opt) => (
                  <ListboxOption
                    key={opt.value}
                    value={opt.value}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2.5 pl-10 pr-4 text-xs font-semibold ${
                        active ? 'bg-emerald-50 text-emerald-900' : 'text-neutral'
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <div className="flex flex-col">
                          <span className={`font-bold ${selected ? 'text-emerald-700' : 'text-gray-900'}`}>
                            {opt.label}
                          </span>
                          <span className="text-[11px] text-gray-400 font-normal mt-0.5">{opt.desc}</span>
                        </div>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-600">
                            <FaCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>

          {/* Custom Builder UI */}
          {isCustomRecurrence && (
            <AppCard className="flex flex-col gap-4 border border-gray-100">
              <div className="flex gap-4">
                <div className="form-control flex-1">
                  <label className="label py-0 mb-1"><span className="label-text text-xs font-bold">Frequency</span></label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={customOptions.frequency}
                    onChange={(e) => setCustomOptions({ ...customOptions, frequency: e.target.value as any })}
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
                <div className="form-control w-24">
                  <label className="label py-0 mb-1"><span className="label-text text-xs font-bold">Every</span></label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      className="input input-bordered input-sm w-full"
                      value={customOptions.interval}
                      onChange={(e) => setCustomOptions({ ...customOptions, interval: Math.max(1, parseInt(e.target.value) || 1) })}
                    />
                    <span className="text-xs text-gray-500">
                      {customOptions.frequency === 'DAILY' ? 'Day(s)' : customOptions.frequency === 'WEEKLY' ? 'Week(s)' : 'Month(s)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Weekly: Day Selector */}
              {customOptions.frequency === 'WEEKLY' && (
                <div className="form-control">
                  <label className="label py-0 mb-2"><span className="label-text text-xs font-bold">On days</span></label>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map(day => (
                      <ToggleButton
                        key={day.value}
                        label={day.label}
                        isActive={customOptions.byDay?.includes(day.value) || false}
                        onClick={() => {
                          const current = customOptions.byDay || [];
                          const newDays = current.includes(day.value)
                            ? current.filter(d => d !== day.value)
                            : [...current, day.value];
                          setCustomOptions({ ...customOptions, byDay: newDays });
                        }}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      className="btn btn-xs btn-ghost text-primary"
                      onClick={() => setCustomOptions({ ...customOptions, byDay: ['MO', 'TU', 'WE', 'TH', 'FR'] })}
                    >
                      Weekdays Only
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs btn-ghost text-primary"
                      onClick={() => setCustomOptions({ ...customOptions, byDay: ['SA', 'SU'] })}
                    >
                      Weekends
                    </button>
                  </div>
                </div>
              )}

              {/* Monthly: Logic Selector */}
              {customOptions.frequency === 'MONTHLY' && (
                <div className="form-control">
                  <label className="label py-0 mb-2"><span className="label-text text-xs font-bold">On</span></label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="monthlyType"
                        className="radio radio-primary radio-sm"
                        checked={!!customOptions.byMonthDay}
                        onChange={() => setCustomOptions({ ...customOptions, byMonthDay: 1, bySetPos: undefined, byDay: undefined })}
                      />
                      <span className="text-sm">Day</span>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        className="input input-bordered input-xs w-16"
                        value={customOptions.byMonthDay || 1}
                        onChange={(e) => setCustomOptions({ ...customOptions, byMonthDay: parseInt(e.target.value), bySetPos: undefined, byDay: undefined })}
                        disabled={!customOptions.byMonthDay}
                      />
                      <span className="text-sm">of the month</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="monthlyType"
                        className="radio radio-primary radio-sm"
                        checked={!!customOptions.bySetPos}
                        onChange={() => setCustomOptions({ ...customOptions, byMonthDay: undefined, bySetPos: 1, byDay: ['MO'] })}
                      />
                      <span className="text-sm">The</span>
                      <select
                        className="select select-bordered select-xs"
                        value={customOptions.bySetPos || 1}
                        onChange={(e) => setCustomOptions({ ...customOptions, bySetPos: parseInt(e.target.value) })}
                        disabled={!customOptions.bySetPos}
                      >
                        <option value={1}>1st</option>
                        <option value={2}>2nd</option>
                        <option value={3}>3rd</option>
                        <option value={4}>4th</option>
                        <option value={-1}>Last</option>
                      </select>
                      <select
                        className="select select-bordered select-xs"
                        value={customOptions.byDay?.[0] || 'MO'}
                        onChange={(e) => setCustomOptions({ ...customOptions, byDay: [e.target.value] })}
                        disabled={!customOptions.bySetPos}
                      >
                        {WEEKDAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                      </select>
                    </label>
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 italic mt-2">
                Preview: {generateRRule(customOptions)}
              </div>
            </AppCard>
          )}
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
          {id ? 'Update Mission' : 'Save Mission'}
        </button>
      </form>

      <AlertModal
        isOpen={isDeleteModalOpen}
        title="Delete Mission"
        message="Are you sure you want to delete (archive) this mission?"
        confirmText="Delete"
        type="danger"
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AdminTaskForm;
