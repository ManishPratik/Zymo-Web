import  { useState } from 'react';
import carData from "../../api/NewCarData"
const SearchBar = ({ setSearchResults }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search input change
  const setSearchResultsChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query) {
      const filteredCars = carData.filter(car =>
        car.name.toLowerCase().includes(query.toLowerCase()) ||
        car.model.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filteredCars);
    } else {
      setSearchResults(carData); // Reset to all cars if search is empty
    }
  };

  return (
    <div className=" flex items-center border-2 border-darkGrey2 rounded-md px-3 py-1 max-w-full mx-auto gap-3 mt-2">
      <i className="fa fa-search text-md text-[#e8ff81] sm:mr-2"></i>
      <input
        type="text"
        placeholder="Search car or model"
        value={searchQuery}
        onChange={setSearchResultsChange}
        className="  outline-none bg-transparent text-white text-base "
      />
    </div>
  );
};

export default SearchBar;