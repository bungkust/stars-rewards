import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { Sparkle, CaretDown, CaretUp } from '@phosphor-icons/react';
import { COSMIC_TIERS, getTierIndex, getTierProgress } from '../../utils/loyaltyTierUtils';

interface LoyaltyTierCarouselProps {
  childName: string;
  lifetimeStars: number;
}

const LoyaltyTierCarousel = ({ childName, lifetimeStars }: LoyaltyTierCarouselProps) => {
  const currentTierIndex = getTierIndex(lifetimeStars);
  const tier = COSMIC_TIERS[currentTierIndex] || COSMIC_TIERS[0];
  const TierIcon = tier.icon;
  const { progressPercent, starsNeeded } = getTierProgress(lifetimeStars, currentTierIndex);
  const [showAllTiers, setShowAllTiers] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {/* 1 Card for the Child */}
      <div
        className={`w-full rounded-2xl p-6 text-white shadow-lg bg-gradient-to-br ${tier.gradient} relative overflow-hidden flex flex-col justify-between ${tier.cardBorder} min-h-[230px] select-none transition-all duration-300`}
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
            <span className="badge badge-warning text-neutral font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-sm mt-1.5 inline-flex items-center gap-1">
              <Sparkle size={10} weight="fill" />
              <span>Level {currentTierIndex + 1}</span>
            </span>
          </div>

          {/* Top Right: 5 Stars & Tier Crest Emblem */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-0.5 mb-1.5">
              {[1, 2, 3, 4, 5].map((starIdx) => (
                <FaStar
                  key={starIdx}
                  className={`w-2.5 h-2.5 ${
                    starIdx <= currentTierIndex + 1 ? 'text-warning fill-current' : 'text-white/20'
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
            <span>{lifetimeStars} Bintang Ranger</span>
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
          <div className="flex items-center justify-between text-xs text-white/90 font-medium drop-shadow-sm">
            <p className="truncate mr-2">
              {tier.nextTier ? (
                starsNeeded > 0 ? (
                  <>
                    Kumpulkan <span className="font-bold text-white">{starsNeeded} Bintang lagi</span> untuk lanjut ke {tier.nextTier}
                  </>
                ) : (
                  <span>Level berikutnya terbuka!</span>
                )
              ) : (
                <span>Tingkat Ranger tertinggi! Pahlawan terkuat Star Habit.</span>
              )}
            </p>
            <span className="font-bold text-warning flex-shrink-0">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Button to toggle "Lihat Semua Tingkat Ranger" */}
      <button
        type="button"
        onClick={() => setShowAllTiers((prev) => !prev)}
        className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-base-200/70 hover:bg-base-200 text-xs font-bold text-neutral/70 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Sparkle size={14} weight="fill" className="text-warning" />
          <span>Lihat Semua Tingkat Ranger (5 Level)</span>
        </span>
        {showAllTiers ? <CaretUp size={14} weight="bold" /> : <CaretDown size={14} weight="bold" />}
      </button>

      {/* Expandable All Tiers Overview */}
      {showAllTiers && (
        <div className="flex flex-col gap-2 p-3 bg-base-200/40 rounded-2xl border border-base-200 animate-fade-in">
          {COSMIC_TIERS.map((t, idx) => {
            const Icon = t.icon;
            const isChildLevel = idx === currentTierIndex;
            return (
              <div
                key={t.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  isChildLevel
                    ? 'bg-base-100 border-primary/40 shadow-xs'
                    : 'bg-transparent border-transparent text-neutral/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.iconBg} ${t.iconColor}`}
                  >
                    <Icon size={16} weight="fill" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={isChildLevel ? 'text-neutral' : 'text-neutral/70'}>
                        {t.name}
                      </span>
                      {isChildLevel && (
                        <span className="badge badge-primary badge-xs text-[9px] px-1.5 py-0.5">
                          Level Kamu
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-neutral/50 font-normal">
                      {t.minStars.toLocaleString()} {t.maxStars ? `- ${t.maxStars.toLocaleString()} Bintang` : '+ Bintang'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FaStar
                      key={s}
                      className={`w-2 h-2 ${
                        s <= idx + 1 ? 'text-warning fill-current' : 'text-neutral/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LoyaltyTierCarousel;
