import { Link } from 'react-router-dom';

const Card = ({ car }) => {
  return (
      <div className='relative flex flex-col bg-[#303030] lg:w-[55rem] md:max-w-none max-w-[375px] w-[100%] border border-gray-500 rounded-2xl text-white mx-auto overflow-hidden'>
        <div className='w-full h-full flex flex-col-reverse md:flex-row md:items-center'>

          {/* Left column */}
          <div className="flex-1 flex-col justify-between w-full md:w-1/4 text-left gap-4 md:p-10 md:pb-8 px-8 py-5">
            <div>
              <h2 className="lg:text-5xl text-4xl mb-1 font-bold text-white">{car.model}</h2>
            </div>
            <div className="lg:text-xl text-lg text-[#faffa4] mb-2 font-semibold">
              ★ {car.rating}
            </div>
            <div className="md:text-xl text-lg font-semibold text-gray-400 md:mt-4 flex flex-col md:gap-2 gap-1">
              <div className="flex  items-center gap-2 w-fit">
                <span className="fa fa-user-group"></span>
                <span>{car.passengers} Passengers</span>
              </div>
              <div className="flex items-center gap-[10px] w-fit">
                <span className="fa-solid fa-gear pl-[2px]"></span>
                <span>{car.transmission}</span>
              </div>
            </div>
            <div className='md:py-6 py-4'>
              <p className='md:text-lg text-base mb-1 text-gray-400'>Avg. Ex-Showroom Price</p>
              <p className='font-bold md:text-[26px] text-2xl'>₹{car.price.min_price}–{car.price.max_price} Lakh</p>
            </div>
            <Link to={`/buy-car/car-details/${car.model.replace(/\s+/g, '-').toLowerCase()}`} state={{ car }} className="mt-6">
               <button className="w-full rounded-lg p-[6px] border-2 border-appColor bg-appColor text-darkGrey font-bold text-lg flex items-center justify-center overflow-hidden group hover:bg-[#303030] hover:border-appColor hover:border-2 hover:text-appColor transition-colors">
                 Get Your Car
                 <span className="pl-6 relative flex items-center justify-center w-5 h-5 text-darkGrey2 group-hover:text-appColor">
                   <span className="group-hover:animate-arrow-loop transition-transform">
                     <i className="fa-solid fa-arrow-right text-base"></i>
                   </span>
                 </span>
               </button>
             </Link>
           </div>



           {/* Right Column */}
           <div className="relative w-full flex justify-center items-center flex-1 md:mr-10 py-8 md:py-0">
             {/* Changed the color  */}
             <div className="absolute md:top-[-1.5rem] top-6 md:left-5 left-6 md:w-[72%] w-[50%] md:h-[110%] h-[80%] bg-[#faffa4] rounded-tr-3xl rounded-tl-3xl rounded-bl-3xl z-0"></div>
             {/* Second yellow rectangle */}
             <div className="absolute md:top-4 bottom-0 md:right-5 right-6 md:w-[72%] w-[50%] md:h-[110%] h-[80%] bg-[#faffa4] rounded-tr-3xl rounded-br-3xl rounded-bl-3xl z-0"></div>

               {/* Car image */}
             <div className='relative z-10 w-80 md:w-96'>
               <img
                 src={car.image || "/placeholder.svg"}
                 alt={`Image of ${car.model}`}
                 className="w-full h-full object-contain"
               />
             </div>
           </div>

        </div>

        <div className="flex flex-wrap justify-center items-center text-darkGrey font-bold md:text-xl text-[15px] text-center py-4 md:py-3 bg-appColor">
          <p className="flex-shrink-0 md:mr-1 mr-0">
            Extended Test Drive from ₹129*/hr.
          </p>
          <p className="flex-shrink-0 px-[2px] md:px-1 relative cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-darkGrey hover:after:h-full after:transition-all after:duration-300">
            <Link to={`/buy-car/extended-test-drive/location`} state={{ car }}>
              <span className="relative hover:text-appColor z-20 whitespace-nowrap">Try Now</span>
            </Link>
          </p>
        </div>

      </div>

  );
};

export default Card;