import { Link } from 'react-router-dom';

const Card = ({ car }) => {
  return (
    <div className="relative flex flex-col md:flex-row bg-[#303030] border border-gray-500 rounded-2xl p-4 text-white mx-auto w-full max-w-[900px] min-h-[300px] md:items-center overflow-hidden">
      {/* Left Section: Car Details and Image */}
      <div className="flex flex-col md:flex-row items-center w-full md:w-3/4 gap-4">
        {/* Car Details */}
        <div className="flex flex-col justify-between w-full md:w-1/3 text-left gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{car.model}</h2>
          </div>
          <div className="mt-2">
            <div className="text-sm text-[#faffa4] mb-1">
              ★ {car.rating}
            </div>
            <div className="text-sm text-gray-400 flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <span className="fa fa-user-group"></span>
                <span>{car.passengers} Passengers</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="fa-solid fa-gear"></span>
                <span>{car.transmission}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Car Image with Folder-like Background */}
        <div className="relative w-full md:w-2/3 flex justify-center items-center py-2 sm:-mt-6">
          {/* <div className="relative w-[240px] h-[190px] "> */}
          {/* <div className="relative w-[312px] h-[347px] "> */}
            {/* Main folder background */}
            {/* <div className="absolute inset-0 bg-[#eeff8c] rounded-2xl z-0  "> */}
              {/* Tab part - positioned to match the image */}
              {/* <div className="absolute -right-8 top-16 h-40 w-60 bg-[#eeff8c]  rounded-2xl transform -rotate-15 z-10"></div> */}
            {/* </div> */}
{/* Changed the color  */}
          <div className="absolute top-1 left-3 w-[71%] h-[110%] bg-[#faffa4] rounded-tr-3xl rounded-tl-3xl rounded-bl-3xl z-0"></div>
          {/* Second yellow rectangle */}
          <div className="absolute top-8 left-12 w-[71%] h-[110%] bg-[#faffa4] rounded-tr-3xl rounded-br-3xl rounded-bl-3xl z-0"></div>

            {/* Car image */}
          <div className='relative z-10'>
            <img
              src={car.image || "/placeholder.svg"}
              alt={car.name}
              className="w-full h-full object-contain pr-5 pt-8 "
            />
          </div>
          {/* </div> */}
        </div>
      </div>

      {/* Right Section: Price & CTA */}
      <div className="flex flex-col items-end justify-between text-right w-full md:w-1/4 mt-16 md:mt-0 gap-4">
        <div>
          <p className="text-lg font-bold text-white">
            ₹{car.price.min_price}-{car.price.max_price} Lakh
          </p>
          <p className="text-sm text-gray-400">onwards</p>
          <p className="text-xs text-gray-500 text-right">Avg. Ex-Showroom price</p>
        </div>
        <Link to={`/buy-car/car-details/${car.carId}`} state={{ car }} className="mt-2">
          <button className="w-20 h-10 rounded-lg bg-[#faffa4] flex items-center justify-center overflow-hidden group hover:bg-[#303030] hover:border-appColor hover:border-2 transition-colors">
            <span className="relative flex items-center justify-center w-5 h-5 text-darkGrey2 group-hover:text-appColor">
              <span className="group-hover:animate-arrow-loop transition-transform">
                <i className="fa-solid fa-arrow-right"></i>
              </span>
            </span>
          </button>
        </Link>

      </div>
    </div>
  );
};

export default Card;