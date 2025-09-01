import { Star } from 'lucide-react';

interface LogoProps {
  className?: string;
}

export const Logo = ({ className = "" }: LogoProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center p-1">
        <Star className="w-full h-full text-white fill-white" />
      </div>
      <span className="text-2xl font-bold text-gray-900">HD</span>
    </div>
  );
};
