import { useState, useEffect } from 'react';
import {
    PrimaryButton,
    SecondaryButton,
    ToggleButton,
    AppCard,
    IconWrapper,
    AlertModal,
    H1Header,
    StaggerContainer,
    StaggerItem
} from '../components/design-system';
import { FaStar, FaHeart, FaGamepad, FaCheck, FaTimes, FaFilter } from 'react-icons/fa';

const Playground = () => {
    // State for Inputs
    const [textInput, setTextInput] = useState('');
    const [checkboxChecked, setCheckboxChecked] = useState(false);
    const [radioValue, setRadioValue] = useState('option1');
    const [toggleState, setToggleState] = useState(false);
    const [warningToggleState, setWarningToggleState] = useState(false);

    const [filterState, setFilterState] = useState('all');
    const [theme, setTheme] = useState<'childTheme' | 'parentTheme'>('childTheme');

    // Apply theme
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const themes = {
        childTheme: {
            primary: "#38BDF8",
            secondary: "#99E6C9",
            accent: "#FFCC99",
            warning: "#FFD580",
            success: "#5FE28A",
            error: "#FF6B6B",
            info: "#A6E9FF",
            "base-100": "#FFFFFF"
        },
        parentTheme: {
            primary: "#ABC270",
            secondary: "#FEC868",
            accent: "#FDA769",
            warning: "#FFCC99",
            success: "#7ADF93",
            error: "#C83F49",
            info: "#A6E9FF",
            "base-100": "#F9FAFB"
        }
    };

    const currentColors = themes[theme];

    // State for Modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="container mx-auto px-5 py-10 max-w-[480px] pb-[150px]">

            <div className="flex justify-between items-center mb-6">
                <H1Header>Design System</H1Header>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-full">
                    <button
                        onClick={() => setTheme('childTheme')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${theme === 'childTheme' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
                    >
                        Child
                    </button>
                    <button
                        onClick={() => setTheme('parentTheme')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${theme === 'parentTheme' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
                    >
                        Parent
                    </button>
                </div>
            </div>

            <StaggerContainer className="flex flex-col gap-10 mt-8">

                {/* Section A: Typography & Colors */}
                <StaggerItem>
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">A. Typography & Colors</h2>

                        <div className="space-y-4 mb-8">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900">Heading 1 (4xl)</h1>
                                <p className="text-xs text-gray-400">Nunito Bold</p>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Heading 2 (2xl)</h2>
                                <p className="text-xs text-gray-400">Nunito Bold</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Heading 3 (xl)</h3>
                                <p className="text-xs text-gray-400">Nunito Semibold</p>
                            </div>
                            <div>
                                <p className="text-base text-gray-700">Body Text. The quick brown fox jumps over the lazy dog.</p>
                                <p className="text-xs text-gray-400">Nunito Regular</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Caption Text. Small details go here.</p>
                                <p className="text-xs text-gray-400">Nunito Regular</p>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold mb-2">Color Palette ({theme === 'childTheme' ? 'Child' : 'Parent'})</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-[50px] h-[50px] bg-primary rounded-lg shadow-sm"></div>
                                <span className="text-xs mt-1 font-bold">Primary</span>
                                <span className="text-[10px] text-gray-400">{currentColors.primary}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-[50px] h-[50px] bg-secondary rounded-lg shadow-sm"></div>
                                <span className="text-xs mt-1 font-bold">Secondary</span>
                                <span className="text-[10px] text-gray-400">{currentColors.secondary}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-[50px] h-[50px] bg-warning rounded-lg shadow-sm"></div>
                                <span className="text-xs mt-1 font-bold">Warning</span>
                                <span className="text-[10px] text-gray-400">{currentColors.warning}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-[50px] h-[50px] bg-base-100 border rounded-lg shadow-sm"></div>
                                <span className="text-xs mt-1 font-bold">Base-100</span>
                                <span className="text-[10px] text-gray-400">{currentColors["base-100"]}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-[50px] h-[50px] bg-success rounded-lg shadow-sm"></div>
                                <span className="text-xs mt-1 font-bold">Success</span>
                                <span className="text-[10px] text-gray-400">{currentColors.success}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-[50px] h-[50px] bg-error rounded-lg shadow-sm"></div>
                                <span className="text-xs mt-1 font-bold">Error</span>
                                <span className="text-[10px] text-gray-400">{currentColors.error}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-[50px] h-[50px] bg-info rounded-lg shadow-sm"></div>
                                <span className="text-xs mt-1 font-bold">Info</span>
                                <span className="text-[10px] text-gray-400">{currentColors.info}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-[50px] h-[50px] bg-accent rounded-lg shadow-sm"></div>
                                <span className="text-xs mt-1 font-bold">Accent</span>
                                <span className="text-[10px] text-gray-400">{currentColors.accent}</span>
                            </div>
                        </div>
                    </section>
                </StaggerItem>

                {/* Section B: Buttons & States */}
                <StaggerItem>
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">B. Buttons & States</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Primary Button</p>
                                <PrimaryButton onClick={() => { }}>Action Button</PrimaryButton>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Secondary Button</p>
                                <SecondaryButton onClick={() => { }}>Cancel Action</SecondaryButton>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Warning Toggle</p>
                                <ToggleButton
                                    isActive={warningToggleState}
                                    onClick={() => setWarningToggleState(!warningToggleState)}
                                    label="Delete Item"
                                    variant="warning"
                                />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Toggle Button: {toggleState ? 'ON' : 'OFF'}</p>
                                <ToggleButton
                                    isActive={toggleState}
                                    onClick={() => setToggleState(!toggleState)}
                                    label="Enable Feature"
                                />
                            </div>
                        </div>
                    </section>
                </StaggerItem>

                {/* Section: Filter & Actions */}
                <StaggerItem>
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Filter & Actions</h2>
                        <div className="space-y-6">
                            {/* Filter Group */}
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Filter Group</p>
                                <div className="flex gap-2">
                                    <ToggleButton
                                        label="All"
                                        isActive={filterState === 'all'}
                                        onClick={() => setFilterState('all')}
                                    />
                                    <ToggleButton
                                        label="Active"
                                        isActive={filterState === 'active'}
                                        onClick={() => setFilterState('active')}
                                    />
                                    <ToggleButton
                                        label="Completed"
                                        isActive={filterState === 'completed'}
                                        onClick={() => setFilterState('completed')}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Action Buttons</p>
                                <div className="flex flex-wrap gap-3">
                                    <button className="btn btn-success text-white gap-2 rounded-full">
                                        <FaCheck /> Approve
                                    </button>
                                    <button className="btn btn-error text-white gap-2 rounded-full">
                                        <FaTimes /> Reject
                                    </button>
                                    <button className="btn btn-primary text-white gap-2 rounded-full">
                                        <FaCheck /> Done
                                    </button>
                                    <button className="btn btn-outline gap-2 rounded-full">
                                        <FaFilter /> Filter
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 mb-2 mt-4">Icon Only</p>
                                <div className="flex flex-wrap gap-3">
                                    <button className="btn btn-success text-white btn-circle">
                                        <FaCheck />
                                    </button>
                                    <button className="btn btn-error text-white btn-circle">
                                        <FaTimes />
                                    </button>
                                    <button className="btn btn-primary text-white btn-circle">
                                        <FaCheck />
                                    </button>
                                    <button className="btn btn-outline btn-circle">
                                        <FaFilter />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </StaggerItem>

                {/* Section C: Input Mechanisms */}
                <StaggerItem>
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">C. Input Mechanisms</h2>
                        <div className="space-y-4">
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text">Text Input</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Type something..."
                                    className="input input-bordered w-full"
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                />
                                <label className="label">
                                    <span className="label-text-alt">Value: {textInput}</span>
                                </label>
                            </div>

                            <div className="form-control">
                                <label className="label cursor-pointer justify-start gap-3">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary"
                                        checked={checkboxChecked}
                                        onChange={(e) => setCheckboxChecked(e.target.checked)}
                                    />
                                    <span className="label-text">Checkbox Option</span>
                                </label>
                            </div>

                            <div className="flex gap-6">
                                <div className="form-control">
                                    <label className="label cursor-pointer justify-start gap-2">
                                        <input
                                            type="radio"
                                            name="radio-1"
                                            className="radio radio-primary"
                                            checked={radioValue === 'option1'}
                                            onChange={() => setRadioValue('option1')}
                                        />
                                        <span className="label-text">Option 1</span>
                                    </label>
                                </div>
                                <div className="form-control">
                                    <label className="label cursor-pointer justify-start gap-2">
                                        <input
                                            type="radio"
                                            name="radio-1"
                                            className="radio radio-primary"
                                            checked={radioValue === 'option2'}
                                            onChange={() => setRadioValue('option2')}
                                        />
                                        <span className="label-text">Option 2</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </section>
                </StaggerItem>

                {/* Section D: Elements */}
                <StaggerItem>
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">D. Elements</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-2">App Card</p>
                                <AppCard>
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg">Card Title</h3>
                                        <p className="text-gray-600">This is content inside an AppCard component.</p>
                                    </div>
                                </AppCard>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-2">Icon Wrappers</p>
                                <div className="flex gap-4">
                                    <div className="p-3 bg-info/20 rounded-full">
                                        <IconWrapper icon={FaStar} className="!text-info" />
                                    </div>
                                    <div className="p-3 bg-error/20 rounded-full">
                                        <IconWrapper icon={FaHeart} className="!text-error" />
                                    </div>
                                    <div className="p-3 bg-accent/20 rounded-full">
                                        <IconWrapper icon={FaGamepad} className="!text-accent" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </StaggerItem>

                {/* Section: Labels & Tags */}
                <StaggerItem>
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Labels & Tags</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Theme Colors</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="badge badge-primary text-white">Primary</span>
                                    <span className="badge badge-secondary text-gray-900">Secondary</span>
                                    <span className="badge badge-accent text-gray-900">Accent</span>
                                    <span className="badge badge-neutral text-white">Neutral</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-2">State Colors</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="badge badge-info text-gray-900">Info</span>
                                    <span className="badge badge-success text-gray-900">Success</span>
                                    <span className="badge badge-warning text-gray-900">Warning</span>
                                    <span className="badge badge-error text-white">Error</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Outline</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="badge badge-primary badge-outline">Primary</span>
                                    <span className="badge badge-secondary badge-outline">Secondary</span>
                                    <span className="badge badge-accent badge-outline">Accent</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Sizes</p>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="badge badge-lg">Large</span>
                                    <span className="badge badge-md">Medium</span>
                                    <span className="badge badge-sm">Small</span>
                                    <span className="badge badge-xs">Tiny</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </StaggerItem>

                {/* Section E: Overlays */}
                <StaggerItem>
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">E. Overlays</h2>
                        <PrimaryButton onClick={() => setIsModalOpen(true)}>
                            Open Alert Modal
                        </PrimaryButton>

                        <AlertModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            title="Test Modal"
                            message="This is a test of the AlertModal component. It overlays the content."
                            type="success"
                            onConfirm={() => setIsModalOpen(false)}
                        />
                    </section>
                </StaggerItem>

            </StaggerContainer>
        </div>
    );
};

export default Playground;
