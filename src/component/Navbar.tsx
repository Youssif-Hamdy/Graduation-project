import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [Email, setEmail] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      const storedUsername = localStorage.getItem('Email');
      if (token) {
        setIsLoggedIn(true);
        if (storedUsername) {
          setEmail(storedUsername);
        }
      } else {
        setIsLoggedIn(false);
        setEmail('');
      }
    };

    checkLoginStatus();

    window.addEventListener('storage', checkLoginStatus);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    // عرض رسالة تأكيد باستخدام toast
    toast(
      <div>
        <p>Are you sure you want to log out?</p>
        <div className="flex justify-around mt-3">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => {
              toast.dismiss(); // إغلاق الرسالة
              performLogout(); // تنفيذ تسجيل الخروج
            }}
          >
            Yes
          </button>
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={() => toast.dismiss()} // إغلاق الرسالة دون تنفيذ أي شيء
          >
            No
          </button>
        </div>
      </div>,
      {
        position: 'top-center',
        autoClose: false, // عدم إغلاق الرسالة تلقائياً
        closeButton: false, // إخفاء زر الإغلاق الافتراضي
        closeOnClick: false, // عدم إغلاق الرسالة عند النقر خارجها
        draggable: false, // منع سحب الرسالة
      }
    );
  };

  const performLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      console.log('Refresh Token:', refreshToken);
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }
    
      const response = await fetch('https://smart-pharma-net.vercel.app/account/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // إذا كان الخادم يتطلب ذلك

        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      const data = await response.json();
      console.log("Logout response:", data);
    
      if (!response.ok) {
        throw new Error(data.message || 'Failed to log out');
      }
    
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userLocation');
      localStorage.removeItem('askedForLocation');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('Email');
    
      setIsLoggedIn(false);
      toast.success('Logged out successfully!');
      navigate('/signin');
    } catch (err: any) {
      console.error('Logout error:', err);
      toast.error(err.message || 'An error occurred during logout. Please try again.');
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="bg-indigo-500">
      <ToastContainer />
      <nav className="fixed top-0 left-0 right-0 px-4 py-4 flex justify-between items-center bg-white z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            className="flex items-center text-3xl font-bold leading-none"
            to="/"
          >
            <img
              src="https://raw.githubusercontent.com/Youssif-Hamdy/logo/refs/heads/main/logo.png"
              alt="Logo"
              className="h-10 w-10 mr-2"
            />
            <span className="text-black">smart </span>
            <span className="text-indigo-600">pharmaNet</span>
          </Link>
          <div className="lg:hidden">
            <button className="navbar-burger flex items-center text-indigo-600 p-3" onClick={toggleMenu}>
              <svg className="block h-4 w-4 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <title>Mobile menu</title>
                <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
              </svg>
            </button>
          </div>
          <ul className="hidden absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 lg:flex lg:mx-auto lg:items-center lg:w-auto lg:space-x-6">
            <li>
              <NavLink
                to="/home"
                className={({ isActive }) => `text-sm ${isActive ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-500'}`}
              >
                Home
              </NavLink>
            </li>
            <li className="text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" className="w-4 h-4 current-fill" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v0m0 7v0m0 7v0m0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </li>
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) => `text-sm ${isActive ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-500'}`}
              >
                About Us
              </NavLink>
            </li>
            <li className="text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" className="w-4 h-4 current-fill" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v0m0 7v0m0 7v0m0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </li>
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) => `text-sm ${isActive ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-500'}`}
              >
                Contact Us
              </NavLink>
            </li>
            <li className="text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" className="w-4 h-4 current-fill" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v0m0 7v0m0 7v0m0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </li>
            <li>
              <NavLink
                to="/availablemedicine"
                className={({ isActive }) => `text-sm ${isActive ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-500'}`}
              >
                Available Medicine
              </NavLink>
            </li>
          </ul>
          {isLoggedIn ? (
            <div className="hidden lg:flex items-center space-x-4 relative">
              <Link className="ml-4" to="/cart">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L4 3m0 0H3m4 10a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z"></path>
                </svg>
              </Link>
              <div
                className="flex w-12 h-12 items-center justify-center bg-indigo-600 text-white rounded-full hover:bg-indigo-700 hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer shadow-md"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="text-lg font-semibold">
                  {getInitials(Email)}
                </span>
              </div>
              {isDropdownOpen && (
                <div className="absolute top-14 right-0 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <button
                    className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              className="hidden lg:inline-block lg:ml-auto lg:mr-3 py-2 px-6 bg-indigo-500 hover:bg-indigo-600 text-sm text-white font-bold rounded-xl transition duration-200"
              to="/signin"
            >
              Sign In/Up
            </Link>
          )}
        </div>
      </nav>
      <div className={`navbar-menu relative z-50 ${isMenuOpen ? '' : 'hidden'}`}>
        <div className="navbar-backdrop fixed inset-0 bg-gray-800 opacity-25" onClick={toggleMenu}></div>
        <nav className="fixed top-0 left-0 bottom-0 flex flex-col w-5/6 max-w-sm py-6 px-6 bg-white border-r overflow-y-auto">
          <div className="flex items-center mb-8 fixed top-0 left-0 right-0 bg-white py-6 px-6 z-50">
            <Link className="mr-auto text-3xl font-bold leading-none" to="/">
              <img
                src="https://raw.githubusercontent.com/Youssif-Hamdy/logo/refs/heads/main/logo.png"
                alt="Logo"
                className="h-10 w-10 mr-2"
              />
            </Link>
            <button className="navbar-close" onClick={toggleMenu}>
              <svg className="h-6 w-6 text-gray-400 cursor-pointer hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div className="mt-20">
            <div className="flex items-center space-x-4 sm:hidden">
              <div className="flex w-12 h-12 items-center justify-center bg-indigo-600 text-white rounded-full hover:bg-indigo-700 hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer shadow-md border-2 border-indigo-700">
                <span className="text-lg font-semibold">
                  {getInitials(Email)}
                </span>
              </div>
            </div>
            <ul>
              <li className="mb-1">
                <NavLink
                  to="/home"
                  className={({ isActive }) =>
                    `block p-4 text-sm font-semibold ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:bg-indigo-50 hover:text-indigo-600'} rounded`
                  }
                  onClick={toggleMenu}
                >
                  Home
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `block p-4 text-sm font-semibold ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:bg-indigo-50 hover:text-indigo-600'} rounded`
                  }
                  onClick={toggleMenu}
                >
                  About Us
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    `block p-4 text-sm font-semibold ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:bg-indigo-50 hover:text-indigo-600'} rounded`
                  }
                  onClick={toggleMenu}
                >
                  Contact Us
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink
                to="/availablemedicine"
                className={({ isActive }) =>
                    `block p-4 text-sm font-semibold ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:bg-indigo-50 hover:text-indigo-600'} rounded`
                  }
                  onClick={toggleMenu}
                >
                  Available Medicine
                </NavLink>
              </li>
            </ul>
          </div>
          <div className="mt-auto">
            <div className="pt-6">
              {isLoggedIn ? (
                <button
                  className="block px-4 py-3 mb-3 text-xs text-center font-semibold leading-none text-white bg-red-500 hover:bg-red-600 rounded-xl w-full"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              ) : (
                <Link
                  className="block px-4 py-3 mb-3 text-xs text-center font-semibold leading-none text-white bg-blue-500 hover:bg-blue-600 rounded-xl"
                  to="/signin"
                  onClick={toggleMenu}
                >
                  Sign In/Up
                </Link>
              )}
            </div>
            <p className="my-4 text-xs text-center text-gray-400">
              <span>Copyright © 2021</span>
            </p>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;