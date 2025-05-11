import { doc, getDoc } from "firebase/firestore"
import { appDB } from "./firebase"

export const getCarKeywords = async () => {
    // Get the "Car Keyword" document from the "CarClubbing" collection
    const docRef = doc(appDB, "CarClubbing", "Car Keyword");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        // Return the Keyword field which contains the array of car names
        return docSnap.data().Keyword || [];
    } else {
        console.log("No such document!");
        return [];
    }
}