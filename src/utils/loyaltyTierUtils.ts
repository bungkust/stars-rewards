import {
  Moon,
  Star,
  Sparkle,
  Planet,
  Rocket
} from '@phosphor-icons/react';
import type { ElementType } from 'react';

export interface CosmicTier {
  id: string;
  name: string;
  minStars: number;
  maxStars: number | null;
  gradient: string;
  cardBorder: string;
  glowColor: string;
  icon: ElementType;
  iconColor: string;
  iconBg: string;
  nextTier: string | null;
  nextStars: number | null;
  nextTierIcon: ElementType | null;
  nextIconColor: string;
  quote: string;
}

export const COSMIC_TIERS: CosmicTier[] = [
  {
    id: 'moon',
    name: 'Moon Explorer',
    minStars: 0,
    maxStars: 99,
    gradient: 'from-[#1E293B] via-[#334155] to-[#475569]',
    cardBorder: 'border border-slate-300/40 shadow-[0_8px_30px_rgba(148,163,184,0.35)]',
    glowColor: 'bg-slate-300/25',
    icon: Moon,
    iconColor: 'text-slate-100',
    iconBg: 'bg-slate-400/25',
    nextTier: 'Polaris Star',
    nextStars: 100,
    nextTierIcon: Star,
    nextIconColor: 'text-emerald-300',
    quote: 'Your cosmic journey begins here! Keep completing missions.'
  },
  {
    id: 'polaris',
    name: 'Polaris Star',
    minStars: 100,
    maxStars: 299,
    gradient: 'from-[#064E3B] via-[#047857] to-[#0F766E]',
    cardBorder: 'border border-emerald-400/40 shadow-[0_8px_30px_rgb(4,120,87,0.35)]',
    glowColor: 'bg-emerald-400/25',
    icon: Star,
    iconColor: 'text-emerald-200',
    iconBg: 'bg-emerald-500/25',
    nextTier: 'Sirius Star',
    nextStars: 300,
    nextTierIcon: Sparkle,
    nextIconColor: 'text-amber-300',
    quote: 'The guiding star for young explorers with great habits!'
  },
  {
    id: 'sirius',
    name: 'Sirius Star',
    minStars: 300,
    maxStars: 599,
    gradient: 'from-[#013576] via-[#1D4ED8] to-[#38BDF8]',
    cardBorder: 'border border-sky-400/40 shadow-[0_8px_30px_rgb(29,78,216,0.35)]',
    glowColor: 'bg-sky-400/25',
    icon: Sparkle,
    iconColor: 'text-amber-300',
    iconBg: 'bg-amber-400/20',
    nextTier: 'Orion Nebula',
    nextStars: 600,
    nextTierIcon: Planet,
    nextIconColor: 'text-pink-300',
    quote: 'The brightest star in the sky — shining just like you!'
  },
  {
    id: 'orion',
    name: 'Orion Nebula',
    minStars: 600,
    maxStars: 999,
    gradient: 'from-[#3B0764] via-[#701A75] to-[#BE185D]',
    cardBorder: 'border border-fuchsia-400/40 shadow-[0_8px_30px_rgb(190,24,93,0.35)]',
    glowColor: 'bg-pink-500/25',
    icon: Planet,
    iconColor: 'text-pink-200',
    iconBg: 'bg-pink-500/20',
    nextTier: 'Andromeda Galaxy',
    nextStars: 1000,
    nextTierIcon: Rocket,
    nextIconColor: 'text-amber-300',
    quote: 'A magnificent stellar nursery where champions are born!'
  },
  {
    id: 'andromeda',
    name: 'Andromeda Galaxy',
    minStars: 1000,
    maxStars: null,
    gradient: 'from-[#451A03] via-[#78350F] to-[#D97706]',
    cardBorder: 'border-2 border-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.55)]',
    glowColor: 'bg-amber-400/35',
    icon: Rocket,
    iconColor: 'text-amber-100',
    iconBg: 'bg-amber-400/30',
    nextTier: null,
    nextStars: null,
    nextTierIcon: null,
    nextIconColor: '',
    quote: 'The highest cosmic tier! You are a true Star Habit legend!'
  }
];

import type { StreakMilestone } from '../types';
export type { StreakMilestone };

export const DEFAULT_STREAK_MILESTONES: StreakMilestone[] = [
  {
    id: 'milestone-3',
    days: 3,
    title: 'STARTING SPARK (3-DAY STREAK)',
    description: 'Keep your positive habits going for 3 consecutive days without a break.',
    bonusStars: 5
  },
  {
    id: 'milestone-7',
    days: 7,
    title: 'WEEKLY WARRIOR (7-DAY STREAK)',
    description: 'Maintain your momentum for a full week straight. Every single day counts!',
    bonusStars: 15
  },
  {
    id: 'milestone-14',
    days: 14,
    title: 'TWO-WEEK CHAMPION (14-DAY STREAK)',
    description: 'Show true consistency across two entire weeks without missing any missions.',
    bonusStars: 30
  },
  {
    id: 'milestone-30',
    days: 30,
    title: 'MONTHLY MASTER (30-DAY STREAK)',
    description: 'A stellar whole month of great discipline! You are forming lifelong superpowers.',
    bonusStars: 75
  },
  {
    id: 'milestone-100',
    days: 100,
    title: 'CENTURY LEGEND (100-DAY STREAK)',
    description: '100 days of absolute cosmic greatness. Only true champion habit masters reach here!',
    bonusStars: 250
  }
];

/**
 * Determine cosmic tier index (0 to 4) based on total stars earned
 */
export function getTierIndex(stars: number): number {
  if (stars >= 1000) return 4;
  if (stars >= 600) return 3;
  if (stars >= 300) return 2;
  if (stars >= 100) return 1;
  return 0;
}

/**
 * Calculate progress percentage and remaining stars needed for a tier
 */
export function getTierProgress(stars: number, tierIndex: number) {
  const tier = COSMIC_TIERS[tierIndex];
  let progressPercent = 0;
  let starsNeeded = 0;

  if (tier.nextStars) {
    if (stars >= tier.nextStars) {
      progressPercent = 100;
      starsNeeded = 0;
    } else if (stars >= tier.minStars) {
      const earnedInTier = stars - tier.minStars;
      const totalInTier = tier.nextStars - tier.minStars;
      progressPercent = Math.min(Math.round((earnedInTier / totalInTier) * 100), 100);
      starsNeeded = tier.nextStars - stars;
    } else {
      progressPercent = 0;
      starsNeeded = tier.minStars - stars;
    }
  } else {
    progressPercent = stars >= 1000 ? 100 : Math.min(Math.round((stars / 1000) * 100), 99);
    starsNeeded = 0;
  }

  return { progressPercent, starsNeeded };
}
