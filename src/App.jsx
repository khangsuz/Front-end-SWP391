import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./page/home";
import Login from "./page/login";
import SignUp from "./page/signup"
import Dashboard from "./page/admin";
import ProductDetail from "./page/detail/producDetail";
import PrivateRoute from "./component/private-route";
import Account from "./page/user/editProfile";

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "login",
      element: <Login />,
    },
    {
      path: "signup",
      element: <SignUp />,
    },
    {
      path: "account",
      element: <Account />,
    },
    {
      path: "product/:id", // Route for product detail
      element: <ProductDetail />,
    },
    {
      path: "admin",
      element: <PrivateRoute />,
      children: [
        {
          path: "dashboard",
          element: <Dashboard />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;

// Single Page Application
// chỉ sử dụng 1 trang duy nhất
// khi chuyển trang => thay đổi cái nội dung bên trong trang web
