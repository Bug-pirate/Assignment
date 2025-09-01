export const MobileStatusBar = () => {
  return (
    <div className="lg:hidden flex items-center justify-between px-6 py-3 bg-white text-black text-sm font-semibold">
      <span>9:41</span>
      <div className="flex items-center gap-1">
        {/* Signal bars */}
        <div className="flex items-end gap-0.5">
          <div className="w-1 h-1 bg-black rounded-full"></div>
          <div className="w-1 h-2 bg-black rounded-full"></div>
          <div className="w-1 h-3 bg-black rounded-full"></div>
          <div className="w-1 h-4 bg-black rounded-full"></div>
        </div>
        {/* WiFi icon */}
        <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
        </svg>
        {/* Battery icon */}
        <svg className="w-6 h-3 ml-1" viewBox="0 0 24 12" fill="currentColor">
          <rect x="1" y="2" width="18" height="8" rx="2" ry="2" stroke="currentColor" strokeWidth="1" fill="none"/>
          <rect x="2.5" y="3.5" width="13" height="5" rx="1" ry="1" fill="currentColor"/>
          <rect x="20" y="4.5" width="2" height="3" rx="0.5" ry="0.5" fill="currentColor"/>
        </svg>
      </div>
    </div>
  );
};
