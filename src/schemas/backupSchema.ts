import { z } from 'zod';

export const childSchema = z.object({
    id: z.string(),
    parent_id: z.string(),
    name: z.string(),
    birth_date: z.string().nullish(),
    current_balance: z.number().nullish(),
    avatar_url: z.string().nullish(),
});

export const taskSchema = z.object({
    id: z.string(),
    parent_id: z.string(),
    name: z.string(),
    reward_value: z.number(),
    type: z.enum(['ONE_TIME', 'RECURRING']).nullish(),
    recurrence_rule: z.string().nullish(),
    is_active: z.boolean().nullish(),
    created_at: z.string().nullish(),
    assigned_to: z.array(z.string()).nullish(),
    category_id: z.string().nullish(),
    expiry_time: z.string().nullish(),
    next_due_date: z.string().nullish(),
    total_target_value: z.number().nullish(),
    target_unit: z.string().nullish(),
    max_completions_per_day: z.number().nullish(),
    current_streak: z.number().nullish(),
    best_streak: z.number().nullish(),
});

export const rewardSchema = z.object({
    id: z.string(),
    parent_id: z.string(),
    name: z.string(),
    cost_value: z.number(),
    category: z.string().nullish(),
    type: z.enum(['ONE_TIME', 'UNLIMITED', 'ACCUMULATIVE']).nullish(),
    required_task_id: z.string().nullish(),
    required_task_count: z.number().nullish(),
    created_at: z.string().nullish(),
    assigned_to: z.array(z.string()).nullish(),
});

export const logSchema = z.object({
    id: z.string(),
    parent_id: z.string(),
    child_id: z.string(),
    task_id: z.string(),
    status: z.enum(['PENDING', 'VERIFIED', 'REJECTED', 'FAILED', 'PENDING_EXCUSE', 'EXCUSED', 'IN_PROGRESS']),
    current_value: z.number().nullish(),
    rejection_reason: z.string().nullish(),
    notes: z.string().nullish(),
    completed_at: z.string(),
    verified_at: z.string().nullish(),
    parentDecisionDate: z.string().nullish().nullable(),
});

export const transactionSchema = z.object({
    id: z.string(),
    parent_id: z.string(),
    child_id: z.string(),
    amount: z.number(),
    type: z.enum(['TASK_VERIFIED', 'REWARD_REDEEMED', 'MANUAL_ADJ']),
    reference_id: z.string().nullish(),
    description: z.string().nullish(),
    created_at: z.string(),
});

export const categorySchema = z.object({
    id: z.string(),
    name: z.string(),
    icon: z.string(),
    is_default: z.boolean().nullish(),
});

export const profileSchema = z.object({
    id: z.string(),
    created_at: z.string().nullish(),
    pin_admin: z.string().nullish(),
    parent_pattern: z.string().nullish(),
    preferred_auth_method: z.enum(['pin', 'pattern', 'biometric']).nullish(),
    family_name: z.string().nullish(),
    parent_name: z.string().nullish(),
    biometric_enabled: z.boolean().nullish(),
    notifications_enabled: z.boolean().nullish(),
    onboarding_step: z.string().nullish(),
});

export const backupSchema = z.object({
    profile: profileSchema.nullable().optional(),
    children: z.array(childSchema).nullish(),
    tasks: z.array(taskSchema).nullish(),
    rewards: z.array(rewardSchema).nullish(),
    logs: z.array(logSchema).nullish(),
    childLogs: z.array(logSchema).nullish(), // Handle legacy key
    transactions: z.array(transactionSchema).nullish(),
    categories: z.array(categorySchema).nullish(),

    // Legacy flat fields support and State settings
    adminName: z.string().nullish(),
    familyName: z.string().nullish(),
    adminPin: z.string().nullish(),
    parentPin: z.string().nullish(),
    parentPattern: z.string().nullish(),
    preferredAuthMethod: z.enum(['pin', 'pattern', 'biometric']).nullish(),
    onboardingStep: z.string().nullish(),
    lastMissedCheckDate: z.string().nullish(),
    biometricEnabled: z.boolean().nullish(),
    notificationsEnabled: z.boolean().nullish(),
    redeemedHistory: z.array(z.object({
        child_id: z.string(),
        reward_id: z.string()
    })).nullish(),
});

export type BackupData = z.infer<typeof backupSchema>;
