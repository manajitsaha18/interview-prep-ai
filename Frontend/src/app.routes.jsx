import {createBrowserRouter} from "react-router-dom";
import Landing from "./pages/Landing.jsx";

import Login from "./features/auth/pages/Login.jsx";
import Register from "./features/auth/pages/Register.jsx";
import Protected from "./features/auth/components/protected.jsx";
import Dashboard from "./features/interview/pages/Dashboard.jsx";
import Interview from "./features/interview/pages/Interview.jsx";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/dashboard",
    element: <Protected><Dashboard/></Protected>
  },
  {
    path: "/interview/:interviewId",
    element: <Protected><Interview/></Protected>
  }
])


