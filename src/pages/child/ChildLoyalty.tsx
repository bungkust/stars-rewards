import { useState } from 'react';
import { Question, Trophy, Rocket, Star } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';
import { calcTotalEarnedStars } from '../../utils/loyaltyTierUtils';
import LoyaltyTierCarousel from '../../components/child/LoyaltyTierCarousel';
import LoyaltyStreakMilestones from '../../components/child/LoyaltyStreakMilestones';

const ChildLoyalty = () => {
  const { activeChildId, children } = useAppStore();
  const child = children.find((c) => c.id === activeChildId);

  const childName = child?.name || 'Kiano';
  const childBalance = child?.current_balance ?? 0;
  const lifetimeStars = calcTotalEarnedStars(child);

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header (Consistent with My Missions / Rewards Shop) */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral">Cosmic Card</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-warning/20 border border-warning/30 px-3 py-1 rounded-full text-xs font-bold text-neutral">
            <Star size={16} weight="fill" className="text-warning" />
            <span>{childBalance}</span>
          </div>
          <button
            onClick={() => setIsHelpOpen(true)}
            className="btn btn-circle btn-ghost btn-sm text-neutral/60 hover:text-neutral"
            aria-label="About Cosmic Card"
          >
            <Question size={22} weight="bold" />
          </button>
        </div>
      </div>

      {/* 2. Swipable Cosmic Card Carousel */}
      <LoyaltyTierCarousel
        childName={childName}
        lifetimeStars={lifetimeStars}
      />

      {/* 3. Streak Milestones List with Relational Badges & Claim Flow */}
      <LoyaltyStreakMilestones />

      {/* 4. Help Modal: About Cosmic Card & Streaks */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-base-100 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative flex flex-col gap-4 border border-base-200">
            <button
              onClick={() => setIsHelpOpen(false)}
              className="absolute top-4 right-4 btn btn-circle btn-sm btn-ghost text-neutral/60"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 text-primary">
              <Trophy size={28} weight="fill" />
              <h3 className="text-lg font-bold text-neutral">Tentang Kartu Kosmos</h3>
            </div>

            <div className="text-xs text-neutral/80 flex flex-col gap-3 leading-relaxed">
              <p>
                <span className="inline-flex items-center gap-1 font-bold text-neutral">
                  <Rocket size={15} weight="fill" className="text-primary" />
                  <span>Apa itu Kartu Kosmos?</span>
                </span>
                <br />
                Kartu Kosmos menunjukkan tingkat kehormatan dan kebiasaan hebatmu! Levelmu ditentukan oleh total seluruh bintang yang pernah kamu raih seumur hidup.
              </p>
              <p>
                <span className="inline-flex items-center gap-1 font-bold text-neutral">
                  <Star size={15} weight="fill" className="text-warning" />
                  <span>Apakah level Kartu Kosmos bisa turun?</span>
                </span>
                <br />
                Tidak akan pernah! Menukarkan bintang di Toko Hadiah tidak akan menurunkan level kartu kosmosmu. Seluruh bintang yang pernah kamu dapatkan dicatat selamanya.
              </p>
              <p>
                <span className="inline-flex items-center gap-1 font-bold text-neutral">
                  <Trophy size={15} weight="fill" className="text-warning" />
                  <span>Bagaimana cara klaim hadiah streak?</span>
                </span>
                <br />
                Selesaikan misimu setiap hari tanpa bolong. Saat mencapai 3, 7, 14, 30, atau 100 hari, tombol Klaim akan terbuka untuk memberikan bonus bintang dan hadiah spesial!
              </p>
            </div>

            <button
              onClick={() => setIsHelpOpen(false)}
              className="btn btn-primary text-white rounded-2xl w-full mt-2 font-bold shadow-md"
            >
              Siap, Mengerti! 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildLoyalty;
