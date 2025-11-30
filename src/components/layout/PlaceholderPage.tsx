import { useLocation } from 'react-router-dom';

const PlaceholderPage = () => {
  const location = useLocation();
  const title = location.pathname.replace('/', '').toUpperCase();
  
  return (
    <div className="flex flex-col items-center justify-center h-full pt-20 text-gray-400">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p>Page under construction</p>
    </div>
  );
};

export default PlaceholderPage;

