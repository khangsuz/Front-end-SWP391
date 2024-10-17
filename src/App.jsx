import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import Home from "./page/home";
import Login from "./page/login";
import SignUp from "./page/signup"
import Dashboard from "./page/admin";
import Cart from "./page/cart";
import Products from "./page/products";
import ProductDetail from "./page/productDetail";
import PrivateRoute from "./component/private-route";
import About from "./page/about";
import Profile from "./page/user/editProfile";
import CreateProduct from "./page/seller"; 
import ForgotPassword from './page/login/forgetPassword';
import AdminLayout from "./page/admin/AdminLayout";
import QuanLiSanPham from "./page/admin/QuanLiSanPham";
import QuanLiNguoiDung from "./page/admin/QuanLiNguoiDung";
import QuanLiNguoiBan from "./page/admin/QuanLiNguoiBan";
import QuanLiDonHang from "./page/admin/QuanLiDonHang";
import PaymentButton from "./component/button/PaymentButton";
import PaymentResult from "./page/payment/paymentResult";
import CheckoutPage from './page/payment/checkOutPage'; 
// import PaymentResult from "./page/payment";
// import Chat from "./page/chat";
import PersonalProduct from "./page/personalProduct";
import ManageProducts from "./page/personalProduct/ManageProducts";
import Events from "./page/events";
import SearchResult from "./page/searchResult";
import ManageRevenue from "./page/personalProduct/ManageRevenue"; 
import ManageOrders from "./page/personalProduct/ManageOrders"; 
import RegisterSeller from "./page/seller/registerSeller";
import ChatBox from "./page/chat";
import ChatPage from "./page/chat/chatPage";


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
      path: "profile",
      element: <Profile />,
    },
    {
      path: "cart",
      element: <Cart />,
    },
    {
      path: "about",
      element: <About />,
    },
    {
      path: "product/:id",
      element: <ProductDetail />,
    },
    {
      path: "personal-product/:userId", 
      element: <PersonalProduct />, 
    },
    {
      path: "manage-products/:userId", 
      element: <ManageProducts />,
    },
    {
      path: "manage-revenue/:userId", 
      element: <ManageRevenue />,
    },
    {
      path: "manage-orders/:userId", 
      element: <ManageOrders />,
    },
    {
      path: "products",
      element: <Products />,
    },
    {
      path: "events",
      element: <Events />
    },
    {
      path: "personal-product/:userId", 
      element: <PersonalProduct />, 
    },
    {
      path: "/search", 
      element: <SearchResult />, 
    },
    {
      path: "/payment-result",
      element: <PaymentResult />
    },
    {
      path: "/register-seller",
      element: <RegisterSeller />
    },
    
    {
      path: "/chat/:conversationId",
      element: <ChatPage />,
    },
    {
      path: "/checkout",
      element: <CheckoutPage />
    },
    {
      path: "forgot-password",
      element: <ForgotPassword />,
    },
    {
      path: "manage-product", 
      element: <PrivateRoute requiredRole="Seller">
        <CreateProduct />
      </PrivateRoute>
    },
    // {
    //   path: "chat",
    //   element: <Chat />,
    // },
    {
      path: "admin",
      element: (
        <PrivateRoute requiredRole="Admin"> 
          <AdminLayout /> 
        </PrivateRoute>
      ),
      children: [
        {
          path: "dashboard",
          element: <Dashboard />,
        },
        {
          path: "personal-product/:userId", 
          element: <PersonalProduct />, 
        },
        {
          path: "quanlinguoidung",
          element: <QuanLiNguoiDung />,
        },
        {
          path: "quanlisanpham",
          element: <QuanLiSanPham />, 
        },
        {
          path: "quanlidonhang",
          element: <QuanLiDonHang />,
        },
        {
          path: "quanlinguoiban",
          element: <QuanLiNguoiBan />,
        },
      ],
    },
    {
      path: "payment",
      element: <PaymentButton />,
    },
    {
      path: "payment-result", 
      element: <PaymentResult />,
    },
    
  ]);

  return(
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  );
};

export default App;