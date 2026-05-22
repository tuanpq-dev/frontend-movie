import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { IntlProvider } from "react-intl";
import Root from "./pages/Root.jsx";
import ModalProvider from "./context/ModalProvider";
import { UserProvider } from "./context/UserContext";
import Toast from "./components/Toast/Toast";
import AdminRouter from "./AdminRouter";
import AdminLayout from "@pages/Admin/AdminLayout";
import { RouteFallback } from "@components/Skeleton";

const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const MovieDetail = lazy(() => import("@pages/MovieDetail"));
const Watch = lazy(() => import("@pages/Watch"));
const SingleMovie = lazy(() => import("@pages/SingleMovie"));
const TVSeries = lazy(() => import("@pages/TVSeries"));
const CartoonMovie = lazy(() => import("@pages/CartoonMovie"));
const SearchPage = lazy(() => import("@pages/SearchPage"));
const FavoriteList = lazy(() => import("@pages/FavoriteList"));
const SignIn = lazy(() => import("@pages/SignIn"));
const SignUp = lazy(() => import("@pages/SignUp"));
const UserProfile = lazy(() => import("@pages/UserProfile"));
const VnPayReturn = lazy(() => import("@pages/VNPayReturn"));
const Forbidden = lazy(() => import("@pages/Forbidden"));
const ManageMovie2 = lazy(() => import("@pages/Admin/Movie/ManageMovie2"));
const CreateMovie = lazy(() => import("@pages/Admin/Movie/CreateMovie"));
const EditMovie = lazy(() => import("@pages/Admin/Movie/EditMovie"));
const ManageUser = lazy(() => import("@pages/Admin/User/ManageUser"));
const EditUser = lazy(() => import("@pages/Admin/User/EditUser"));
const ManageGenre = lazy(() => import("@pages/Admin/Genre/ManageGenre"));
const CreateGenre = lazy(() => import("@pages/Admin/Genre/CreateGenre"));
const EditGenre = lazy(() => import("@pages/Admin/Genre/EditGenre"));
const ManagePayment = lazy(() => import("@pages/Admin/Payment/ManagePayment"));
const ManageRevenue = lazy(() => import("@pages/Admin/Payment/ManageRevenue"));
const ManageComment = lazy(() => import("@pages/Admin/ManageComment"));

const withSuspense = (element) => (
    <Suspense fallback={<RouteFallback />}>{element}</Suspense>
);

const router = createBrowserRouter([
    {
        element: <Root />,
        children: [
            {
                path: "/",
                element: withSuspense(<HomePage />),
            },
            {
                path: "/info/:id",
                element: withSuspense(<MovieDetail />),
            },
            {
                path: "/watch/:id",
                element: withSuspense(<Watch />),
            },
            {
                path: "/movie",
                element: withSuspense(<SingleMovie />),
            },
            {
                path: "/tv",
                element: withSuspense(<TVSeries />),
            },
            {
                path: "/cartoon",
                element: withSuspense(<CartoonMovie />),
            },
            {
                path: "/search",
                element: withSuspense(<SearchPage />),
            },
            {
                path: "/favorite",
                element: withSuspense(<FavoriteList />),
            },
        ],
    },
    {
        path: "/sign-in",
        element: withSuspense(<SignIn />),
    },
    {
        path: "/sign-up",
        element: withSuspense(<SignUp />),
    },
    {
        path: "/profile",
        element: withSuspense(<UserProfile />),
    },
    {
        element: <AdminRouter element={<AdminLayout />} />,
        children: [
            {
                path: "/admin/movie",
                element: withSuspense(<ManageMovie2 />),
            },
            {
                path: "/admin/movie/create",
                element: withSuspense(<CreateMovie />),
            },
            {
                path: "/admin/movie/edit/:id",
                element: withSuspense(<EditMovie />),
            },
            {
                path: "/admin/user",
                element: withSuspense(<ManageUser />),
            },
            {
                path: "admin/user/edit/:id",
                element: withSuspense(<EditUser />),
            },
            {
                path: "/admin/genre",
                element: withSuspense(<ManageGenre />),
            },
            {
                path: "/admin/genre/create",
                element: withSuspense(<CreateGenre />),
            },
            {
                path: "/admin/genre/edit/:id",
                element: withSuspense(<EditGenre />),
            },
            {
                path: "/admin/payment",
                element: withSuspense(<ManagePayment />),
            },
            {
                path: "/admin/revenue",
                element: withSuspense(<ManageRevenue />),
            },
            {
                path: "/admin/comment",
                element: withSuspense(<ManageComment />),
            },
        ],
    },
    {
        path: "/VnPayReturn",
        element: withSuspense(<VnPayReturn />),
    },
    {
        path: "/403",
        element: withSuspense(<Forbidden />),
    },
]);

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <IntlProvider locale="vi" messages={{}}>
            <UserProvider>
                <ModalProvider>
                    <Toast />
                    <RouterProvider router={router} />
                </ModalProvider>
            </UserProvider>
        </IntlProvider>
    </StrictMode>,
);
