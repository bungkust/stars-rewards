import { useAppStore } from '../store/useAppStore';

interface ChildSelectorProps {
    onSelect: (childId: string) => void;
    onClose?: () => void;
}

const ChildSelector = ({ onSelect }: ChildSelectorProps) => {
    const { children } = useAppStore();

    if (children.length === 0) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-base-100 w-full max-w-md rounded-3xl p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                <h2 className="text-2xl font-bold text-center mb-6 text-primary">Who is playing?</h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    {children.map((child) => (
                        <button
                            key={child.id}
                            onClick={() => onSelect(child.id)}
                            className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-base-200 hover:bg-primary/10 transition-all active:scale-95"
                        >
                            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md">
                                <img
                                    src={child.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${child.name}`}
                                    alt={child.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="text-lg font-bold text-base-content w-full text-center truncate px-1">{child.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChildSelector;
