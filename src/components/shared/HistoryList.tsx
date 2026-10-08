import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaGift, FaSlidersH, FaTimesCircle, FaChild, FaExclamationTriangle } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { AdminEntityCard } from '../design-system';

export type HistoryItemType = 'verified' | 'redeemed' | 'manual' | 'failed' | 'excused' | 'rejected';

export interface HistoryItemEntry {
    id: string;
    type: HistoryItemType;
    title: string;
    subtitle: string;
    description?: string;
    amount?: number; // If present, shows +amount or -amount
    amountLabel?: string; // fallback if amount is 0/undefined (e.g. "FAILED")
    status: 'success' | 'warning' | 'error' | 'neutral'; // determines amount color
    onClick?: () => void;
    // Metadata for detailed view
    categoryName?: string;
    notes?: string;
    rejectionReason?: string;
    targetValue?: number;
    currentValue?: number;
    unit?: string;
    childName?: string;
    dateLabel?: string;
    childId?: string;
    taskId?: string;
    referenceId?: string;
}

interface HistoryListProps {
    items: HistoryItemEntry[];
    emptyMessage?: string;
    footer?: React.ReactNode;
    variant?: 'parent' | 'child';
}

const TYPE_META: Record<HistoryItemType, { Icon: IconType; color: string }> = {
    verified: { Icon: FaCheckCircle, color: 'text-success' },
    redeemed: { Icon: FaGift, color: 'text-warning' },
    manual: { Icon: FaSlidersH, color: 'text-info' },
    failed: { Icon: FaTimesCircle, color: 'text-neutral/60' },
    excused: { Icon: FaChild, color: 'text-warning' },
    rejected: { Icon: FaExclamationTriangle, color: 'text-error' },
};

const AMOUNT_COLORS: Record<HistoryItemEntry['status'], string> = {
    success: 'text-success',
    error: 'text-error',
    warning: 'text-warning',
    neutral: 'text-neutral/60',
};

const HistoryList = ({ items, emptyMessage = "No history found.", footer, variant = 'child' }: HistoryListProps) => {
    return (
        <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
                {items.map((item) => {
                    const { Icon, color: iconColor } = TYPE_META[item.type];
                    const amountColor = AMOUNT_COLORS[item.status];
                    const amountText = item.amount
                        ? `${item.amount > 0 ? '+' : ''}${item.amount}`
                        : (item.amountLabel || '-');

                    return (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <AdminEntityCard
                                variant={variant}
                                titleMaxLines={2}
                                badge={<Icon className={`w-5 h-5 ${iconColor}`} />}
                                title={item.title}
                                description={item.subtitle}
                                tags={
                                    <>
                                        {item.description && (
                                            <span className="text-xs text-neutral/50 italic">{item.description}</span>
                                        )}
                                        <span className={`font-bold ${amountColor} text-sm whitespace-nowrap`}>
                                            {amountText}
                                        </span>
                                    </>
                                }
                                onClick={item.onClick}
                            />
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {items.length === 0 && (
                <div className="text-center py-8 text-neutral/40 bg-base-100 rounded-xl border border-base-200 border-dashed">
                    {emptyMessage}
                </div>
            )}

            {footer && (
                <div className="mt-2">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default HistoryList;
