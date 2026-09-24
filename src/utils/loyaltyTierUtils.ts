import {
  Lightning,
  Shield,
  Sword,
  ShieldStar,
  Crown
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
}

export const COSMIC_TIERS: CosmicTier[] = [
  {
    id: 'green',
    name: 'Ranger Hijau',
    minStars: 0,
    maxStars: 999,
    gradient: 'from-[#064E3B] via-[#047857] to-[#10B981]',
    cardBorder: 'border border-emerald-400/40 shadow-[0_8px_30px_rgba(16,185,129,0.35)]',
    glowColor: 'bg-emerald-400/25',
    icon: Lightning,
    iconColor: 'text-emerald-100',
    iconBg: 'bg-emerald-500/25',
    nextTier: 'Ranger Biru'
  },
  {
    id: 'blue',
    name: 'Ranger Biru',
    minStars: 1000,
    maxStars: 2499,
    gradient: 'from-[#0F172A] via-[#1E3A8A] to-[#2563EB]',
    cardBorder: 'border border-blue-400/40 shadow-[0_8px_30px_rgba(37,99,235,0.35)]',
    glowColor: 'bg-blue-500/25',
    icon: Shield,
    iconColor: 'text-sky-200',
    iconBg: 'bg-blue-500/25',
    nextTier: 'Ranger Hitam'
  },
  {
    id: 'black',
    name: 'Ranger Hitam',
    minStars: 2500,
    maxStars: 4999,
    gradient: 'from-[#09090B] via-[#18181B] to-[#3F3F46]',
    cardBorder: 'border border-zinc-400/40 shadow-[0_8px_30px_rgba(113,113,122,0.35)]',
    glowColor: 'bg-slate-300/20',
    icon: Sword,
    iconColor: 'text-zinc-100',
    iconBg: 'bg-zinc-700/50',
    nextTier: 'Ranger Emas'
  },
  {
    id: 'gold',
    name: 'Ranger Emas',
    minStars: 5000,
    maxStars: 9999,
    gradient: 'from-[#78350F] via-[#B45309] to-[#F59E0B]',
    cardBorder: 'border border-amber-300/50 shadow-[0_8px_30px_rgba(245,158,11,0.45)]',
    glowColor: 'bg-amber-400/35',
    icon: ShieldStar,
    iconColor: 'text-amber-100',
    iconBg: 'bg-amber-400/25',
    nextTier: 'Ranger Merah'
  },
  {
    id: 'red',
    name: 'Ranger Merah',
    minStars: 10000,
    maxStars: null,
    gradient: 'from-[#7F1D1D] via-[#B91C1C] to-[#EF4444]',
    cardBorder: 'border-2 border-red-400 shadow-[0_0_35px_rgba(239,68,68,0.55)]',
    glowColor: 'bg-red-500/40',
    icon: Crown,
    iconColor: 'text-red-100',
    iconBg: 'bg-red-500/30',
    nextTier: null
  }
];

import type { StreakMilestone, Child, Task, CoinTransaction } from '../types';
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
  if (stars >= 10000) return 4;
  if (stars >= 5000) return 3;
  if (stars >= 2500) return 2;
  if (stars >= 1000) return 1;
  return 0;
}

/**
 * Calculate progress percentage and remaining stars needed for a tier
 */
export function getTierProgress(stars: number, tierIndex: number) {
  const tier = COSMIC_TIERS[tierIndex] || COSMIC_TIERS[0];
  const nextTier = COSMIC_TIERS[tierIndex + 1];
  let progressPercent = 0;
  let starsNeeded = 0;

  if (nextTier) {
    if (stars >= nextTier.minStars) {
      progressPercent = 100;
      starsNeeded = 0;
    } else if (stars >= tier.minStars) {
      const earnedInTier = stars - tier.minStars;
      const totalInTier = nextTier.minStars - tier.minStars;
      progressPercent = Math.min(Math.round((earnedInTier / totalInTier) * 100), 100);
      starsNeeded = nextTier.minStars - stars;
    } else {
      progressPercent = 0;
      starsNeeded = tier.minStars - stars;
    }
  } else {
    progressPercent = 100;
    starsNeeded = 0;
  }

  return { progressPercent, starsNeeded };
}

/**
 * Calculate total stars earned by a child in the Cosmic Card loyalty program.
 * In v1.4.0, progress starts from 0 for all users so children embark on a fresh cosmic journey.
 * Uses child.loyalty_stars if present, defaulting to 0.
 */
export function calcTotalEarnedStars(child?: Child | null): number {
  return Math.max(0, child?.loyalty_stars ?? 0);
}

/**
 * Get the effective streak count for a child or linked task.
 * 1. If linkedTaskId is provided: uses that task's current_streak.
 * 2. If parent has explicitly set child.current_streak (> 0): uses that.
 * 3. Fallback: calculates the maximum current_streak across all assigned active tasks.
 */
export function getChildStreak(child?: Child | null, tasks: Task[] = [], linkedTaskId?: string | null): number {
  if (linkedTaskId) {
    const linkedTask = tasks.find(t => t.id === linkedTaskId);
    return linkedTask?.current_streak ?? 0;
  }

  if (child?.current_streak != null && child.current_streak > 0) {
    return child.current_streak;
  }

  if (!child) return 0;

  const childTasks = tasks.filter(t => t.is_active !== false && (!t.assigned_to?.length || t.assigned_to.includes(child.id)));
  if (childTasks.length === 0) return 0;

  return Math.max(0, ...childTasks.map(t => t.current_streak || 0));
}

/**
 * Check if a streak milestone has already been claimed by the child.
 */
export function isMilestoneClaimed(
  child?: Child | null,
  transactions: CoinTransaction[] = [],
  milestone?: StreakMilestone | null
): boolean {
  if (!child || !milestone) return false;

  // 1. Check child's claimed_milestones array (by milestone days or id)
  if (child.claimed_milestones?.includes(milestone.days)) {
    return true;
  }

  // 2. Check transactions history for claim record
  const searchPattern = `Streak ${milestone.days} Hari`;
  return transactions.some(
    t => t.child_id === child.id && t.type === 'MANUAL_ADJ' && (t.description?.includes(searchPattern) || t.reference_id === milestone.id)
  );
}
