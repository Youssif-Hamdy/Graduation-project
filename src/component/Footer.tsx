import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
// @ts-ignore

import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <div className="bg-gray-900 text-white py-10">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start">
              <a href="#" className="text-white hover:text-gray-300 transition duration-300">
                <img src="https://raw.githubusercontent.com/Youssif-Hamdy/logo/refs/heads/main/logo.png" alt="Logo" className="h-10 w-10 mr-2" />
                <span className="text-white">smart </span><span className="text-indigo-400">pharmaNet</span>
              </a>
            </div>
            <p className="text-sm mt-2 text-gray-300">"Serving the finest dishes since 1995!"</p>
          </div>

          <div className="flex flex-col md:flex-row md:space-x-8">
            <a href="/" className="text-white hover:text-gray-300 transition duration-300 text-lg">Home</a>
            <a href="/order" className="text-white hover:text-gray-300 transition duration-300 text-lg">Menu</a>
            <a href="/about" className="text-white hover:text-gray-300 transition duration-300 text-lg">About Us</a>
            <a href="/" className="text-white hover:text-gray-300 transition duration-300 text-lg">Contact Us</a>
          </div>
        </div>

        <hr className="my-6 border-gray-700" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <p className="text-sm text-gray-300">123 Main Street, City, Country</p>
            <p className="text-sm text-gray-300">Phone: +123 456 7890</p>
            <p className="text-sm text-gray-300">Email: info@savoria.com</p>
          </div>

          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4">Opening Hours</h3>
            <p className="text-sm text-gray-300">Mon - Fri: 9:00 AM - 10:00 PM</p>
            <p className="text-sm text-gray-300">Sat - Sun: 10:00 AM - 11:00 PM</p>
          </div>

          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4">Join Our Newsletter</h3>
            <p className="text-sm text-gray-300 mb-4">Subscribe to get exclusive offers and updates.</p>
            <form className="flex flex-col md:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-800 text-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <hr className="my-6 border-gray-700" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-sm text-gray-300">
              &copy; {new Date().getFullYear()} Savoria. All rights reserved.
            </p>
          </div>

          <div className="flex space-x-6">
            <a href="#" className="text-white hover:text-gray-300 transition duration-300">
              <FontAwesomeIcon icon={faFacebookF} className="text-2xl" />
            </a>
            <a href="#" className="text-white hover:text-gray-300 transition duration-300">
              <FontAwesomeIcon icon={faTwitter} className="text-2xl" />
            </a>
            <a href="#" className="text-white hover:text-gray-300 transition duration-300">
              <FontAwesomeIcon icon={faInstagram} className="text-2xl" />
            </a>
            <a href="#" className="text-white hover:text-gray-300 transition duration-300">
              <FontAwesomeIcon icon={faLinkedinIn} className="text-2xl" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}