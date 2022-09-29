import type { RouteObject } from "react-router-dom";
import Layout from "../components/Layout";
import HomePage from "../pages/home.page";
import LoginPage from "../pages/login.page";
import ProfilePage from "../pages/profile.page";
import RegisterPage from "../pages/register.page";
import Validate2faPage from "../pages/validate2fa.page";

const authRoutes: RouteObject = {
  path: "*",
  children: [
    {
      path: "login",
      children: [
        {
          path: "",
          element: <LoginPage />,
        },
        {
          path: "validateOtp",
          element: <Validate2faPage />,
        },
      ],
    },
    {
      path: "register",
      element: <RegisterPage />,
    },
  ],
};

const normalRoutes: RouteObject = {
  path: "*",
  element: <Layout />,
  children: [
    {
      index: true,
      element: <HomePage />,
    },
    {
      path: "profile",
      element: <ProfilePage />,
    },
  ],
};

const routes: RouteObject[] = [authRoutes, normalRoutes];

export default routes;
