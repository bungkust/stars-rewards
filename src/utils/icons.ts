import { FaSoap, FaClock, FaUserCheck, FaBook, FaUsers, FaCommentDots, FaTshirt, FaSmile, FaShapes } from 'react-icons/fa';

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
