import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [Email, setEmail] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Add animation effect when sidebar opens or closes
  useEffect(() => {
    if (sidebarRef.current) {
      if (isMenuOpen) {
        sidebarRef.current.style.transform = 'translateX(0)';
      } else {
        sidebarRef.current.style.transform = 'translateX(-100%)';
      }
    }
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    toast(
      <div className="logout-confirmation">
        <p className="text-lg font-medium mb-2">Are you sure you want to log out?</p>
        <div className="flex justify-around mt-3 gap-3">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow-md"
            onClick={() => {
              toast.dismiss();
              performLogout();
            }}
          >
            Yes
          </button>
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md"
            onClick={() => toast.dismiss()}
          >
            No
          </button>
        </div>
      </div>,
      {
        position: 'top-center',
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
        draggable: false,
        className: 'rounded-lg',
      }
    );
  };

  // Function to refresh the token
  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('https://smart-pharma-net.vercel.app/account/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshTokenValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access);
      console.log('Token refreshed successfully');
    } catch (error) {
      console.error('Token refresh failed:', error);
      performLogout();
    }
  };

  // Set up the token refresh interval
  const setupTokenRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    const interval = setInterval(refreshToken, 900000);
    setRefreshInterval(interval);
    refreshToken();
  };

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('Email');
    
    if (token) {
      setIsLoggedIn(true);
      if (storedUsername) {
        setEmail(storedUsername);
      }
      setupTokenRefresh();
    } else {
      setIsLoggedIn(false);
      setEmail('');
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  };

  useEffect(() => {
    checkLoginStatus();

    window.addEventListener('storage', checkLoginStatus);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);


  const performLogout = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken');
      console.log('Refresh Token:', refreshTokenValue);
      if (!refreshTokenValue) {
        throw new Error('No refresh token found');
      }
    
      const response = await fetch('https://smart-pharma-net.vercel.app/account/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ refresh: refreshTokenValue }),
      });
      
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }

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
      localStorage.removeItem('pharmacyName');

      setIsMenuOpen(false);
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
   const handlePricingClick = (e: React.MouseEvent) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      e.preventDefault();
      navigate('/pharmacy-login');
    }
  };

  return (
    <div className="bg-indigo-500">
      <ToastContainer />
      <nav className="fixed top-0 left-0 right-0 px-4 py-4 flex justify-between items-center bg-white z-50 shadow-md">
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
            <button 
              className="navbar-burger flex items-center text-indigo-600 p-3 rounded-lg hover:bg-indigo-50 transition-all duration-200" 
              onClick={toggleMenu}
            >
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
                className={({ isActive }) => `text-sm ${isActive ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-500'} transition duration-200`}
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
          to="/pricing"
          className={({ isActive }) => `text-sm ${isActive ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-500'} transition duration-200`}
          onClick={handlePricingClick}
        >
          Pricing
        </NavLink>
            </li>
            <li className="text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" className="w-4 h-4 current-fill" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v0m0 7v0m0 7v0m0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </li>
            <li>
              <NavLink
                to="/exchange"
                className={({ isActive }) => `text-sm ${isActive ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-500'} transition duration-200`}
              >
                Exchange
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
                className={({ isActive }) => `text-sm ${isActive ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-500'} transition duration-200`}
              >
                Available Medicine
              </NavLink>
            </li>
          </ul>
          {isLoggedIn ? (
            <div className="hidden lg:flex items-center space-x-4 relative" ref={dropdownRef}>
              <Link className="ml-4 hover:scale-110 transition-transform duration-200" to="/cart">
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
                <div className="absolute top-14 right-0 bg-white border border-gray-200 rounded-lg shadow-lg animate-fadeIn">
                  <button
                    className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-200"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              className="hidden lg:inline-block lg:ml-auto lg:mr-3 py-2 px-6 bg-indigo-500 hover:bg-indigo-600 text-sm text-white font-bold rounded-xl transition duration-200 hover:shadow-md"
              to="/signin"
            >
              Sign In/Up
            </Link>
          )}
        </div>
      </nav>
      <div className={`navbar-menu relative z-50 ${isMenuOpen ? 'visible' : 'invisible'}`}>
        <div 
          className={`navbar-backdrop fixed inset-0 bg-gray-800 transition-opacity duration-300 ${isMenuOpen ? 'opacity-25' : 'opacity-0'}`} 
          onClick={toggleMenu}
        ></div>
        <nav 
          ref={sidebarRef}
          className="fixed top-0 left-0 bottom-0 flex flex-col w-5/6 max-w-sm py-6 px-6 bg-white border-r overflow-y-auto transform transition-transform duration-300 ease-in-out shadow-2xl"
          style={{ transform: 'translateX(-100%)' }}
        >
          <div className="flex items-center mb-8 sticky top-0 bg-white py-3 px-1 z-50 border-b border-gray-100">
            <Link className="mr-auto text-3xl font-bold leading-none flex items-center gap-2" to="/">
              <img
                src="https://raw.githubusercontent.com/Youssif-Hamdy/logo/refs/heads/main/logo.png"
                alt="Logo"
                className="h-10 w-10"
              />
              <div>
                <span className="text-black">smart</span>
                <span className="text-indigo-600">pharmaNet</span>
              </div>
            </Link>
            <button 
              className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200" 
              onClick={toggleMenu}
            >
              <svg className="h-6 w-6 text-gray-500 cursor-pointer hover:text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div className="mt-6">
            {isLoggedIn && (
              <div className="mb-8 flex items-center space-x-4 p-4 bg-indigo-50 rounded-lg">
                <div className="flex w-12 h-12 items-center justify-center bg-indigo-600 text-white rounded-full shadow-md border-2 border-indigo-700">
                  <span className="text-lg font-semibold">
                    {getInitials(Email)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-indigo-800">{Email}</p>
                  <Link 
                    to="/cart" 
                    className="text-sm text-indigo-600 flex items-center gap-1 mt-1 hover:text-indigo-800 transition-colors duration-200"
                    onClick={toggleMenu}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L4 3m0 0H3m4 10a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z"></path>
                    </svg>
                    View Cart
                  </Link>
                </div>
              </div>
            )}
            <ul className="space-y-1">
              <li>
                <NavLink
                  to="/home"
                  className={({ isActive }) =>
                    `block p-4 text-sm font-semibold ${
                      isActive 
                        ? 'text-indigo-600 bg-indigo-50 border-l-4 border-indigo-600' 
                        : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 border-l-4 border-transparent'
                    } rounded-lg transition-all duration-200 flex items-center`
                  }
                  onClick={toggleMenu}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                  Home
                </NavLink>
              </li>
              <li>
              <NavLink
          to="/pricing"
          className={({ isActive }) =>
            `block p-4 text-sm font-semibold ${
              isActive 
                ? 'text-indigo-600 bg-indigo-50 border-l-4 border-indigo-600' 
                : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 border-l-4 border-transparent'
            } rounded-lg transition-all duration-200 flex items-center`
          }
          onClick={(e) => {
            handlePricingClick(e);
            toggleMenu();
          }}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Pricing
        </NavLink>
              </li>
              <li>
                <NavLink
                  to="/exchange"
                  className={({ isActive }) =>
                    `block p-4 text-sm font-semibold ${
                      isActive 
                        ? 'text-indigo-600 bg-indigo-50 border-l-4 border-indigo-600' 
                        : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 border-l-4 border-transparent'
                    } rounded-lg transition-all duration-200 flex items-center`
                  }
                  onClick={toggleMenu}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  Exchange
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/availablemedicine"
                  className={({ isActive }) =>
                    `block p-4 text-sm font-semibold ${
                      isActive 
                        ? 'text-indigo-600 bg-indigo-50 border-l-4 border-indigo-600' 
                        : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 border-l-4 border-transparent'
                    } rounded-lg transition-all duration-200 flex items-center`
                  }
                  onClick={toggleMenu}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                  </svg>
                  Available Medicine
                </NavLink>
              </li>
            </ul>
          </div>
          <div className="mt-auto">
            <div className="pt-6">
              {isLoggedIn ? (
                <button
                  className="block px-4 py-3 mb-3 text-sm text-center font-semibold leading-none text-white bg-red-500 hover:bg-red-600 rounded-lg w-full transition-all duration-200 shadow-md"
                  onClick={handleLogout}
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    Logout
                  </span>
                </button>
              ) : (
                <Link
                  className="block px-4 py-3 mb-3 text-sm text-center font-semibold leading-none text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all duration-200 shadow-md"
                  to="/signin"
                  onClick={toggleMenu}
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                    </svg>
                    Sign In/Up
                  </span>
                </Link>
              )}
            </div>
            <p className="my-4 text-xs text-center text-gray-500">
              <span>© 2024 smartpharmaNet. All rights reserved.</span>
            </p>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;