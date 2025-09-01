export const AbstractBackground = () => {
  return (
    <div 
      className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-cover bg-center bg-no-repeat rounded-none"
      style={{
        backgroundImage: `url('/heroimg.jpg')`,
        backgroundColor: '#3B82F6' // Blue fallback
      }}
    >
    </div>
  );
};
