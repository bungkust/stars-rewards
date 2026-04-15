import { 
  FaSoap, FaClock, FaUserCheck, FaBook, FaUsers, FaCommentDots, FaTshirt, FaSmile, FaShapes,
  FaStar, FaBed, FaBath, FaUtensils, FaBroom, FaCar, FaDog, FaRunning, FaMusic,
  FaGamepad, FaIceCream, FaTicketAlt, FaGift, FaPizzaSlice, FaBicycle, FaPalette
} from 'react-icons/fa';

export const ICON_MAP: Record<string, any> = {
    'soap': FaSoap,
    'clock': FaClock,
    'user-check': FaUserCheck,
    'book': FaBook,
    'users': FaUsers,
    'message-circle': FaCommentDots,
    'shirt': FaTshirt,
    'smile': FaSmile,
    'default': FaShapes
};

export const ICON_OPTIONS = Object.keys(ICON_MAP).filter(k => k !== 'default');

export const TASK_ICONS = [
  { id: 'star', icon: FaStar, label: 'Star' },
  { id: 'book', icon: FaBook, label: 'Read' },
  { id: 'bed', icon: FaBed, label: 'Bed' },
  { id: 'bath', icon: FaBath, label: 'Bath' },
  { id: 'utensils', icon: FaUtensils, label: 'Eat' },
  { id: 'broom', icon: FaBroom, label: 'Clean' },
  { id: 'shirt', icon: FaTshirt, label: 'Clothes' },
  { id: 'soap', icon: FaSoap, label: 'Wash' },
  { id: 'dog', icon: FaDog, label: 'Pet' },
  { id: 'running', icon: FaRunning, label: 'Sport' },
  { id: 'music', icon: FaMusic, label: 'Music' },
  { id: 'car', icon: FaCar, label: 'Car' },
];

export const REWARD_ICONS = [
  { id: 'game', icon: FaGamepad, label: 'Game' },
  { id: 'treat', icon: FaIceCream, label: 'Treat' },
  { id: 'event', icon: FaTicketAlt, label: 'Event' },
  { id: 'gift', icon: FaGift, label: 'Gift' },
  { id: 'food', icon: FaPizzaSlice, label: 'Food' },
  { id: 'activity', icon: FaBicycle, label: 'Activity' },
  { id: 'book', icon: FaBook, label: 'Book' },
  { id: 'art', icon: FaPalette, label: 'Art' },
];

// Helper to get icon component by id
export const getTaskIconComponent = (id?: string) => {
  if (!id) return FaStar;
  const match = TASK_ICONS.find(i => i.id === id);
  return match ? match.icon : FaStar;
};

export const getRewardIconComponent = (id?: string) => {
  if (!id) return FaGift;
  const match = REWARD_ICONS.find(i => i.id === id);
  return match ? match.icon : FaGift;
};
