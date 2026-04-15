import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { PrimaryButton } from '../../components/design-system/PrimaryButton';
import { AppCard, ToggleButton } from '../../components/design-system';
import { FaStar, FaImage } from 'react-icons/fa';
import { generateRRule, WEEKDAYS } from '../../utils/recurrence';
import { ICON_MAP, TASK_ICONS } from '../../utils/icons';
import type { RecurrenceOptions } from '../../utils/recurrence';
import { convertToWebP } from '../../utils/imageUtils';

const DIFFICULTY_PRESETS = [
  { label: 'MILESTONE', value: 0, desc: 'No Star Reward (Trigger for Milestone)', color: 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 border-gray-200' },
  { label: 'EASY', value: 5, desc: 'Quick daily win (e.g., Brush teeth)', color: 'bg-gradient-to-br from-green-50 to-green-100 text-green-600 border-green-200' },
  { label: 'MEDIUM', value: 10, desc: 'Daily responsibility (e.g., Make bed)', color: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 border-blue-200' },
  { label: 'HARD', value: 15, desc: 'Habit formation (e.g., Practice music)', color: 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 border-purple-200' },
  { label: 'SPECIAL', value: 25, desc: 'One-off project (e.g., Wash car)', color: 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 border-amber-200' },
];

const TASK_TEMPLATES = [
  { title: 'Brush Teeth', reward: 5 },
  { title: 'Make Bed', reward: 10 },
  { title: 'Homework', reward: 15 },
  { title: 'Clean Room', reward: 20 },
  { title: 'Help at Home', reward: 10 },
  { title: 'Read a Book', reward: 15 },
];

const removeEmojis = (str: string) => str.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '');

const FirstTask = () => {
  const navigate = useNavigate();
  const { addTask, setOnboardingStep, isLoading, children, categories } = useAppStore();

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [reward, setReward] = useState(10);
  const [expiryTime, setExpiryTime] = useState('');
  const [repetition, setRepetition] = useState('Daily');
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [isCustomRecurrence, setIsCustomRecurrence] = useState(false);
  const [customOptions, setCustomOptions] = useState<RecurrenceOptions>({
    frequency: 'WEEKLY',
    interval: 1,
    byDay: ['MO', 'WE', 'FR']
  });
  const [isProgressTask, setIsProgressTask] = useState(false);
  const [targetValue, setTargetValue] = useState(1);
  const [targetUnit, setTargetUnit] = useState('');
  const [error, setError] = useState('');

  const [selectedIcon, setSelectedIcon] = useState('star');
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

  // Initialize selected children (select all by default for onboarding convenience)
  useState(() => {
    setSelectedChildIds(children.map(c => c.id));
  });

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
    if (!title.trim()) {
      setError('Please enter a task name');
      return;
    }
    if (!categoryId) {
      setError('Please select a category');
      return;
    }
    if (selectedChildIds.length === 0) {
      setError('Please select at least one child');
      return;
    }

    let finalRule = repetition;
    if (isCustomRecurrence) {
      finalRule = generateRRule(customOptions);
    }

    const { error: taskError } = await addTask({
      name: title,
      category_id: categoryId,
      reward_value: Number(reward),
      type: (finalRule === 'Once' ? 'ONE_TIME' : 'RECURRING') as "ONE_TIME" | "RECURRING",
      recurrence_rule: finalRule,
      is_active: true,
      expiry_time: expiryTime,
      assigned_to: selectedChildIds,
      total_target_value: isProgressTask ? targetValue : undefined,
      target_unit: isProgressTask ? targetUnit : undefined,
      icon: imageUrl ? undefined : selectedIcon,
      image_url: imageUrl || undefined,
    });

    if (taskError) {
      setError('Failed to create task');
      return;
    }

    // First Win Flow: Auto-create an easy, ready-to-complete 'Setup Profile' task
    if (categories.length > 0) {
      await addTask({
        name: 'Setup Profile 🚀',
        category_id: categories[0].id,
        reward_value: 10,
        type: 'ONE_TIME',
        recurrence_rule: 'Once',
        is_active: true,
        expiry_time: '',
        assigned_to: selectedChildIds,
      });
    }

    setOnboardingStep('first-reward');
    navigate('/onboarding/first-reward');
  };

  const isFormValid = title.trim().length > 0 && categoryId && selectedChildIds.length > 0 && reward >= 0 && (!isProgressTask || (targetValue > 0 && targetUnit.trim().length > 0));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center app-gradient p-6 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-primary text-center mb-2">Create First Mission</h1>
        <p className="text-gray-600 text-center mb-8">What is a daily habit you want to encourage?</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Mission Title</span>
            </label>
            <input
              type="text"
              id="missionTitleInput"
              name="missionTitleInput"
              placeholder="e.g. Brush Teeth, Feed the dog"
              className="input input-bordered w-full rounded-xl"
              value={title}
              onInput={(e) => setTitle(removeEmojis(e.currentTarget.value))}
              onChange={(e) => setTitle(removeEmojis(e.target.value))}
              maxLength={25}
              autoFocus
              required
            />
            <div className="flex justify-end mt-1 px-1">
              <span className={`text-xs ${title.length >= 25 ? 'text-error font-bold' : 'text-gray-500'}`}>
                {title.length}/25 {title.length >= 25 && "(Max Length)"}
              </span>
            </div>
            
            <div className="mt-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Quick Templates</span>
              <div className="grid grid-cols-2 gap-2.5">
                {TASK_TEMPLATES.map(t => (
                  <button
                    key={t.title}
                    type="button"
                    onClick={() => { setTitle(t.title); setReward(t.reward); }}
                    className="group relative flex items-center justify-between w-full px-3 py-2 bg-white border-2 border-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:border-primary hover:bg-primary/5 transition-all shadow-sm active:scale-95 text-left"
                  >
                    <span className="line-clamp-2 leading-tight mr-1">{t.title}</span> 
                    <span className="shrink-0 flex items-center gap-0.5 bg-primary/10 text-primary px-1.5 py-0.5 rounded-md text-[10px] font-black tracking-wide">
                      {t.reward} <FaStar className="w-2.5 h-2.5" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Category</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => {
                const Icon = ICON_MAP[cat.icon] || ICON_MAP['default'];
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 h-20 ${isSelected
                      ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                      }`}
                  >
                    <Icon className="text-xl mb-1" />
                    <span className="text-[10px] font-bold text-center leading-tight line-clamp-2">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
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

              {/* Predefined Icons */}
              <div className={`grid grid-cols-6 gap-2 ${imageUrl ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                {TASK_ICONS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedIcon === item.id && !imageUrl;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { setSelectedIcon(item.id); setImageUrl(''); }}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all aspect-square ${isSelected
                        ? 'border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary'
                        : 'border-transparent bg-white hover:bg-gray-100 text-gray-400 shadow-sm'
                        }`}
                    >
                      <Icon className="text-xl" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mission Style Selector */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Mission Style</span>
            </label>
            <div className="flex gap-2">
              <ToggleButton
                label="Simple (Checklist)"
                isActive={!isProgressTask}
                onClick={() => setIsProgressTask(false)}
                className="flex-1"
              />
              <ToggleButton
                label="Progress (Target)"
                isActive={isProgressTask}
                onClick={() => setIsProgressTask(true)}
                className="flex-1"
              />
            </div>
          </div>

          {isProgressTask && (
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-bold">Target Amount</span>
                </label>
                <input
                  type="number"
                  min="1"
                  className="input input-bordered w-full rounded-xl"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-bold">Unit</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cups, Pages"
                  className="input input-bordered w-full rounded-xl"
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value)}
                />
              </div>
            </div>
          )}

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
            <div className="min-h-[20px] mt-2 text-center border-t border-gray-100 pt-1">
              <p className="text-xs text-gray-600 font-bold transition-all">
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
                <span className="label-text-alt text-gray-600 font-bold">(Optional)</span>
              </label>
              <input
                type="time"
                className="input input-bordered w-full rounded-xl"
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
              />
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
              <AppCard className="flex flex-col gap-4 border border-gray-100 bg-white">
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

          {error && <p className="text-error text-sm text-center">{error}</p>}

          <PrimaryButton
            type="submit"
            className="rounded-xl mt-4 shadow-md text-lg font-bold"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? 'Saving...' : 'Save & Continue'}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
};

export default FirstTask;
