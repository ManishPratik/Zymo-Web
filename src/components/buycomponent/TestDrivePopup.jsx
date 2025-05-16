import { useNavigate  } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
const TestDrivePopup = ({  title ,isOpen, close, id , carDetail}) => {
  const navigate = useNavigate(); // Get the navigate function
  if (!isOpen) return null;
  useEffect(() => {
    document.title = title;
  }, [title]);

  const handleNavigate = () => {
    navigate(`/buy-car/summary/${id}`, {
      state: { car: carDetail}, 
    });
  };

  return (
    <>
 <Helmet>
                <title>{title}</title>
                <meta name="description" content="Book a test drive with Zymo and experience your next car before making a decision!" />
                <meta property="og:title" content={title} />
        <meta property="og:description" content="Schedule a test drive with Zymo and get behind the wheel of your next car." />
                <link rel="canonical" href="https://zymo.app/testdrive" />
            </Helmet>

    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-[#212121] text-white p-6 rounded-lg w-80 shadow-lg">
        <h2 className="text-xl font-semibold text-center mb-4">
          Choose Test Drive Option
        </h2>
        
        {/* Standard Test Drive */}
        <div className="bg-[#2d2d2d] border border-white/10 p-4 rounded-lg text-center mb-4">
          <h3 className="text-lg font-semibold">Test Drive</h3>
          <p className="text-sm text-gray-300">
            Visit our showroom for a comprehensive test drive experience
          </p>
        </div>

        {/* Extended Test Drive */}
        <button onClick={handleNavigate} className="block w-full">
          <div className="bg-[#faffa4] text-black p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold">Extended Test Drive</h3>
            <p className="text-sm">
              Starts @₹52,500/-. Experience the car for a month with a refundable security deposit
            </p>
          </div>
        </button>
        <button
          className="mt-4 w-full bg-red-400 hover:bg-red-500 text-black py-2 rounded-lg"
          onClick={close}
        >
          Close
        </button>
      </div>
    </div>
    </>
  );
};

export default TestDrivePopup;