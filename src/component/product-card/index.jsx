import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.scss";
import api from "../../config/axios";
import { useCart } from "../../contexts/CartContext";
import { getFullImageUrl } from '../../utils/imageHelpers';
import { Notification, notifySuccess, notifyError } from "../../component/alert";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { styleText } from "util";

function ProductCard({ flower }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const { updateCartItemCount } = useCart();
  const [categories, setCategories] = useState({});
  const [isExpired, setIsExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  const addToCart = (item, quantity) => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = storedCart.find((cartItem) => cartItem.flowerId === item.flowerId);

    if (existingItem) {
      if (existingItem.quantity + quantity > item.quantity) {
        notifyError(`Không thể thêm quá số lượng trong kho!`);
        return;
      }
      const updatedCart = storedCart.map((cartItem) =>
        cartItem.flowerId === item.flowerId
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      );
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      notifySuccess(`${item.flowerName} đã được thêm vào giỏ hàng!`);
    } else {
      const updatedCart = [...storedCart, { ...item, quantity: quantity }];
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      notifySuccess(`${item.flowerName} đã được thêm vào giỏ hàng!`);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    const token = localStorage.getItem("token");
    const quantity = 1;

    if (!token) {
      notifyError("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!");
      setLoading(false);
      return;
    }

    try {
      // Sử dụng endpoint Cart/add-item
      const response = await api.post(
        "Cart/add-item",
        {
          FlowerId: flower.flowerId,
          Quantity: quantity,
          Price: flower.price,
          IsCustomOrder: false
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        notifySuccess(`${flower.flowerName} đã được thêm vào giỏ hàng!`);
        // Trigger update cart count
        updateCartItemCount();
      } else {
        notifyError(response.data.message || "Thêm vào giỏ hàng thất bại!");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      const errorMessage = err.response?.data?.message || "Thêm vào giỏ hàng thất bại!";
      notifyError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const handleViewDetails = () => {
    navigate(`/product/${flower.flowerId}`);
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get(`Reviews/flower/${flower.flowerId}`);
      setAverageRating(response.data.averageRating || 0);
      setReviews(response.data.reviews);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  useEffect(() => {
    if (flower) {
      fetchReviews();
    }
  }, [flower]);

  const imageUrl = getFullImageUrl(flower.imageUrl);

  const fullStars = Math.floor(averageRating);
  const hasHalfStar = averageRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("Categories");
        const categoriesMap = {};
        response.data.forEach(category => {
          categoriesMap[category.categoryId] = category.categoryName;
        });
        setCategories(categoriesMap);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryColor = (categoryName) => {
    switch (categoryName) {
      case "Hoa sinh nhật":
        return "bg-pink-500 text-white";
      case "Hoa văn phòng":
        return "bg-blue-500 text-white";
      case "Hoa đám cưới":
        return "bg-red-500 text-white";
      case "Hoa thiên nhiên":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const calculateTimeRemaining = (listingDate) => {
    const listingTime = new Date(listingDate).getTime();
    const currentTime = new Date().getTime();
    const localListingTime = listingTime + 7 * 60 * 60 * 1000;

    const timeRemaining = (3 * 24 * 60 * 60 * 1000) - (currentTime - localListingTime);

    if (timeRemaining > 0) {
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
      return `Hết hạn sau: ${hours}h ${minutes}m ${seconds}s`;
    }
    return 'Hết hạn';
  };

  useEffect(() => {
    // Cập nhật lần đầu
    const initialTimeRemaining = calculateTimeRemaining(flower.listingDate);
    setTimeRemaining(initialTimeRemaining);
    setIsExpired(initialTimeRemaining === 'Hết hạn');

    // Tạo interval để cập nhật mỗi giây
    const timer = setInterval(() => {
      const newTimeRemaining = calculateTimeRemaining(flower.listingDate);
      setTimeRemaining(newTimeRemaining);
      setIsExpired(newTimeRemaining === 'Hết hạn');
    }, 1000);

    // Cleanup interval khi component unmount
    return () => clearInterval(timer);
  }, [flower.listingDate]);

  if (!flower) return null;

  return (
    <div className="product-card relative border border-gray-300 p-2 rounded-lg transition-shadow duration-300 ease-in-out hover:shadow-lg">
      <div onClick={handleViewDetails}>
        <img
          src={imageUrl || "https://i.postimg.cc/Jz0MW07g/top-view-roses-flowers-Photoroom.png"}
          alt={flower.flowerName}
          className="w-full h-auto object-cover rounded-md transition-transform duration-300 ease-in-out hover:scale-105"
        />
        {categories[flower.categoryId] && (
          <span className={`absolute top-2 left-2 px-2.5 py-1 rounded text-xs font-medium shadow-sm transition-all duration-200 ${getCategoryColor(categories[flower.categoryId])}`} onClick={(e) => e.stopPropagation()}>
            {categories[flower.categoryId]}
          </span>
        )}
        <p className="name text-center mt-3 text-lg font-medium">
          {flower.flowerName} ({flower.quantity})
        </p>
        <p className="price text-center text-red-500 font-bold">
        {flower.price > 0 ? Number(flower.price).toLocaleString() + '₫' : '?????'}
        </p>
        <div className="rating justify-center items-center space-x-1 mt-2">
          {[...Array(fullStars)].map((_, index) => (
            <FontAwesomeIcon key={index} icon={faStar} className="text-yellow-400" />
          ))}
          {hasHalfStar && <FontAwesomeIcon icon={faStarHalfAlt} className="text-yellow-400" />}
          {[...Array(emptyStars)].map((_, index) => (
            <FontAwesomeIcon key={index + fullStars + (hasHalfStar ? 1 : 0)} icon={faStar} className="text-gray-200" />
          ))}
          {averageRating === 0 && <p className="text-gray-500 text-sm mt-1">Chưa có đánh giá</p>}
        </div>
        <div className="time-remaining text-center text-gray-500 text-sm mt-2">
          {timeRemaining}
        </div>
        <div className="text-center pb-4">
          {flower.price > 0 ? (
            <>
              {flower.quantity > 0 && !isExpired ? (
                <button onClick={handleAddToCart} disabled={loading}>
                  {loading ? (
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  ) : (
                    <p className="">{isExpired ? "không thể mua" : "Thêm vào giỏ hàng"}</p>
                  )}
                </button>
              ) : (
                <p className="text-red-500 mt-5">{isExpired ? "Sản phẩm này đã hết hạn" : "Hết hàng"}</p>
              )}
              {isExpired && flower.quantity > 0 && (
                <p className="text-red-500 mt-1"></p>
              )}
            </>
          ) : (
            <p className="text-gray-500 mt-5 text-red-500 font-bold">Vui lòng liên hệ người bán</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
