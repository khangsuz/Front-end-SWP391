import { Button, Form, Input } from "antd";
import React, { useState } from 'react';
import "../../index.css";
import Header from "../../component/header";
import api from "../../config/axios";
import { useNavigate, Link } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { useGoogleLogin } from "@react-oauth/google";
import Footer from "../../component/footer";
import { Notification, notifySuccess, notifyError } from "../../component/alert";

const Login = () => {
  const navigate = useNavigate();
  const [isNewUser, setIsNewUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [googleUserInfo, setGoogleUserInfo] = useState(null);

  const handleLogin = async (values) => {
    try {
      console.log("Login data being sent:", values);
      const response = await api.post("Users/login", {
        name: values.name,
        password: values.password
      });
      console.log("Login response data:", response.data);

      const { token, userType, userId } = response.data;

      if (!token || !userId) {
        throw new Error("Invalid response from server");
      }

      const userData = { token, userType, userId };
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      console.log("Stored user data:", userData);
      console.log("Login successful - UserId:", userId, "Token:", token);

      if (userType === "Admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      notifyError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.");
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
          setGoogleUserInfo({
            email: result.data.email,
            name: result.data.name // Assuming the API returns the name from Google
          });
        } else if (result.data.token && result.data.user) {
          localStorage.setItem("token", result.data.token);
          localStorage.setItem("user", JSON.stringify(result.data.user));
          navigate(result.data.user.userType === "Admin" ? "/admin/dashboard" : "/");
        } else {
          throw new Error("Không nhận được thông tin người dùng hợp lệ từ server");
        }
      } catch (error) {
        console.error("Đăng nhập thất bại:", error.response?.data || error.message);
        notifyError("Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
      }
    },
    flow: 'implicit',
    scope: "email profile",
  });

  const handleCompleteRegistration = async (values) => {
    try {
      const result = await api.post("LoginGoogle/complete-registration", {
        email: newUserEmail,
        fullName: values.fullName,
        phone: values.phone,
        address: values.address
      });

      if (result.data.token && result.data.user) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        navigate("/");
        notifySuccess("Đăng ký thành công!");
      } else {
        throw new Error("Không nhận được thông tin người dùng hợp lệ từ server");
      }
    } catch (error) {
      console.error("Đăng ký thất bại:", error.response?.data || error.message);
      notifyError("Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <>
      <Notification />
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
            {isNewUser ? (
              <Form onFinish={handleCompleteRegistration} initialValues={{ fullName: googleUserInfo?.name }}>
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Hoàn tất đăng ký</h2>
                <Form.Item
                  label="Họ và tên"
                  name="fullName"
                  className="font-bold"
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  className="font-bold"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                    {
                      validator: (_, value) => {
                        if (!value || value.match(/^\d{10}$/)) {
                          return Promise.resolve();
                        }
                        return Promise.reject('Số điện thoại phải có đúng 10 chữ số');
                      }
                    }
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Địa chỉ"
                  name="address"
                  className="font-bold"
                  rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" className="w-full">
                    Hoàn tất đăng ký
                  </Button>
                </Form.Item>
              </Form>
            ) : (
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
                  rules={[{ required: true, message: "Vui lòng nhập tài khoản!" }]}
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
                <div className="mt-4 text-center text-sm text-gray-600">
                  <Link to="/forgot-password" className="text-blue-500 hover:text-blue-600">Quên mật khẩu?</Link>
                </div>
                <p className="mt-4 text-center text-sm text-gray-600">
                  Chưa có tài khoản? <Link to={"/signup"} className="text-blue-500 hover:text-blue-600 font-semibold">Đăng ký</Link>
                </p>
              </Form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;