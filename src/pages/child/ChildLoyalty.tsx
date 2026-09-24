import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Question, Trophy, Rocket, Star, CaretRight } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';
import { calcTotalEarnedStars } from '../../utils/loyaltyTierUtils';
import LoyaltyTierCarousel from '../../components/child/LoyaltyTierCarousel';
import LoyaltyStreakMilestones from '../../components/child/LoyaltyStreakMilestones';

const ChildLoyalty = () => {
  const navigate = useNavigate();
  const { activeChildId, children, setActiveChild } = useAppStore();
  const child = children.find((c) => c.id === activeChildId);

  const childName = child?.name || 'Anak';
  const childBalance = child?.current_balance ?? 0;
  const lifetimeStars = calcTotalEarnedStars(child);

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral">Ranger Card</h2>
        <button
          onClick={() => setIsHelpOpen(true)}
          className="btn btn-circle btn-ghost btn-sm text-neutral/60 hover:text-neutral"
              aria-label="About Ranger Card"
        >
          <Question size={22} weight="bold" />
        </button>
      </div>

      {/* Multi-Child Selector Chips (Shown if user has 2 or more children) */}
      {children.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mt-2">
          {children.map((c) => {
            const isActive = c.id === activeChildId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveChild(c.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-primary text-white shadow-sm ring-2 ring-primary/30'
                    : 'bg-base-200/90 text-neutral/70 hover:bg-base-300'
                }`}
              >
                <div className="w-5 h-5 rounded-full overflow-hidden border border-white/60 flex-shrink-0">
                  <img
                    src={c.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`}
                    alt={c.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      )}

              {/* 2. Ranger Card for Active Child */}
      <LoyaltyTierCarousel
        childName={childName}
        lifetimeStars={lifetimeStars}
      />

      {/* 3. My Stars Section */}
      <div className="flex flex-col gap-2.5">
        <div className="px-1">
          <h3 className="text-lg font-bold text-neutral">My Stars</h3>
        </div>

        <div
          onClick={() => navigate('/child/history')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/child/history')}
          className="bg-base-100 border border-base-200/90 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-xs flex-shrink-0">
              <Star size={26} weight="fill" className="text-warning drop-shadow-xs" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral/60">
                Current Stars
              </div>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-black text-neutral">
                  {childBalance}
                </span>
                <span className="text-xs font-bold text-amber-600">
                  Stars
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/child/history');
            }}
            className="w-10 h-10 rounded-2xl bg-base-200/80 hover:bg-primary hover:text-white text-neutral/70 flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Open star history"
          >
            <CaretRight size={20} weight="bold" />
          </button>
        </div>
      </div>

      {/* 4. Streak Milestones List with Relational Badges & Claim Flow */}
      <LoyaltyStreakMilestones />

      {/* 5. Help Modal: About Ranger Card & Streaks */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-base-100 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative flex flex-col gap-4 border border-base-200 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setIsHelpOpen(false)}
              className="absolute top-4 right-4 btn btn-circle btn-sm btn-ghost text-neutral/60"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 text-primary">
              <Trophy size={28} weight="fill" />
              <h3 className="text-lg font-bold text-neutral">About Ranger Card</h3>
            </div>

            <div className="text-xs text-neutral/80 flex flex-col gap-3 leading-relaxed">
              <p>
                <span className="inline-flex items-center gap-1 font-bold text-neutral">
                  <Rocket size={15} weight="fill" className="text-primary" />
                  <span>What is Ranger Card?</span>
                </span>
                <br />
                Ranger Card shows your power level and great habits! Your Ranger level is determined by the total stars you've ever earned in your lifetime.
              </p>

              <p>
                <span className="inline-flex items-center gap-1 font-bold text-neutral">
                  <Star size={15} weight="fill" className="text-warning" />
                  <span>Will the Ranger level ever go down?</span>
                </span>
                <br />
                Never! Redeeming stars in the Reward Shop won't lower your Ranger level. All stars you've ever earned are recorded permanently.
              </p>
              <p>
                <span className="inline-flex items-center gap-1 font-bold text-neutral">
                  <Trophy size={15} weight="fill" className="text-warning" />
                  <span>How do I claim streak rewards?</span>
                </span>
                <br />
                Complete your daily missions without missing a day. When you reach 3, 7, 14, 30, or 100 days, the Claim button will open to give you bonus stars and special rewards!
              </p>
            </div>

            <button
              onClick={() => setIsHelpOpen(false)}
              className="btn btn-primary text-white rounded-2xl w-full mt-2 font-bold shadow-md"
            >
              Ready, Got it! ⚡
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildLoyalty;
