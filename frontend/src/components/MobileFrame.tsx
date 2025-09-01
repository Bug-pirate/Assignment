import type { ReactNode } from 'react';

interface MobileFrameProps {
  children: ReactNode;
}

export const MobileFrame = ({ children }: MobileFrameProps) => {
  return (
    <div className="lg:hidden">
      {/* Mobile Device Frame */}
      <div className="mx-auto max-w-sm bg-white rounded-[2.5rem] p-2 shadow-xl border border-gray-200 min-h-screen">
        <div className="bg-white rounded-[2rem] overflow-hidden min-h-[calc(100vh-1rem)]">
          <div className="pb-6">
            {children}
          </div>
          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-black rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
