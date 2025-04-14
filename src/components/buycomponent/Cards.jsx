import Card from './Card';
import carData from '../../api/NewCarData.js';
const Cards = ({ cars }) => { // Destructure the 'cars' prop
    return (
        <div className="bg-darkGrey grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 py-6 my-3 rounded-lg mx-auto max-w-[1240px]">
            {carData && carData.map((car) => (
                <Card key={car.carId} car={car} />
            ))}
        </div>
    );
};

export default Cards;