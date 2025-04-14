import PuneContent from "./PuneContent";
import MumbaiContent from "./MumbaiContent";
import DelhiContent from "./DelhiContent";
import BangaloreContent from "./BangaloreContent";
import HyderabadContent from "./HyderabadContent";
import ChennaiContent from "./ChennaiContent";
import ThaneContent from "./ThaneContent";
import AmritsarContent from "./AmritsarContent";

const CityContent = ({ city }) => {
  switch (city.toLowerCase()) {
    case "pune":
      return <PuneContent />;
    case "mumbai":
      return <MumbaiContent />;
    case "delhi":
      return <DelhiContent />;
    case "bangalore":
      return <BangaloreContent />;
    case "hyderabad":
      return <HyderabadContent />;
    case "chennai":
      return <ChennaiContent />;
    case "thane":
      return <ThaneContent />;
    case "amritsar":
      return <AmritsarContent />;
    default:
      return <div>No content available for {city}</div>;
  }
};
export default CityContent;
