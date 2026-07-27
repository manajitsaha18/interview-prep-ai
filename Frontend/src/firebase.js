import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCglftPWOYCNas6SIbr1bL1RHtPuJ-rphg",
  authDomain: "interview-prep-ai-2105.firebaseapp.com",
  projectId: "interview-prep-ai-2105",
  storageBucket: "interview-prep-ai-2105.firebasestorage.app",
  messagingSenderId: "400742950384",
  appId: "1:400742950384:web:23ba8d1429de3fae72e935"
};

const app = initializeApp(firebaseConfig);

export default app;