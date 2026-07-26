import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './style.scss'
import "@tabler/icons-webfont/dist/tabler-icons.min.css";
import { Toaster } from "sonner";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={3000}
    />
  </StrictMode>,
)
