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
import MangaloreContent from "./MangaloreContent";
import DombivliContent from "./DombivliContent";
import PalavaContent from "./PalavaContent";
import BhubaneswarContent from "./BhubaneswarContent";
import ChandigarhContent from "./ChandigarhContent";
import KochiContent from "./KochiContent";
import NashikContent from "./NashikContent";
import MadhuraiContent from "./MaduraiContent";
import GhaziabadContent from "./GhaziabadContent";
import GoaContent from "./GoaContent";
import BhopalContent from "./BhopalContent";
import GuwahatiContent from "./GuwahatiContent";
import CochinContent from "./CochinContent";
import MysoreContent from "./MysoreContent";
import ModinagarContent from "./ModinagarContent";
import MuradnagarContent from "./MuradnagarContent";
import GurugramContent from "./GurugramContent";
import VijayawadaContent from "./VijayawadaContent";
import UdaipurContent from "./UdaipurContent";
import UdupiContent from "./UdupiContent";
import RishikeshContent from "./RishikeshContent";
import JodhpurContent from "./JodhpurContent";
import HaridwarContent from "./HaridwarContent";
import VizagContent from "./VizagContent";
import NagpurContent from "./NagpurContent";
import AhemdabadContent from "./AhmdabadContent";
import MaduraiContent from "./MaduraiContent";
import VishakapatnamContent from "./VishakapatnamContent";

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
    case "jaipur":
      return <JaipurContent />;
    case "kolkata":
      return <KolkataContent />;
    case "lucknow":
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
    case "mangalore":
      return <MangaloreContent />;
    case "dombivili":
      return <DombivliContent />;
    case "palava":
      return <PalavaContent />;
    case "bhubaneswar":
      return <BhubaneswarContent/>;
    case "chandigarh":
      return <ChandigarhContent/>;
    case "kochi":
      return <KochiContent/>;
    case "nashik":
      return <NashikContent/>;
    case "madurai":
      return <MaduraiContent/>;
    case "ghaziabad":
      return <GhaziabadContent/>;
    case "goa":
      return <GoaContent/>;
    case "bhopal":
      return <BhopalContent/>;
    case "guwahati":
      return <GuwahatiContent/>;
    case "cochin":
      return <CochinContent/>;
    case "mysore":
      return <MysoreContent/>;
    case "modinagar":
      return <ModinagarContent/>;
    case "muradnagar":
      return <MuradnagarContent/>;
    case "gurugram":
      return <GurugramContent/>;
    case "vijaywada":
      return <VijayawadaContent/>;
    case "udupi":
      return <UdupiContent/>;
    case "udaipur":
      return <UdaipurContent/>;
    case "rishikesh":
      return <RishikeshContent/>;
    case "jodhpur":
      return <JodhpurContent/>;
    case "haridwar":
      return <HaridwarContent/>;
    case "vizag":
      return <VizagContent/>;
    case "nagpur":
      return <NagpurContent/>;
    case "ahmedabad":
      return <AhemdabadContent/>;
    case "vishakapatnam":
      return <VishakapatnamContent/>;

    default:
      return <div>No content available for {city}</div>;
  }
};
export default CityContent;
