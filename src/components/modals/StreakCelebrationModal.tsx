import { useEffect } from 'react';

interface Props {
  milestone: { taskName: string; streak: number } | null;
  onClose: () => void;
}

const MILESTONE_IMAGE: Record<number, string> = {
  3: '/milestones/streak_3.png',
  7: '/milestones/streak_7.png',
  14: '/milestones/streak_14.png',
  30: '/milestones/streak_30.png',
  100: '/milestones/streak_100.png',
};

const MILESTONE_MESSAGE: Record<number, string> = {
  3: 'Streak dimulai!',
  7: 'Seminggu penuh! Luar biasa!',
  14: 'Dua minggu tanpa bolong! Keren!',
  30: 'Satu bulan konsisten! WOW!',
  100: 'LEGENDA! 100 hari streak!',
};

export default function StreakCelebrationModal({ milestone, onClose }: Props) {
  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (!milestone) return;
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [milestone, onClose]);

  if (!milestone) return null;

  const imageSrc = MILESTONE_IMAGE[milestone.streak] ?? '/milestones/streak_3.png';
  const message = MILESTONE_MESSAGE[milestone.streak] ?? `${milestone.streak} hari berturut-turut!`;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-md px-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-4 text-center max-w-xs w-full animate-[bounceIn_0.5s_ease-out] relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-orange-400/20 rounded-full blur-3xl point-events-none"></div>

        {/* Animated image */}
        <div className="relative w-32 h-32 select-none flex items-center justify-center mb-2 z-10 animate-[pulse_2s_ease-in-out_infinite]">
          <img src={imageSrc} alt={`Streak ${milestone.streak}`} className="object-contain w-full h-full drop-shadow-2xl z-10" />
        </div>

        {/* Streak count */}
        <div className="flex items-center gap-2">
          <span className="text-5xl font-extrabold text-orange-500">{milestone.streak}</span>
          <span className="text-2xl font-bold text-orange-400">hari</span>
        </div>

        {/* Task name */}
        <p className="text-base font-semibold text-neutral/80 leading-snug">
          <span className="text-primary">"{milestone.taskName}"</span>
        </p>

        {/* Message */}
        <p className="text-sm text-neutral/60">{message}</p>

        {/* Streak flame row */}
        <div className="flex gap-1 mt-1">
          {Array.from({ length: Math.min(milestone.streak, 7) }).map((_, i) => (
            <span key={i} className="text-lg">🔥</span>
          ))}
          {milestone.streak > 7 && (
            <span className="text-sm font-bold text-orange-500 self-center">+{milestone.streak - 7}</span>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={onClose}
          className="btn btn-primary rounded-full w-full mt-2 font-bold text-white"
        >
          Lanjutkan! 💪
        </button>
      </div>
    </div>
  );
}
