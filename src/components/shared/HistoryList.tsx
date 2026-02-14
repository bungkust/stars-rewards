import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaGift, FaSlidersH, FaTimesCircle, FaChild, FaExclamationTriangle } from 'react-icons/fa';

export type HistoryItemType = 'verified' | 'redeemed' | 'manual' | 'failed' | 'excused' | 'rejected';

export interface HistoryItemEntry {
    id: string;
    type: HistoryItemType;
    title: string;
    subtitle: string;
    description?: string;
    amount?: number; // If present, shows +amount or -amount
    amountLabel?: string; // fallback if amount is 0/undefined (e.g. "FAILED")
    status: 'success' | 'warning' | 'error' | 'neutral'; // determines color
    onClick?: () => void;
}

interface HistoryListProps {
    items: HistoryItemEntry[];
    emptyMessage?: string;
    footer?: React.ReactNode;
}

const HistoryList = ({ items, emptyMessage = "No history found.", footer }: HistoryListProps) => {
    return (
        <div className="flex flex-col">
            <AnimatePresence mode="popLayout">
                {items.map((item) => {
                    let Icon = FaCheckCircle;
                    let iconBg = 'bg-success/10';
                    let iconColor = 'text-success';

                    switch (item.type) {
                        case 'redeemed':
                            Icon = FaGift;
                            iconBg = 'bg-warning/10';
                            iconColor = 'text-warning';
                            break;
                        case 'manual':
                            Icon = FaSlidersH;
                            iconBg = 'bg-info/10';
                            iconColor = 'text-info';
                            break;
                        case 'failed':
                        case 'rejected':
                            Icon = item.type === 'rejected' ? FaExclamationTriangle : FaTimesCircle;
                            iconBg = 'bg-base-200'; // or error/10
                            iconColor = 'text-neutral/60';
                            if (item.type === 'rejected') iconColor = 'text-error';
                            break;
                        case 'excused':
                            Icon = FaChild;
                            iconBg = 'bg-warning/10';
                            iconColor = 'text-warning';
                            break;
                        default: // verified
                            Icon = FaCheckCircle;
                            iconBg = 'bg-success/10';
                            iconColor = 'text-success';
                            break;
                    }

                    // Override colors based on explicit status prop if needed, 
                    // but usually type drives the icon style, and status drives the amount text color.
                    // Let's stick to the ChildStats styling logic which is quite nice.

                    const amountColor =
                        item.status === 'success' ? 'text-success' :
                            item.status === 'error' ? 'text-error' :
                                item.status === 'warning' ? 'text-warning' :
                                    'text-neutral/60';

                    return (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className={`flex justify-between items-center border-b border-base-200 p-4 last:border-none ${item.onClick ? 'cursor-pointer hover:bg-base-50 transition-colors' : 'hover:bg-base-50/50 transition-colors'}`}
                            onClick={item.onClick}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`p-3 rounded-full ${iconBg} ${iconColor}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="font-bold text-neutral text-sm truncate">{item.title}</span>
                                    <span className="text-xs text-neutral/40">{item.subtitle}</span>
                                    {item.description && (
                                        <span className="text-xs text-neutral/50 italic mt-0.5 truncate">
                                            {item.description}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className={`font-bold ${amountColor} text-right ml-2 text-sm whitespace-nowrap`}>
                                {item.amount !== undefined && item.amount !== 0 ? (
                                    <span>{item.amount > 0 ? '+' : ''}{item.amount}</span>
                                ) : (
                                    <span className="text-xs uppercase">{item.amountLabel || '-'}</span>
                                )}
                            </div>
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
