import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AboutUs from './pages/aboutus';
import FarmStore from './pages/FarmStore';
import CotactUs from './pages/contactus';
import UserProfile from './pages/UserProfile';
import Checkout from './pages/checkout';



function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<FarmStore />} />
          <Route path="/store" element={<FarmStore />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<CotactUs />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
