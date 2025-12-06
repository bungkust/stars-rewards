import { Link } from 'react-router-dom';

export const LandingFooter = () => {
    return (
        <footer className="bg-gray-50 border-t border-gray-100 py-12">
            <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                    <div className="font-bold text-xl text-gray-800 mb-2">Star Habit</div>
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} Kulinotech. All rights reserved.
                    </p>
                </div>

                <div className="flex gap-8">
                    <Link to="/privacy" className="text-sm text-gray-600 hover:text-primary transition-colors">
                        Privacy Policy
                    </Link>
                    <Link to="/terms" className="text-sm text-gray-600 hover:text-primary transition-colors">
                        Terms of Service
                    </Link>
                </div>
            </div>
        </footer>
    );
};
