import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { FaArrowLeft, FaStar, FaTrash, FaTrophy, FaChevronDown, FaCheck } from 'react-icons/fa';
import { Minus, Plus, Check, ClipboardText, Gift } from '@phosphor-icons/react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { AlertModal } from '../../components/design-system';

const STREAK_TEMPLATES = [
  {
    id: '3d',
    title: 'Starting Spark (3-Day Streak)',
    days: 3,
    bonusStars: 5,
    description: 'Keep your positive habits going for 3 consecutive days without a break.',
    subtitle: '3 Days • +5 Stars',
  },
  {
    id: '7d',
    title: 'Weekly Warrior (7-Day Streak)',
    days: 7,
    bonusStars: 15,
    description: 'Maintain your momentum for a full week straight. Every single day counts!',
    subtitle: '7 Days • +15 Stars',
  },
  {
    id: '14d',
    title: 'Two-Week Champion (14-Day Streak)',
    days: 14,
    bonusStars: 30,
    description: 'Show true consistency across two entire weeks without missing any missions.',
    subtitle: '14 Days • +30 Stars',
  },
  {
    id: '30d',
    title: 'Monthly Master (30-Day Streak)',
    days: 30,
    bonusStars: 75,
    description: 'A full month of steady dedication. Habits are becoming your superpower!',
    subtitle: '30 Days • +75 Stars',
  },
  {
    id: '100d',
    title: 'Century Legend (100-Day Streak)',
    days: 100,
    bonusStars: 250,
    description: 'Legendary achievement! 100 days of unstoppable dedication and character.',
    subtitle: '100 Days • +250 Stars',
  },
];

const DAY_OPTIONS = [
  { value: 3, label: '3 Days — Starting Spark' },
  { value: 5, label: '5 Days — School Week' },
  { value: 7, label: '7 Days — Full Week' },
  { value: 10, label: '10 Days — Double Digits' },
  { value: 14, label: '14 Days — Two Weeks' },
  { value: 21, label: '21 Days — Habit Builder' },
  { value: 30, label: '30 Days — Full Month' },
  { value: 60, label: '60 Days — Two Months' },
  { value: 100, label: '100 Days — Century Club' },
];

const STAR_OPTIONS = [
  { value: 5, label: '+5 Stars (Small Boost)' },
  { value: 10, label: '+10 Stars (Nice Bonus)' },
  { value: 15, label: '+15 Stars (Weekly Reward)' },
  { value: 25, label: '+25 Stars (Big Milestone)' },
  { value: 50, label: '+50 Stars (Major Achievement)' },
  { value: 75, label: '+75 Stars (Monthly Prize)' },
  { value: 100, label: '+100 Stars (Mega Bonus)' },
  { value: 250, label: '+250 Stars (Legendary Jackpot)' },
];

const AdminStreakForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    streakMilestones,
    addStreakMilestone,
    updateStreakMilestone,
    deleteStreakMilestone,
    tasks,
    rewards,
  } = useAppStore();

  const [title, setTitle] = useState('');
  const [days, setDays] = useState(7);
  const [bonusStars, setBonusStars] = useState(15);
  const [description, setDescription] = useState('');
  const [linkedTaskId, setLinkedTaskId] = useState<string>('');
  const [linkedRewardId, setLinkedRewardId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // If editing, load existing milestone
  useEffect(() => {
    if (id) {
      const milestone = streakMilestones.find((m) => m.id === id || String(m.days) === id);
      if (milestone) {
        setTitle(milestone.title);
        setDays(milestone.days);
        setBonusStars(milestone.bonusStars);
        setDescription(milestone.description || '');
        setLinkedTaskId(milestone.linked_task_id || '');
        setLinkedRewardId(milestone.linked_reward_id || '');
      }
    }
  }, [id, streakMilestones]);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = STREAK_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      setTitle(tmpl.title);
      setDays(tmpl.days);
      setBonusStars(tmpl.bonusStars);
      setDescription(tmpl.description);
      setLinkedTaskId('');
      setLinkedRewardId('');
    }
  };

  const handleDaysChange = (delta: number) => {
    setDays((prev) => Math.max(1, prev + delta));
  };

  const handleStarsChange = (delta: number) => {
    setBonusStars((prev) => Math.max(1, prev + delta));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || days <= 0 || bonusStars <= 0) {
      return;
    }

    const milestoneData = {
      title: title.trim(),
      days,
      bonusStars,
      description: description.trim() || `Reach ${days} consecutive days of good habits!`,
      linked_task_id: linkedTaskId || undefined,
      linked_reward_id: linkedRewardId || undefined,
    };

    if (id) {
      updateStreakMilestone(id, milestoneData);
    } else {
      addStreakMilestone(milestoneData);
    }

    navigate('/parent/loyalty');
  };

  const handleDeleteConfirm = () => {
    if (id) {
      deleteStreakMilestone(id);
    }
    setIsDeleteModalOpen(false);
    navigate('/parent/loyalty');
  };

  const isFormValid = title.trim().length > 0 && days > 0 && bonusStars > 0;
  const linkedTask = tasks.find((t) => t.id === linkedTaskId);
  const linkedReward = rewards.find((r) => r.id === linkedRewardId);

  return (
    <div className="flex flex-col gap-6 pb-24 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/parent/loyalty')}
            className="btn btn-circle btn-ghost btn-sm text-neutral/70"
            aria-label="Go back"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-neutral">
              {id ? 'Edit Streak Milestone' : 'New Streak Milestone'}
            </h2>
            <p className="text-xs text-neutral/50 font-medium">
              Set consecutive day goals and star rewards for your child
            </p>
          </div>
        </div>

        {id && (
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="btn btn-sm btn-ghost text-error hover:bg-error/10 rounded-xl inline-flex items-center gap-1.5"
            title="Delete milestone"
          >
            <FaTrash className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-bold">Delete</span>
          </button>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* 1. Quick Template Selector (In-App Dropdown) */}
        {!id && (
          <div className="card bg-base-100 border border-base-200 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
            <div>
              <span className="label-text font-bold text-neutral/80 block">
                Start from Template (Optional)
              </span>
              <span className="text-xs text-neutral/50">
                Quickly populate with popular habit streak benchmarks
              </span>
            </div>

            <div className="relative">
              <Listbox value={selectedTemplateId} onChange={handleSelectTemplate}>
                <div className="relative">
                  <ListboxButton className="relative w-full cursor-pointer rounded-xl bg-base-100 py-3 pl-4 pr-10 text-left border border-base-300 focus:outline-none focus-visible:border-emerald-600 sm:text-sm text-sm font-semibold text-neutral shadow-xs">
                    <span className="flex items-center gap-2">
                      <FaTrophy className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span className="block truncate">
                        {STREAK_TEMPLATES.find((t) => t.id === selectedTemplateId)?.title ||
                          'Choose a pre-made template...'}
                      </span>
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <FaChevronDown className="h-3 w-3 text-neutral/40" />
                    </span>
                  </ListboxButton>
                  <ListboxOptions
                    modal={false}
                    className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1.5 text-sm shadow-xl ring-1 ring-black/5 focus:outline-none z-50 border border-base-200"
                  >
                    {STREAK_TEMPLATES.map((tmpl) => (
                      <ListboxOption
                        key={tmpl.id}
                        value={tmpl.id}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2.5 pl-10 pr-4 ${
                            active ? 'bg-emerald-50 text-emerald-900' : 'text-neutral'
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <div className="flex flex-col">
                              <span
                                className={`text-xs font-bold ${
                                  selected ? 'text-emerald-700' : 'text-neutral'
                                }`}
                              >
                                {tmpl.title}
                              </span>
                              <span className="text-[11px] text-neutral/50 font-medium">
                                {tmpl.subtitle}
                              </span>
                            </div>
                            {selected && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-600">
                                <FaCheck className="h-3.5 w-3.5" />
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
          </div>
        )}

        {/* 2. Milestone Title */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold text-neutral/80">Milestone Title</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. WEEKLY WARRIOR (7-DAY STREAK)"
            className="input input-bordered w-full rounded-2xl text-base font-bold text-neutral focus:border-emerald-600 focus:outline-none"
            required
          />
        </div>

        {/* 3. Target Streak Days (Dropdown + Stepper) */}
        <div className="card bg-base-100 border border-base-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <div>
            <span className="label-text font-bold text-neutral/80 block">
              Target Streak Days
            </span>
            <span className="text-xs text-neutral/50">
              Consecutive days required to unlock this milestone
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* In-app Dropdown Preset */}
            <div className="flex-1 relative">
              <Listbox value={days} onChange={setDays}>
                <div className="relative">
                  <ListboxButton className="relative w-full cursor-pointer rounded-xl bg-base-100 py-2.5 pl-3.5 pr-10 text-left border border-base-300 focus:outline-none focus-visible:border-emerald-600 sm:text-sm text-sm font-semibold text-neutral">
                    <span className="block truncate">
                      {DAY_OPTIONS.find((o) => o.value === days)?.label || `${days} Days (Custom)`}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <FaChevronDown className="h-3 w-3 text-neutral/40" />
                    </span>
                  </ListboxButton>
                  <ListboxOptions
                    modal={false}
                    className="absolute mt-1 max-h-56 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-xl ring-1 ring-black/5 focus:outline-none z-50 border border-base-200"
                  >
                    {DAY_OPTIONS.map((opt) => (
                      <ListboxOption
                        key={opt.value}
                        value={opt.value}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 pl-9 pr-4 text-xs font-semibold ${
                            active ? 'bg-emerald-50 text-emerald-800' : 'text-neutral'
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? 'font-bold text-emerald-700' : ''
                              }`}
                            >
                              {opt.label}
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-emerald-600">
                                <FaCheck className="h-3 w-3" />
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

            {/* Stepper & Number input */}
            <div className="flex items-center justify-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => handleDaysChange(-1)}
                disabled={days <= 1}
                className="btn btn-circle btn-sm btn-outline border-base-300 text-neutral hover:bg-base-200 disabled:opacity-30"
                aria-label="Decrease days"
              >
                <Minus size={14} weight="bold" />
              </button>
              <input
                type="number"
                min="1"
                max="999"
                value={days}
                onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="input input-sm input-bordered w-16 text-center text-base font-black text-emerald-700 rounded-xl focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleDaysChange(1)}
                className="btn btn-circle btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                aria-label="Increase days"
              >
                <Plus size={14} weight="bold" />
              </button>
            </div>
          </div>
        </div>

        {/* 4. Bonus Reward Stars (Dropdown + Stepper) */}
        <div className="card bg-base-100 border border-base-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <div>
            <span className="label-text font-bold text-neutral/80 block">
              Bonus Reward Stars
            </span>
            <span className="text-xs text-neutral/50">
              Number of Stars awarded upon reaching this streak
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* In-app Dropdown Preset */}
            <div className="flex-1 relative">
              <Listbox value={bonusStars} onChange={setBonusStars}>
                <div className="relative">
                  <ListboxButton className="relative w-full cursor-pointer rounded-xl bg-base-100 py-2.5 pl-3.5 pr-10 text-left border border-base-300 focus:outline-none focus-visible:border-amber-500 sm:text-sm text-sm font-semibold text-neutral">
                    <span className="block truncate">
                      {STAR_OPTIONS.find((o) => o.value === bonusStars)?.label ||
                        `+${bonusStars} Stars (Custom)`}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <FaChevronDown className="h-3 w-3 text-neutral/40" />
                    </span>
                  </ListboxButton>
                  <ListboxOptions
                    modal={false}
                    className="absolute mt-1 max-h-56 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-xl ring-1 ring-black/5 focus:outline-none z-50 border border-base-200"
                  >
                    {STAR_OPTIONS.map((opt) => (
                      <ListboxOption
                        key={opt.value}
                        value={opt.value}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 pl-9 pr-4 text-xs font-semibold ${
                            active ? 'bg-amber-50 text-amber-900' : 'text-neutral'
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? 'font-bold text-amber-700' : ''
                              }`}
                            >
                              {opt.label}
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-amber-600">
                                <FaCheck className="h-3 w-3" />
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

            {/* Stepper & Number input */}
            <div className="flex items-center justify-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => handleStarsChange(-1)}
                disabled={bonusStars <= 1}
                className="btn btn-circle btn-sm btn-outline border-base-300 text-neutral hover:bg-base-200 disabled:opacity-30"
                aria-label="Decrease stars"
              >
                <Minus size={14} weight="bold" />
              </button>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="9999"
                  value={bonusStars}
                  onChange={(e) => setBonusStars(Math.max(1, parseInt(e.target.value) || 1))}
                  className="input input-sm input-bordered w-16 text-center text-base font-black text-amber-600 rounded-xl focus:outline-none"
                />
                <FaStar className="w-3.5 h-3.5 text-warning fill-current" />
              </div>
              <button
                type="button"
                onClick={() => handleStarsChange(1)}
                className="btn btn-circle btn-sm bg-amber-500 hover:bg-amber-600 text-white border-none"
                aria-label="Increase stars"
              >
                <Plus size={14} weight="bold" />
              </button>
            </div>
          </div>
        </div>

        {/* 5. Target Misi (Mission Source) */}
        <div className="card bg-base-100 border border-base-200 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
          <div>
            <span className="label-text font-bold text-neutral/80 block">
              Target Misi (Mission Source)
            </span>
            <span className="text-xs text-neutral/50">
              Pilih apakah streak dihitung dari semua misi atau misi tertentu saja
            </span>
          </div>

          <div className="relative">
            <Listbox value={linkedTaskId} onChange={setLinkedTaskId}>
              <div className="relative">
                <ListboxButton className="relative w-full cursor-pointer rounded-xl bg-base-100 py-3 pl-4 pr-10 text-left border border-base-300 focus:outline-none focus-visible:border-emerald-600 sm:text-sm text-sm font-semibold text-neutral shadow-xs">
                  <span className="flex items-center gap-2">
                    <ClipboardText className="w-4 h-4 text-sky-600 flex-shrink-0" weight="bold" />
                    <span className="block truncate">
                      {linkedTask ? `${linkedTask.icon || '📋'} ${linkedTask.name}` : '⭐ Semua Misi (Global Streak)'}
                    </span>
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <FaChevronDown className="h-3 w-3 text-neutral/40" />
                  </span>
                </ListboxButton>
                <ListboxOptions
                  modal={false}
                  className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1.5 text-sm shadow-xl ring-1 ring-black/5 focus:outline-none z-50 border border-base-200"
                >
                  {/* Global Option */}
                  <ListboxOption
                    value=""
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2.5 pl-10 pr-4 ${
                        active ? 'bg-sky-50 text-sky-900' : 'text-neutral'
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <div className="flex flex-col">
                          <span
                            className={`text-xs font-bold ${
                              selected ? 'text-sky-700' : 'text-neutral'
                            }`}
                          >
                            ⭐ Semua Misi (Global Streak)
                          </span>
                          <span className="text-[11px] text-neutral/50 font-medium">
                            Akumulasi streak umum anak dari semua misi aktif
                          </span>
                        </div>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-600">
                            <FaCheck className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </>
                    )}
                  </ListboxOption>

                  {/* Specific Tasks */}
                  {tasks.map((task) => (
                    <ListboxOption
                      key={task.id}
                      value={task.id}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2.5 pl-10 pr-4 ${
                          active ? 'bg-sky-50 text-sky-900' : 'text-neutral'
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <div className="flex flex-col">
                            <span
                              className={`text-xs font-bold ${
                                selected ? 'text-sky-700' : 'text-neutral'
                              }`}
                            >
                              {task.icon || '📋'} {task.name}
                            </span>
                            <span className="text-[11px] text-neutral/50 font-medium">
                              +{task.reward_value} Stars • {task.type === 'RECURRING' ? 'Misi Rutin' : 'Misi Sekali'}
                            </span>
                          </div>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-600">
                              <FaCheck className="h-3.5 w-3.5" />
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
        </div>

        {/* 6. Hadiah Spesial (Linked Reward) */}
        <div className="card bg-base-100 border border-base-200 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
          <div>
            <span className="label-text font-bold text-neutral/80 block">
              Hadiah Spesial (Linked Reward)
            </span>
            <span className="text-xs text-neutral/50">
              Berikan item hadiah langsung gratis saat anak mencapai milestone ini (Opsional)
            </span>
          </div>

          <div className="relative">
            <Listbox value={linkedRewardId} onChange={setLinkedRewardId}>
              <div className="relative">
                <ListboxButton className="relative w-full cursor-pointer rounded-xl bg-base-100 py-3 pl-4 pr-10 text-left border border-base-300 focus:outline-none focus-visible:border-amber-500 sm:text-sm text-sm font-semibold text-neutral shadow-xs">
                  <span className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-500 flex-shrink-0" weight="bold" />
                    <span className="block truncate">
                      {linkedReward ? `${linkedReward.icon || '🎁'} ${linkedReward.name}` : '⭐ Bintang Saja (Tanpa Hadiah Fisik)'}
                    </span>
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <FaChevronDown className="h-3 w-3 text-neutral/40" />
                  </span>
                </ListboxButton>
                <ListboxOptions
                  modal={false}
                  className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1.5 text-sm shadow-xl ring-1 ring-black/5 focus:outline-none z-50 border border-base-200"
                >
                  {/* Stars Only Option */}
                  <ListboxOption
                    value=""
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2.5 pl-10 pr-4 ${
                        active ? 'bg-amber-50 text-amber-900' : 'text-neutral'
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <div className="flex flex-col">
                          <span
                            className={`text-xs font-bold ${
                              selected ? 'text-amber-700' : 'text-neutral'
                            }`}
                          >
                            ⭐ Bintang Saja
                          </span>
                          <span className="text-[11px] text-neutral/50 font-medium">
                            Hanya memberikan bonus bintang yang ditentukan di atas
                          </span>
                        </div>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                            <FaCheck className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </>
                    )}
                  </ListboxOption>

                  {/* Specific Rewards */}
                  {rewards.map((reward) => (
                    <ListboxOption
                      key={reward.id}
                      value={reward.id}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2.5 pl-10 pr-4 ${
                          active ? 'bg-amber-50 text-amber-900' : 'text-neutral'
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <div className="flex flex-col">
                            <span
                              className={`text-xs font-bold ${
                                selected ? 'text-amber-700' : 'text-neutral'
                              }`}
                            >
                              {reward.icon || '🎁'} {reward.name}
                            </span>
                            <span className="text-[11px] text-neutral/50 font-medium">
                              Biaya katalog: {reward.cost_value} Stars • Dibuka gratis saat streak
                            </span>
                          </div>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                              <FaCheck className="h-3.5 w-3.5" />
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
        </div>

        {/* 7. Description */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold text-neutral/80">
              Description / Motivation Message
            </span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Maintain your momentum for a full week straight. Every single day counts!"
            rows={3}
            className="textarea textarea-bordered rounded-2xl text-sm text-neutral focus:border-emerald-600 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/parent/loyalty')}
            className="btn btn-ghost flex-1 rounded-2xl font-bold text-neutral/70"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid}
            className="btn bg-emerald-600 hover:bg-emerald-700 text-white flex-1 rounded-2xl font-bold shadow-md border-none text-base inline-flex items-center gap-2 disabled:bg-base-300 disabled:text-neutral/40"
          >
            <Check size={20} weight="bold" />
            <span>{id ? 'Update Milestone' : 'Save Milestone'}</span>
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={isDeleteModalOpen}
        title="Delete Streak Milestone"
        message={`Are you sure you want to delete the "${title}" milestone?`}
        confirmText="Delete"
        type="danger"
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default AdminStreakForm;
