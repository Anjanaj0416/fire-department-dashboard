import { Shield } from 'lucide-react';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="relative">
          <Shield className="w-16 h-16 text-primary-600 mx-auto animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="spinner w-20 h-20 border-4 border-primary-500 border-t-transparent rounded-full"></div>
          </div>
        </div>
        <p className="mt-6 text-lg font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default Loading;