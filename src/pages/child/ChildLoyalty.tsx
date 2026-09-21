import { useState, useRef } from 'react';
import { FaStar } from 'react-icons/fa';
import { Question, Trophy, Check, Sparkle, Rocket, Star } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';
import { COSMIC_TIERS, getTierIndex, calcTotalEarnedStars, getChildStreak, isMilestoneClaimed } from '../../utils/loyaltyTierUtils';

const ChildLoyalty = () => {
  const { activeChildId, children, streakMilestones, transactions, tasks } = useAppStore();
  const child = children.find(c => c.id === activeChildId);

  const childName = child?.name || 'Kiano';
  const childBalance = child?.current_balance ?? 102;
  const lifetimeStars = calcTotalEarnedStars(transactions, child?.id || '');
  const childStreak = getChildStreak(child, tasks);
  const bestRecordStreak = child?.best_streak ?? Math.max(childStreak, 9);

  // Determine child's actual current tier index based on lifetime stars
  const currentTierIndex = getTierIndex(lifetimeStars > 0 ? lifetimeStars : childBalance);

  const [activeCardIndex, setActiveCardIndex] = useState(currentTierIndex);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollToCard = (index: number) => {
    setActiveCardIndex(index);
    if (carouselRef.current) {
      const card = carouselRef.current.children[index] as HTMLElement;
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const cardWidth = carouselRef.current.offsetWidth;
      if (cardWidth > 0) {
        const newIndex = Math.round(scrollLeft / cardWidth);
        if (newIndex >= 0 && newIndex < COSMIC_TIERS.length && newIndex !== activeCardIndex) {
          setActiveCardIndex(newIndex);
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header (Consistent with My Missions / Rewards Shop) */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral">Cosmic Card</h2>
        <button
          onClick={() => setIsHelpOpen(true)}
          className="btn btn-circle btn-ghost btn-sm text-neutral/60 hover:text-neutral"
          aria-label="About Cosmic Card"
        >
          <Question size={22} weight="bold" />
        </button>
      </div>

      {/* 2. Swipable Cosmic Card Carousel (All 5 Tiers with Distinct Colors) */}
      <div className="flex flex-col gap-3">
        {/* Horizontal Scroll Container */}
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 pt-1 px-0.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {COSMIC_TIERS.map((tier, idx) => {
            const TierIcon = tier.icon;
            const isCurrentTier = idx === currentTierIndex;
            const isCompletedTier = idx < currentTierIndex;

            // Calculate progress for this card
            let progressPercent = 0;
            let starsNeeded = 0;

            if (tier.nextStars) {
              if (childBalance >= tier.nextStars) {
                progressPercent = 100;
                starsNeeded = 0;
              } else if (childBalance >= tier.minStars) {
                const earnedInTier = childBalance - tier.minStars;
                const totalInTier = tier.nextStars - tier.minStars;
                progressPercent = Math.min(Math.round((earnedInTier / totalInTier) * 100), 100);
                starsNeeded = tier.nextStars - childBalance;
              } else {
                progressPercent = 0;
                starsNeeded = tier.minStars - childBalance;
              }
            } else {
              // Andromeda (Max Tier)
              progressPercent = childBalance >= 1000 ? 100 : Math.min(Math.round((childBalance / 1000) * 100), 99);
            }

            return (
              <div
                key={tier.id}
                className={`min-w-full snap-center rounded-2xl p-6 text-white shadow-lg bg-gradient-to-br ${tier.gradient} relative overflow-hidden flex flex-col justify-between ${tier.cardBorder} min-h-[230px] select-none transition-transform`}
              >
                {/* Background Cosmic Glows */}
                <div
                  className={`absolute top-0 right-0 w-48 h-48 ${tier.glowColor} rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none`}
                />
                <div
                  className="absolute bottom-0 left-0 w-36 h-36 bg-white/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"
                />

                {/* Top Row: Tier Name & Emblem with Stars */}
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-wider uppercase drop-shadow-md text-white font-sans">
                      {tier.name}
                    </h2>
                    {isCurrentTier && (
                      <span className="badge badge-warning text-neutral font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-sm mt-1.5 inline-flex items-center gap-1">
                        <Sparkle size={10} weight="fill" />
                        <span>Current Level</span>
                      </span>
                    )}
                  </div>

                  {/* Top Right: 5 Stars & Tier Crest Emblem */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-0.5 mb-1.5">
                      {[1, 2, 3, 4, 5].map((starIdx) => (
                        <FaStar
                          key={starIdx}
                          className={`w-2.5 h-2.5 ${
                            starIdx <= idx + 1 ? 'text-warning fill-current' : 'text-white/20'
                          }`}
                        />
                      ))}
                    </div>
                    <div
                      className={`w-12 h-12 rounded-2xl backdrop-blur-md ${tier.iconBg} ${tier.iconColor} border border-white/20 shadow-md flex items-center justify-center`}
                    >
                      <TierIcon size={26} weight="fill" />
                    </div>
                  </div>
                </div>

                {/* Middle Left: Child Name & Stars XP Pill */}
                <div className="my-auto py-2 relative z-10">
                  <div className="text-lg font-bold text-white tracking-wide drop-shadow-sm">
                    {childName}
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-bold mt-1.5 border border-white/10 shadow-sm">
                    <FaStar className="w-3.5 h-3.5 text-warning fill-current" />
                    <span>{childBalance} Stars</span>
                  </div>
                </div>

                {/* Bottom Row: Full-width Progress Bar & Requirement Text */}
                <div className="pt-2 relative z-10">
                  {/* Progress bar track with end star badge */}
                  <div className="relative flex items-center mb-2">
                    <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/15">
                      <div
                        className="bg-warning h-full rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    {/* Floating Star badge at the right end */}
                    <div className="absolute right-0 translate-x-1 flex items-center justify-center pointer-events-none">
                      <div className="w-6 h-6 rounded-full bg-warning text-neutral flex items-center justify-center shadow-md ring-2 ring-white/40">
                        <FaStar className="w-3.5 h-3.5 fill-current text-neutral" />
                      </div>
                    </div>
                  </div>

                  {/* Subtitle text below progress bar */}
                  <p className="text-xs text-white/90 font-medium drop-shadow-sm">
                    {tier.nextTier ? (
                      isCompletedTier ? (
                        <span>Tier completed! Ready for the next cosmic level.</span>
                      ) : starsNeeded > 0 ? (
                        <>
                          Collect <span className="font-bold text-white">{starsNeeded} more Stars</span> to reach next tier
                        </>
                      ) : (
                        <span>Next tier unlocked!</span>
                      )
                    ) : (
                      <span>Supreme cosmic level! You are an eternal Star Habit legend.</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dash Pill Indicators (Matching reference image) */}
        <div className="flex items-center justify-center gap-2 pt-1">
          {COSMIC_TIERS.map((tier, idx) => (
            <button
              key={tier.id}
              onClick={() => scrollToCard(idx)}
              aria-label={tier.name}
              className={`transition-all duration-300 rounded-full h-1.5 ${
                activeCardIndex === idx
                  ? 'w-9 bg-warning shadow-sm'
                  : 'w-9 bg-base-300 hover:bg-neutral/30 opacity-60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 3. Streak Milestones Section (Matching Mission Cards style) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-lg font-bold text-neutral">
              Champ Streak Milestones
            </h3>
            <p className="text-xs text-neutral/60 font-medium mt-0.5">
              Best Record: <span className="font-bold text-primary">{bestRecordStreak} Days</span> in a row
            </p>
          </div>
        </div>

        {/* List of Milestone Cards (Matching ChildDashboard style) */}
        <div className="flex flex-col gap-3">
          {streakMilestones.map((milestone) => {
            const current = getChildStreak(child, tasks, milestone.linked_task_id);
            const target = milestone.days;
            const isReached = current >= target;
            const remaining = Math.max(0, target - current);
            const isApproved = isMilestoneClaimed(child, transactions, milestone);

            return (
              <div
                key={milestone.id || milestone.days}
                className={`card bg-base-100 shadow-sm rounded-xl p-4 border border-base-200 border-l-4 transition-all ${
                  isApproved ? 'border-l-success' : 'border-l-primary'
                }`}
              >
                {/* Top Row: Icon, Info, and Action */}
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Circular Icon */}
                  <div
                    className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${
                      isApproved
                        ? 'bg-success/10 text-success'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {isApproved ? (
                      <Check size={22} weight="bold" />
                    ) : (
                      <Trophy size={22} weight="fill" />
                    )}
                  </div>

                  {/* Middle: Title & Badges */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-neutral text-base leading-tight break-words">
                      {milestone.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-neutral/50 mt-1">
                      <span className="flex items-center gap-1 text-warning font-bold text-xs">
                        <FaStar className="w-3 h-3" /> {milestone.bonusStars}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium border border-primary/50 text-primary bg-primary/5">
                        {milestone.days} Days
                      </span>
                    </div>
                  </div>

                  {/* Right: Action Button or Approved Badge */}
                  <div className="flex-shrink-0">
                    {isApproved ? (
                      <span className="badge badge-success text-white font-bold px-3 py-3 rounded-full text-xs">
                        Approved
                      </span>
                    ) : isReached ? (
                      <button
                        onClick={() =>
                          alert(
                            `Congratulations! +${milestone.bonusStars} Stars ready to claim in next batch!`
                          )
                        }
                        className="btn btn-sm btn-primary text-white font-bold rounded-full px-4 shadow-sm active:scale-95 transition-transform"
                      >
                        Done
                      </button>
                    ) : (
                      <span className="badge badge-outline border-base-300 text-neutral/50 font-bold px-2.5 py-2.5 rounded-full text-xs">
                        {current}/{target}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Description & Progress Bar */}
                <div className="mt-3 pt-2 border-t border-base-200/60">
                  <p className="text-xs text-neutral/50 line-clamp-2">
                    {milestone.description}
                  </p>
                  <div className="mt-2 w-full bg-base-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        isApproved ? 'bg-success' : 'bg-primary'
                      }`}
                      style={{
                        width: `${Math.min(Math.round((current / target) * 100), 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-neutral/40 mt-1 font-medium">
                    <span>
                      {current} of {target} days
                    </span>
                    <span>
                      {remaining > 0
                        ? `${remaining} days left`
                        : isApproved
                        ? 'Completed'
                        : 'Goal reached!'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Help Modal: About Cosmic Card & Streaks */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-base-100 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative flex flex-col gap-4 border border-base-200">
            <button
              onClick={() => setIsHelpOpen(false)}
              className="absolute top-4 right-4 btn btn-circle btn-sm btn-ghost text-neutral/60"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 text-primary">
              <Trophy size={28} weight="fill" />
              <h3 className="text-lg font-bold text-neutral">About Cosmic Card</h3>
            </div>

            <div className="text-xs text-neutral/80 flex flex-col gap-3 leading-relaxed">
              <p>
                <span className="inline-flex items-center gap-1 font-bold text-neutral">
                  <Rocket size={15} weight="fill" className="text-primary" />
                  <span>What is Cosmic Card?</span>
                </span>
                <br />
                Your Cosmic Card represents your habit honor level! Your tier is determined by all the lifetime stars you've ever earned.
              </p>
              <p>
                <span className="inline-flex items-center gap-1 font-bold text-neutral">
                  <Star size={15} weight="fill" className="text-warning" />
                  <span>Can my Cosmic Card level drop?</span>
                </span>
                <br />
                Never! Spending stars in the Rewards Shop will never reduce your Cosmic Card level. All stars earned are permanently recorded.
              </p>
              <p>
                <span className="inline-flex items-center gap-1 font-bold text-neutral">
                  <Trophy size={15} weight="fill" className="text-warning" />
                  <span>How do I claim streak rewards?</span>
                </span>
                <br />
                Complete your missions daily without missing a day. Once you hit 3, 7, 14, 30, or 100 days, tap Claim to earn free bonus stars!
              </p>
            </div>

            <button
              onClick={() => setIsHelpOpen(false)}
              className="btn btn-primary text-white rounded-xl w-full mt-2 font-bold"
            >
              Got It, Thanks!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildLoyalty;
