import { createBrowserRouter } from "react-router-dom"
import Root from "./components/Root";
import LandingPage from "./components/LandingPage";
import CoursePage from "./components/CoursePage";
import AdminDashboard from "./components/AdminDashboard";
import NotFound from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LandingPage },
      { path: "course/:courseId", Component: CoursePage },
      { path: "admin", Component: AdminDashboard },
      { path: "*", Component: NotFound },
    ],
  },
]);
