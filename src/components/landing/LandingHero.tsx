import { FaAndroid, FaApple } from 'react-icons/fa';

export const LandingHero = () => {
    return (
        <div className="hero min-h-[80vh] bg-base-100 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-50" />

            <div className="hero-content text-center flex-col max-w-4xl mx-auto z-10 p-6">
                <div className="mb-8 animate-bounce-slow">
                    <div className="w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-3xl shadow-xl flex items-center justify-center mx-auto rotate-3 hover:rotate-6 transition-transform">
                        <span className="text-6xl">⭐</span>
                    </div>
                </div>

                <h1 className="text-5xl md:text-6xl font-black text-gray-800 mb-6 leading-tight">
                    Make Habits <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Fun</span>
                </h1>

                <p className="py-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Star Habit helps parents build positive routines for their children through a fun, gamified reward system.
                </p>

                <div className="mt-12 flex flex-col items-center gap-4 opacity-70">
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Coming soon to</p>
                    <div className="flex gap-6">
                        <div className="flex items-center gap-2 text-gray-400">
                            <FaApple className="text-2xl" />
                            <span className="font-medium">App Store</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                            <FaAndroid className="text-2xl" />
                            <span className="font-medium">Play Store</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
