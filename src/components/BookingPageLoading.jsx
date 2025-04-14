const BookingPageLoading = ({ isOpen }) => {
  if (!isOpen) return;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6 w-80 text-center">
        <div className="w-12 h-12 border-4 border-[#faffa4] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-white mt-4">Placing your booking...</p>
      </div>
    </div>
  );
};

export default BookingPageLoading;
