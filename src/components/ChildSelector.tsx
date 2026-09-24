import { useAppStore } from '../store/useAppStore';

interface ChildSelectorProps {
    onSelect: (childId: string) => void;
    onClose?: () => void;
}

const ChildSelector = ({ onSelect, onClose }: ChildSelectorProps) => {
    const { children, activeChildId } = useAppStore();

    if (children.length === 0) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
            onClick={activeChildId ? onClose : undefined}
        >
            <div
                className="bg-base-100 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200 border border-base-200"
                onClick={(e) => e.stopPropagation()}
            >
                {activeChildId && onClose && (
                    <button
                        onClick={onClose}
                        className="btn btn-circle btn-sm btn-ghost absolute top-4 right-4 text-neutral/60 hover:text-neutral"
                        aria-label="Tutup"
                    >
                        ✕
                    </button>
                )}

                <h2 className="text-xl font-bold text-center mb-6 text-primary">Siapa yang Bermain?</h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[60vh] overflow-y-auto p-1 scrollbar-none">
                    {children.map((child) => {
                        const isActive = child.id === activeChildId;
                        return (
                            <button
                                key={child.id}
                                onClick={() => onSelect(child.id)}
                                className={`flex flex-col items-center gap-2.5 p-3.5 rounded-2xl transition-all active:scale-95 ${
                                    isActive
                                        ? 'bg-primary/10 border-2 border-primary shadow-sm'
                                        : 'bg-base-200 hover:bg-primary/5 border-2 border-transparent'
                                }`}
                            >
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md relative">
                                    <img
                                        src={child.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${child.name}`}
                                        alt={child.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-col items-center w-full">
                                    <span className="text-sm font-bold text-base-content w-full text-center truncate px-1">
                                        {child.name}
                                    </span>
                                    {isActive && (
                                        <span className="badge badge-primary badge-xs text-[9px] px-1.5 py-0.5 mt-1 font-bold">
                                            Aktif
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ChildSelector;

