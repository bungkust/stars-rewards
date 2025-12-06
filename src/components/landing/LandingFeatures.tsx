import { FaStar, FaGift, FaUsers } from 'react-icons/fa';

export const LandingFeatures = () => {
    const features = [
        {
            icon: FaStar,
            title: "Track Habits",
            description: "Set daily missions and track progress with ease. Consistency is key!",
            color: "text-yellow-500",
            bg: "bg-yellow-50"
        },
        {
            icon: FaGift,
            title: "Earn Rewards",
            description: "Motivate your children with customizable rewards they'll love to earn.",
            color: "text-purple-500",
            bg: "bg-purple-50"
        },
        {
            icon: FaUsers,
            title: "Family Fun",
            description: "Designed for the whole family. Manage multiple children and parents.",
            color: "text-blue-500",
            bg: "bg-blue-50"
        }
    ];

    return (
        <div className="py-24 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid md:grid-cols-3 gap-12">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center text-center group">
                            <div className={`w-20 h-20 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className={`text-4xl ${feature.color}`} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
