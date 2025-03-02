import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();

  // مراقبة التغييرات في localStorage
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };

    // تحقق من حالة تسجيل الدخول عند تحميل الصفحة
    checkLoginStatus();

    // استمع لتغييرات localStorage
    window.addEventListener('storage', checkLoginStatus);

    // تنظيف الـ event listener عند إلغاء التحميل
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (!confirmLogout) return;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      const response = await fetch('https://smartpharmanet-production.up.railway.app/account/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      const data = await response.json();
      console.log("Logout response:", data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to log out');
      }

      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setIsLoggedIn(false);
      toast.success('Logged out successfully!');
      navigate('/signin');
    } catch (err: any) {
      console.error('Logout error:', err);
      toast.error(err.message || 'An error occurred during logout. Please try again.');
    }
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
                to="/"
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
                to="/medicines"
                className={({ isActive }) => `text-sm ${isActive ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-500'}`}
              >
                Available Medicine
              </NavLink>
            </li>
          </ul>
          {isLoggedIn ? (
            <button
              className="hidden lg:inline-block lg:ml-auto lg:mr-3 py-2 px-6 bg-red-500 hover:bg-red-600 text-sm text-white font-bold rounded-xl transition duration-200"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <Link
              className="hidden lg:inline-block lg:ml-auto lg:mr-3 py-2 px-6 bg-indigo-500 hover:bg-indigo-600 text-sm text-white font-bold rounded-xl transition duration-200"
              to="/signin"
            >
              Sign In/Up
            </Link>
          )}
          <Link className="hidden lg:inline-block ml-4" to="/cart">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L4 3m0 0H3m4 10a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z"></path>
            </svg>
          </Link>
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
            <ul>
              <li className="mb-1">
                <NavLink
                  to="/"
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
                  to="/medicines"
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