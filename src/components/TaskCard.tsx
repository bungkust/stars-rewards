import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { FaBolt, FaRedo, FaCalendarWeek, FaCalendarAlt, FaClock, FaStar, FaArrowRight } from 'react-icons/fa';
import type { Task } from '../types';

interface TaskCardProps {
    task: Task;
    onComplete: (taskId: string) => void;
    onException: (taskId: string) => void;
    isPending?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onException, isPending }) => {
    const x = useMotionValue(0);
    const opacity = useTransform(x, [0, 100], [0, 1]);
    const scale = useTransform(x, [0, 100], [0.8, 1]);



    const getBadgeStyle = (rule: string) => {
        switch (rule) {
            case 'Once': return 'bg-amber-100 text-amber-800';
            case 'Daily': return 'bg-blue-100 text-blue-800';
            case 'Weekly': return 'bg-purple-100 text-purple-800';
            case 'Monthly': return 'bg-rose-100 text-rose-800';
            default: return 'bg-indigo-100 text-indigo-800';
        }
    };

    const getIcon = (rule?: string) => {
        switch (rule) {
            case 'Once': return <FaBolt className="w-6 h-6" />;
            case 'Daily': return <FaRedo className="w-6 h-6" />;
            case 'Weekly': return <FaCalendarWeek className="w-6 h-6" />;
            case 'Monthly': return <FaCalendarAlt className="w-6 h-6" />;
            default: return <FaClock className="w-6 h-6" />;
        }
    };

    const getRecurrenceLabel = (rule: string) => {
        switch (rule) {
            case 'Once':
            case 'Daily':
            case 'Weekly':
            case 'Monthly':
                return rule;
            default:
                return 'Custom';
        }
    };

    return (
        <div className="relative mb-4">
            {/* Background Layer for Swipe Action */}
            <div className="absolute inset-0 bg-orange-100 rounded-xl flex items-center justify-start px-6">
                <motion.div style={{ opacity, scale }} className="flex items-center gap-2 text-orange-600 font-bold">
                    <FaArrowRight />
                    <span>Request Exception</span>
                </motion.div>
            </div>

            {/* Foreground Card */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 80 }}
                dragSnapToOrigin
                dragElastic={{ right: 0.5, left: 0 }}
                onDragEnd={(_e, info) => {
                    if (info.offset.x > 60) {
                        onException(task.id);
                    }
                }}
                style={{ x, touchAction: 'none' }}
                className="relative bg-white shadow-sm rounded-xl p-4 flex flex-row items-center gap-4 z-10"
                whileTap={{ cursor: 'grabbing' }}
            >
                <div className="bg-blue-50 p-3 rounded-full text-primary">
                    {getIcon(task.recurrence_rule)}
                </div>

                <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{task.name}</h3>
                    <div className="flex gap-4 text-sm text-gray-500">
                        {task.reward_value > 0 && (
                            <span className="flex items-center gap-1 text-warning font-bold">
                                <FaStar /> {task.reward_value}
                            </span>
                        )}
                        {task.recurrence_rule && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeStyle(task.recurrence_rule)}`}>
                                {getRecurrenceLabel(task.recurrence_rule)}
                            </span>
                        )}
                    </div>
                </div>

                <button
                    className={`btn btn-sm ${isPending ? 'btn-disabled bg-gray-100 text-gray-400' : 'btn-primary'}`}
                    onClick={() => !isPending && onComplete(task.id)}
                    disabled={isPending}
                >
                    {isPending ? 'Verifying ⏳' : 'Done'}
                </button>
            </motion.div>
        </div>
    );
};
