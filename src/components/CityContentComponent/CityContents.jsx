import PuneContent from "./PuneContent";
import MumbaiContent from "./MumbaiContent";
import DelhiContent from "./DelhiContent";
import BangaloreContent from "./BangaloreContent";
import HyderabadContent from "./HyderabadContent";
import ChennaiContent from "./ChennaiContent";
import ThaneContent from "./ThaneContent";
import AmritsarContent from "./AmritsarContent";
import CoimbatoreContent from "./CoimbatoreContent";
import IndoreContent from "./IndoreContent";
import JaipurContent from "./JaipurContent";
import KolkataContent from "./KolkataContent";
import LucknowContent from "./LucknowContent";
import MerrutContent from "./MerrutContent";
import NoidaContent from "./NoidaContent";
import RanchiContent from "./RanchiContent";
import SiliguriContent from "./SiliguriContent";
import SuratContent from "./SuratContent";
import TrichyContent from "./TrichyContent";
import VadodaraContent from "./VadodaraContent";

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
    case "coimbatore":
      return <CoimbatoreContent />;
    case "indore":
      return <IndoreContent />;
    case "jaipor":
      return <JaipurContent />;
    case "kolkata":
      return <KolkataContent />;
    case "luckhnow":
      return <LucknowContent />;
    case "merrut":
      return <MerrutContent />;
    case "noida":
      return <NoidaContent />;
    case "ranchi":
      return <RanchiContent />;
    case "siliguri":
      return <SiliguriContent />;
    case "surat":
      return <SuratContent />;
    case "trichy":
      return <TrichyContent />;
    case "vadodara":
      return <VadodaraContent />;
   
    default:
      return <div>No content available for {city}</div>;
  }
};
export default CityContent;
