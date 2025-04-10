const express = require("express");
const axios = require("axios");

const router = express.Router();

// MyChoize API Configuration
const myChoizeUrl = process.env.MYCHOIZE_URL;
const myChoizeUserName = process.env.MYCHOIZE_USERNAME;
const myChoizeKey = process.env.MYCHOIZE_KEY;

const headers = {
    "Content-Type": "application/json",
    Authorization: `Basic ${Buffer.from(
        `${myChoizeUserName}:${myChoizeKey}`
    ).toString("base64")}`,
};

async function fetchData(endpoint) {
    try {
        const url = `${myChoizeUrl}${endpoint}`;
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error.message);
        return { error: `Failed to fetch ${endpoint}` };
    }
}

router.get("/cities", async (req, res) => {
    const data = await fetchData("ListingService/GetCityList");
    res.json(data);
});

const cityList = [
    { CityCode: "SUR", CityDescription: "surat", CityKey: 451 },
    { CityCode: "MUM", CityDescription: "mumbai", CityKey: 345 },
    { CityCode: "DEL", CityDescription: "delhi-ncr", CityKey: 346 },
    { CityCode: "BLR", CityDescription: "bengaluru", CityKey: 348 },
    { CityCode: "KOL", CityDescription: "kolkata", CityKey: 349 },
    { CityCode: "CHA", CityDescription: "chandigarh", CityKey: 351 },
    { CityCode: "AHD", CityDescription: "ahmedabad", CityKey: 355 },
    { CityCode: "VAD", CityDescription: "vadodara", CityKey: 356 },
    { CityCode: "CHN", CityDescription: "chennai", CityKey: 358 },
    { CityCode: "PUN", CityDescription: "pune", CityKey: 359 },
    { CityCode: "HYD", CityDescription: "hyderabad", CityKey: 362 },
    { CityCode: "JAI", CityDescription: "jaipur", CityKey: 363 },
    { CityCode: "JDP", CityDescription: "jodhpur", CityKey: 364 },
    { CityCode: "UDP", CityDescription: "udaipur", CityKey: 365 },
    { CityCode: "AMR", CityDescription: "amritsar", CityKey: 370 },
    { CityCode: "LDH", CityDescription: "ludhiana", CityKey: 375 },
    { CityCode: "BKN", CityDescription: "bikaner", CityKey: 377 },
    { CityCode: "JSM", CityDescription: "jaisalmer", CityKey: 380 },
    { CityCode: "LUC", CityDescription: "lucknow", CityKey: 388 },
    { CityCode: "BHL", CityDescription: "bhopal", CityKey: 389 },
    { CityCode: "IND", CityDescription: "indore", CityKey: 390 },
    { CityCode: "DEH", CityDescription: "dehradun", CityKey: 392 },
    { CityCode: "GOA", CityDescription: "goa", CityKey: 393 },
    { CityCode: "KTA", CityDescription: "kota", CityKey: 767 }
];

function getCityKey(cityName) {
    cityName = cityName.toLowerCase();
    if (cityName === "bangalore") cityName = "bengaluru";
    const city = cityList.find(city => city.CityDescription === cityName);
    return city ? city.CityKey : null;
}

// Search cars endpoint
router.post("/search-cars", async (req, res) => {
    try {
        let { PickDate, DropDate, CityName } = req.body.data;
        if (!PickDate || !DropDate || !CityName) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Get CityKey from CityName
        const CityKey = getCityKey(CityName);
        if (!CityKey) {
            return res.status(404).json({ error: "City not found" });
        }

        const requestBody = {
            PickDate,
            DropDate,
            CityKey: parseInt(CityKey, 10),
            RentalType: "D",
            LocationKey: 0, // Default location key
            PageNo: 1,
            PageSize: 50,
            FuelType: "",
            GearType: "",
            SecurityToken: "",
            VehcileType: "",
        };

        const response = await axios.post(
            `${myChoizeUrl}BookingService/SearchBookingNewList`,
            requestBody,
            { headers }
        );

        res.json(response.data);
    } catch (error) {
        console.error("Error searching cars:", error);
        res.status(500).json({ error: error.message });
    }
});
router.post("/location-list", async (req, res) => {
    try {
        const locationEndpoint = `${myChoizeUrl}ListingService/GetLocationList`;

        let { PickDate, DropDate, CityName } = req.body.data;
        if (!PickDate || !DropDate || !CityName) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const CityKey = getCityKey(CityName);
        if (!CityKey) {
            return res.status(404).json({ error: "City not found" });
        }

        const requestBody = {
            CityKey: parseInt(CityKey, 10),
            DropDate,
            PickDate,
        };

        const response = await axios.post(locationEndpoint, requestBody, {
            headers,
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error getting location list:", error);
        res.status(500).json({ error: error.message });
    }
});



// Create Booking API
router.post("/create-booking", async (req, res) => {
    try {
        const { DropDate, PickDate, PickRegionKey, ...rest} = req.body;
        if (!DropDate || !PickDate || !PickRegionKey ) {
            return res.status(400).json({ error: "Missing required fields: DropDate, PickDate, PickRegionKey" });
        }

        const bookingData = {
            DropDate,
            PickDate,
            PickRegionKey,
            ...rest,
        };
        const response = await axios.post(`${myChoizeUrl}BookingService/CreateBooking`, bookingData, { headers });
        return res.status(200).json(response.data);
    } catch (error) {
        console.error("Error creating booking:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers,
            config: error.config,
        });
        return res.status(500).json({ error: "Failed to create booking", details: error.response?.data || error.message });
    }
});

module.exports = router;
