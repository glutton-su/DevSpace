import { Code2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div className={`${sizeClasses[size]} animate-spin`}>
          <img 
            src="/DevSpace Collaborative code sharing.png" 
            alt="DevSpace" 
            className="w-full h-full opacity-80"
          />
        </div>
        <div className={`absolute inset-0 ${sizeClasses[size]} animate-ping opacity-30`}>
          <img 
            src="/DevSpace Collaborative code sharing.png" 
            alt="DevSpace" 
            className="w-full h-full"
          />
        </div>
      </div>
      {text && (
        <p className="mt-4 text-dark-400 animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;