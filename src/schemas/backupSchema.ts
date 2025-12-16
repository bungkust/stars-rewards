import { z } from 'zod';

export const childSchema = z.object({
    id: z.string(),
    parent_id: z.string(),
    name: z.string(),
    birth_date: z.string().optional(),
    current_balance: z.number().optional(),
    avatar_url: z.string().optional(),
});

export const taskSchema = z.object({
    id: z.string(),
    parent_id: z.string(),
    name: z.string(),
    reward_value: z.number(),
    type: z.enum(['ONE_TIME', 'RECURRING']).optional(),
    recurrence_rule: z.string().optional(),
    is_active: z.boolean().optional(),
    created_at: z.string().optional(),
    assigned_to: z.array(z.string()).optional(),
    category_id: z.string().optional(),
    expiry_time: z.string().optional(),
    next_due_date: z.string().optional(),
});

export const rewardSchema = z.object({
    id: z.string(),
    parent_id: z.string(),
    name: z.string(),
    cost_value: z.number(),
    category: z.string().optional(),
    type: z.enum(['ONE_TIME', 'UNLIMITED', 'ACCUMULATIVE']).optional(),
    required_task_id: z.string().optional(),
    required_task_count: z.number().optional(),
    created_at: z.string().optional(),
});

export const logSchema = z.object({
    id: z.string(),
    parent_id: z.string(),
    child_id: z.string(),
    task_id: z.string(),
    status: z.enum(['PENDING', 'VERIFIED', 'REJECTED', 'FAILED', 'PENDING_EXCUSE', 'EXCUSED']),
    rejection_reason: z.string().optional(),
    notes: z.string().optional(),
    completed_at: z.string(),
    verified_at: z.string().optional(),
});

export const transactionSchema = z.object({
    id: z.string(),
    parent_id: z.string(),
    child_id: z.string(),
    amount: z.number(),
    type: z.enum(['TASK_VERIFIED', 'REWARD_REDEEMED', 'MANUAL_ADJ']),
    reference_id: z.string().optional(),
    description: z.string().optional(),
    created_at: z.string(),
});

export const categorySchema = z.object({
    id: z.string(),
    name: z.string(),
    icon: z.string(),
    is_default: z.boolean().optional(),
});

export const profileSchema = z.object({
    id: z.string(),
    created_at: z.string().optional(),
    pin_admin: z.string().optional(),
    family_name: z.string().optional(),
    parent_name: z.string().optional(),
});

export const backupSchema = z.object({
    profile: profileSchema.nullable().optional(),
    children: z.array(childSchema).optional(),
    tasks: z.array(taskSchema).optional(),
    rewards: z.array(rewardSchema).optional(),
    logs: z.array(logSchema).optional(),
    childLogs: z.array(logSchema).optional(), // Handle legacy key
    transactions: z.array(transactionSchema).optional(),
    categories: z.array(categorySchema).optional(),

    // Legacy flat fields support
    adminName: z.string().optional(),
    familyName: z.string().optional(),
    adminPin: z.string().optional(),
    onboardingStep: z.string().optional(),
});

export type BackupData = z.infer<typeof backupSchema>;
