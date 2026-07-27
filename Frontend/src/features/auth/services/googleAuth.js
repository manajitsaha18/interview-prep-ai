import { getAuth, GoogleAuthProvider } from "firebase/auth";
import app from "../../../firebase";

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();

provider.setCustomParameters({
    prompt: "select_account",
});