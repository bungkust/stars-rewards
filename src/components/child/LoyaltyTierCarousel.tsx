import { useState, useRef } from 'react';
import { FaStar } from 'react-icons/fa';
import { Sparkle } from '@phosphor-icons/react';
import { COSMIC_TIERS, getTierIndex, getTierProgress } from '../../utils/loyaltyTierUtils';

interface LoyaltyTierCarouselProps {
  childName: string;
  childBalance: number;
  lifetimeStars: number;
}

const LoyaltyTierCarousel = ({ childName, childBalance, lifetimeStars }: LoyaltyTierCarouselProps) => {
  const currentTierIndex = getTierIndex(lifetimeStars > 0 ? lifetimeStars : childBalance);
  const [activeCardIndex, setActiveCardIndex] = useState(currentTierIndex);
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
          const { progressPercent, starsNeeded } = getTierProgress(
            lifetimeStars > 0 ? lifetimeStars : childBalance,
            idx
          );

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

      {/* Dash Pill Indicators */}
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
  );
};

export default LoyaltyTierCarousel;
