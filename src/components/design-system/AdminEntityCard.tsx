import type { ReactNode } from 'react';
import { FaStar } from 'react-icons/fa';
import { PencilSimple, Trash } from '@phosphor-icons/react';

export interface AdminEntityCardProps {
  /** Left slot: Icon, image, or custom badge */
  badge: ReactNode;
  /** Main title */
  title: string;
  /** Optional star count or label (e.g. 10 or "+15 Stars") */
  stars?: number | string;
  /** Optional prefix for star pill (e.g. "+" for loyalty bonuses) */
  starPrefix?: string;
  /** Optional tags/pills rendered below title */
  tags?: ReactNode;
  /** Optional description text */
  description?: string | null;
  /** Callback when edit button is clicked */
  onEdit?: () => void;
  /** Callback when delete button is clicked */
  onDelete?: () => void;
  /** Optional click handler for entire card (e.g. open details modal) */
  onClick?: () => void;
  /** Optional custom action slot replacing edit/delete buttons */
  customActions?: ReactNode;
  /** Color theme variant: 'parent' (emerald accent) or 'child' (sky accent) */
  variant?: 'parent' | 'child';
  /** Optional custom class names */
  className?: string;
}

export const AdminEntityCard = ({
  badge,
  title,
  stars,
  starPrefix = '',
  tags,
  description,
  onEdit,
  onDelete,
  onClick,
  customActions,
  variant = 'parent',
  className = ''
}: AdminEntityCardProps) => {
  const isChild = variant === 'child';
  const borderAccent = isChild ? 'border-l-sky-400' : 'border-l-emerald-600';
  const badgeColors = isChild
    ? 'bg-sky-500/10 text-sky-700 border-sky-400/25'
    : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
  const editBtnColor = isChild
    ? 'text-sky-700 hover:bg-sky-100/50'
    : 'text-emerald-700 hover:bg-emerald-100/50';

  return (
    <div
      className={`card bg-base-100 shadow-sm rounded-2xl p-4 sm:p-5 border border-base-200 border-l-4 ${borderAccent} hover:border-base-300 transition-all ${
        onClick ? 'cursor-pointer active:scale-[0.99]' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        {/* Left: Badge / Thumbnail */}
        <div className={`w-12 h-12 rounded-2xl border shadow-xs flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden ${badgeColors}`}>
          {badge}
        </div>

        {/* Middle: Title, Stars Pill, Tags & Description */}
        <div className="flex-1 min-w-0">
          {/* Line 1: Strictly for Title */}
          <h4 className="font-bold text-sm sm:text-base text-neutral truncate leading-snug">
            {title}
          </h4>

          {/* Line 2: Stars Pill & Tags */}
          {(stars != null || tags) && (
            <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
              {stars != null && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs shadow-xs">
                  <FaStar className="w-3 h-3 text-warning fill-current" />
                  {typeof stars === 'number' ? `${starPrefix}${stars} Stars` : stars}
                </span>
              )}
              {tags}
            </div>
          )}

          {description && (
            <p className="text-xs text-neutral/60 mt-1.5 leading-relaxed line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {/* Right: Actions */}
        {(onEdit || onDelete || customActions) && (
          <div
            className="flex items-center gap-1 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {customActions ? (
              customActions
            ) : (
              <>
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className={`btn btn-sm btn-ghost btn-circle ${editBtnColor}`}
                    title={`Edit ${title}`}
                    aria-label={`Edit ${title}`}
                  >
                    <PencilSimple size={18} weight="bold" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="btn btn-sm btn-ghost btn-circle text-error/60 hover:text-error hover:bg-error/10"
                    title={`Delete ${title}`}
                    aria-label={`Delete ${title}`}
                  >
                    <Trash size={18} weight="bold" />
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
