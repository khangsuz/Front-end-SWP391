import { Button, Form, Input } from "antd";
import React, { useState } from 'react';
import "../../index.css";
import Header from "../../component/header";
import api from "../../config/axios";
import { useNavigate, Link } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { useGoogleLogin } from "@react-oauth/google";
import Footer from "../../component/footer";

const Login = () => {
  const navigate = useNavigate();
  const [isNewUser, setIsNewUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserAddress, setNewUserAddress] = useState('');

  const handleLogin = async (values) => {
    try {
      const response = await api.post("Users/login", values);
      console.log("Login response data:", response.data);
  
      const { token = null, userType = null } = response.data;
  
      console.log("Extracted token:", token);
      console.log("Extracted userType:", userType);
  
      if (!token) {
        throw new Error("No token received from server");
      }
  
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ token, userType }));
  
      console.log("Stored user data:", JSON.parse(localStorage.getItem("user")));
      if (userType === "Admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Sai tên đăng nhập hoặc mật khẩu");
    }
  };

  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Google login response:", tokenResponse);
      try {
        const result = await api.post("LoginGoogle/google-login", {
          accessToken: tokenResponse.access_token
        });

        console.log("Google login result:", result.data);

        if (result.data.isNewUser) {
          setIsNewUser(true);
          setNewUserEmail(result.data.email);
          setNewUserFullName(result.data.name);
          setNewUserPhone(result.data.phone);
          setNewUserAddress(result.data.address);
        } else if (result.data.token) {
          localStorage.setItem("token", result.data.token);
          localStorage.setItem("user", JSON.stringify(result.data.user));

          if (result.data.user.userType === "Admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/");
          }
        } else {
          throw new Error("Không nhận được token từ server");
        }
      } catch (error) {
        console.error("Đăng nhập thất bại:", error.response?.data || error.message);
        alert("Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      alert("Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
    },
    scope: "email profile",
  });

  const handleCompleteRegistration = async (values) => {
    try {
      const result = await api.post("LoginGoogle/complete-registration", {
        email: newUserEmail,
        fullName: newUserFullName, // Sử dụng fullName thay vì name
        phone: values.phone,
        address: values.address
      });
  
      if (result.data.token) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        navigate("/");
      } else {
        throw new Error("Không nhận được token từ server");
      }
    } catch (error) {
      console.error("Đăng ký thất bại:", error.response?.data || error.message);
      alert("Đăng ký thất bại. Vui lòng thử lại.");
    }
  };
  if (isNewUser) {
    return (
      <>
        <Header />
        <div className="login">
          <div className="login__image mt-1 mb-1">
            <img
              src="https://i.postimg.cc/Jz0MW07g/top-view-roses-flowers-Photoroom.png"
              alt=""
            />
          </div>
          <div className="login__form">
            <div className="form-wrapper">
              <Form
                className="form"
                labelCol={{ span: 24 }}
                onFinish={handleCompleteRegistration}
              >
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Hoàn tất đăng ký</h2>
                <Form.Item
                  label="Email"
                  name="email"
                  initialValue={newUserEmail}
                >
                  <Input disabled />
                </Form.Item>
                <Form.Item
                  label="Tên đầy đủ"
                  name="fullName"
                  initialValue={newUserFullName}
                  rules={[{ required: true, message: "Vui lòng nhập tên đầy đủ của bạn!" }]}
                >
                  <Input onChange={(e) => setNewUserFullName(e.target.value)} />
                </Form.Item>
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[{ required: true, message: "Vui lòng nhập số điện thoại của bạn!" }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Địa chỉ"
                  name="address"
                  rules={[{ required: true, message: "Vui lòng nhập địa chỉ của bạn!" }]}
                >
                  <Input onChange={(e) => setNewUserAddress(e.target.value)} />
                </Form.Item>
                <Form.Item>
                  <Button
                    className="w-full bg-blue-500 text-white p-3 rounded-md font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:scale-105 mt-2"
                    type="primary"
                    htmlType="submit"
                  >
                    Hoàn tất đăng ký
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="login">
        <div className="login__image mt-1 mb-1">
          <img
            src="https://i.postimg.cc/Jz0MW07g/top-view-roses-flowers-Photoroom.png"
            alt=""
          />
        </div>
        <div className="login__form">
          <div className="form-wrapper">
            <Form
              className="form"
              labelCol={{ span: 24 }}
              onFinish={handleLogin}
            >
              <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Đăng nhập</h2>
              <div className="flex justify-center space-x-4 mb-6">
                <button
                  className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition duration-300 ease-in-out transform hover:scale-110"
                  onClick={() => loginGoogle()}
                  type="button"
                >
                  <FaGoogle className="text-xl" />
                </button>
              </div>
              <div className="mb-6 text-center">
                <span className="px-2 bg-white text-sm text-gray-500">Hoặc đăng nhập với tài khoản</span>
              </div>
              <Form.Item className="block text-gray-700 text-sm font-bold mb-2"
                label="Tài khoản"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tài khoản!",
                  },
                ]}
              >
                <Input type="text" placeholder="username" />
              </Form.Item>

              <Form.Item
                className="block text-gray-700 text-sm font-bold mb-2"
                label="Mật khẩu"
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input type="password" placeholder="password" />
              </Form.Item>

              <Form.Item>
                <Button
                  className="w-full bg-blue-500 text-white p-3 rounded-md font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:scale-105 mt-2"
                  type="primary"
                  htmlType="submit"
                >
                  Đăng nhập
                </Button>
              </Form.Item>

              <p className="mt-4 text-center text-sm text-gray-600">
                Chưa có tài khoản? <Link to={"/signup"} className="text-blue-500 hover:text-blue-600 font-semibold">Đăng ký</Link>
              </p>
              <p className="mt-2 text-center text-sm text-gray-600">
                <Link to="/forgot-password" className="text-blue-500 hover:text-blue-600 font-semibold">Quên mật khẩu?</Link>
              </p>
            </Form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;