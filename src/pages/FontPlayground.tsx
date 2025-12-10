import { FaArrowLeft, FaGamepad, FaIceCream, FaTicketAlt, FaGift, FaPizzaSlice, FaBicycle, FaBook, FaPalette } from 'react-icons/fa';
import { IoEllipsisVertical } from 'react-icons/io5';

const FontPlayground = () => {
    const ICONS = [
        { id: 'game', icon: FaGamepad, label: 'Game' },
        { id: 'treat', icon: FaIceCream, label: 'Treat' },
        { id: 'event', icon: FaTicketAlt, label: 'Event' },
        { id: 'gift', icon: FaGift, label: 'Gift' },
        { id: 'food', icon: FaPizzaSlice, label: 'Food' },
        { id: 'activity', icon: FaBicycle, label: 'Activity' },
        { id: 'book', icon: FaBook, label: 'Book' },
        { id: 'art', icon: FaPalette, label: 'Art' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-8 pb-24 font-sans">
            <div className="max-w-3xl mx-auto space-y-12">

                {/* Header Section */}
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-gray-900">Font Playground</h1>
                    <p className="text-lg text-gray-600">
                        Current Font Family: <span className="font-mono bg-gray-200 px-2 py-1 rounded text-sm">System Font (San Francisco on Mac)</span>
                    </p>
                </div>

                {/* REPLICA: Header "Parent Dashboard" */}
                <section className="space-y-4 border p-6 rounded-xl bg-white shadow-sm">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Replica: Header</h2>

                    <div className="navbar bg-gradient-to-b from-primary/20 to-base-100/90 backdrop-blur-sm shadow-sm rounded-xl">
                        <div className="flex-1">
                            <a className="btn btn-ghost text-xl font-bold text-neutral hover:bg-transparent">
                                Parent Dashboard
                            </a>
                        </div>
                        <div className="flex-none">
                            <button className="btn btn-square btn-ghost text-neutral">
                                <IoEllipsisVertical className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </section>

                {/* REPLICA: "Icon Category" Section */}
                <section className="space-y-4 border p-6 rounded-xl bg-white shadow-sm">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Replica: Icon Category Label</h2>

                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-bold text-gray-500 uppercase text-xs tracking-wider">Icon Category</span>
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                            {ICONS.slice(0, 4).map((item) => (
                                <button
                                    key={item.id}
                                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 border-transparent bg-gray-50 text-gray-400 aspect-square"
                                >
                                    <item.icon className="w-6 h-6" />
                                    <span className="text-[10px] font-bold uppercase tracking-wide">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Typography Scale */}
                <section className="space-y-6 border p-6 rounded-xl bg-white shadow-sm">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Typography Scale</h2>

                    <div className="space-y-2">
                        <h1 className="text-5xl font-bold">Heading 1 (5xl)</h1>
                        <h2 className="text-4xl font-bold">Heading 2 (4xl)</h2>
                        <h3 className="text-3xl font-bold">Heading 3 (3xl)</h3>
                        <h4 className="text-2xl font-bold">Heading 4 (2xl)</h4>
                        <h5 className="text-xl font-bold">Heading 5 (xl)</h5>
                        <h6 className="text-lg font-bold">Heading 6 (lg)</h6>
                    </div>

                    <div className="divider"></div>

                    <div className="space-y-4 max-w-prose">
                        <p className="text-base">
                            <strong>Body Text (Base):</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </p>
                        <p className="text-sm">
                            <strong>Small Text (sm):</strong> Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                        <p className="text-xs">
                            <strong>Extra Small (xs):</strong> Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                        </p>
                    </div>
                </section>

                {/* Font Weights */}
                <section className="space-y-4 border p-6 rounded-xl bg-white shadow-sm">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Font Weights</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="font-thin">Thin (100)</div>
                        <div className="font-light">Light (300)</div>
                        <div className="font-normal">Normal (400)</div>
                        <div className="font-medium">Medium (500)</div>
                        <div className="font-semibold">Semibold (600)</div>
                        <div className="font-bold">Bold (700)</div>
                        <div className="font-extrabold">Extrabold (800)</div>
                        <div className="font-black">Black (900)</div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default FontPlayground;
