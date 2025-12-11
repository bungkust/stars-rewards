import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { FaArrowLeft, FaTrash } from 'react-icons/fa';
import { AlertModal, AppCard, ToggleButton } from '../../components/design-system';
import { generateRRule, parseRRule, WEEKDAYS } from '../../utils/recurrence';
import type { RecurrenceOptions } from '../../utils/recurrence';



const DIFFICULTY_PRESETS = [
  { label: 'MILESTONE', value: 0, desc: 'No Star Reward (Trigger for Milestone)', color: 'bg-gray-50 text-gray-600 border-gray-200' },
  { label: 'EASY', value: 5, desc: 'Quick daily win (e.g., Brush teeth)', color: 'bg-green-50 text-green-600 border-green-200' },
  { label: 'MEDIUM', value: 10, desc: 'Daily responsibility (e.g., Make bed)', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { label: 'HARD', value: 15, desc: 'Habit formation (e.g., Practice music)', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { label: 'SPECIAL', value: 25, desc: 'One-off project (e.g., Wash car)', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { label: 'EPIC', value: 50, desc: 'Major achievement (e.g., Good grades)', color: 'bg-rose-50 text-rose-600 border-rose-200' },
];

const AdminTaskForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get task ID from URL if editing
  const { addTask, updateTask, tasks, children, isLoading } = useAppStore();

  const [title, setTitle] = useState('');
  const [reward, setReward] = useState(10);
  const [expiryTime, setExpiryTime] = useState(''); // Default empty (Optional)
  const [repetition, setRepetition] = useState('Once');
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCustomRecurrence, setIsCustomRecurrence] = useState(false);
  const [customOptions, setCustomOptions] = useState<RecurrenceOptions>({
    frequency: 'WEEKLY',
    interval: 1,
    byDay: ['MO', 'WE', 'FR']
  });

  // Load existing task if editing
  useEffect(() => {
    if (id) {
      const taskToEdit = tasks.find(t => t.id === id);
      if (taskToEdit) {
        setTitle(taskToEdit.name);
        setReward(taskToEdit.reward_value);
        setExpiryTime(taskToEdit.expiry_time || '');
        setIsActive(taskToEdit.is_active !== false);
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
    if (selectedChildIds.length === 0 || !title) {
      return;
    }

    let finalRule = repetition;
    if (isCustomRecurrence) {
      finalRule = generateRRule(customOptions);
    }

    const taskData = {
      name: title,
      reward_value: Number(reward),
      type: (finalRule === 'Once' ? 'ONE_TIME' : 'RECURRING') as "ONE_TIME" | "RECURRING",
      recurrence_rule: finalRule,
      is_active: isActive,
      expiry_time: expiryTime,
      assigned_to: selectedChildIds
    };

    if (id) {
      await updateTask(id, taskData);
    } else {
      await addTask(taskData);
    }

    navigate('/tasks');
  };

  const handleDelete = async () => {
    if (id) {
      await updateTask(id, { is_active: false });
      navigate('/tasks');
    }
  };

  const isFormValid = title.trim().length > 0 && selectedChildIds.length > 0 && reward >= 0;

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
            type="text"
            placeholder="e.g. Clean Room"
            className="input input-bordered w-full rounded-xl"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold text-gray-500 uppercase text-xs tracking-wider">Suggested Rewards</span>
          </label>

          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTY_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setReward(preset.value)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 ${reward === preset.value
                  ? `border-current ${preset.color.split(' ')[1]} bg-white shadow-sm ring-1 ring-current`
                  : 'border-transparent bg-gray-50 hover:bg-gray-100 text-gray-400'
                  }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${reward === preset.value ? 'text-gray-800' : 'text-gray-500'}`}>
                  {preset.label}
                </span>
                <span className={`text-lg font-black ${reward === preset.value ? 'text-primary' : 'text-gray-300'}`}>
                  {preset.value}
                </span>
              </button>
            ))}
          </div>

          {/* Selected Description Helper */}
          <div className="min-h-[20px] mt-2 text-center">
            <p className="text-xs text-gray-400 font-medium transition-all">
              {DIFFICULTY_PRESETS.find(p => p.value === reward)?.desc || 'Custom reward amount'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Reward (Stars)</span>
            </label>
            <input
              type="number"
              className="input input-bordered w-full rounded-xl"
              value={reward}
              onChange={(e) => setReward(Number(e.target.value))}
              min={0}
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Expired Time</span>
              <span className="label-text-alt text-gray-400">(Optional)</span>
            </label>
            <input
              type="time"
              className="input input-bordered w-full rounded-xl"
              value={expiryTime}
              onChange={(e) => setExpiryTime(e.target.value)}
            />
            <label className="label">
              <span className="label-text-alt text-xs text-gray-400">Task will auto-fail if not done by this time.</span>
            </label>
          </div>
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold">Repetition</span>
          </label>

          {/* Main Type Selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {['Once', 'Daily', 'Weekly', 'Monthly', 'Custom'].map((opt) => (
              <ToggleButton
                key={opt}
                label={opt}
                isActive={(opt === 'Custom' && isCustomRecurrence) || (!isCustomRecurrence && repetition === opt)}
                onClick={() => handleRepetitionTypeChange(opt)}
              />
            ))}
          </div>

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
