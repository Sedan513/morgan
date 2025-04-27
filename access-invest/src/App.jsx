// src/App.jsx

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import StockChart from './components/StockChart';
import Rating from './components/Rating';
import AuthPage from './Auth.jsx'; // Fixed import path
import logo from './assets/newlogo2.png'; // Add this at the top
import { useRef } from 'react';

function Dashboard() {
  const [selectedStock, setSelectedStock] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStock, setNewStock] = useState({
    ticker: '',
    name: '',
    shares: '',
    date: ''
  });
  const [stocks, setStocks] = useState([
    {
      ticker: 'AAPL',
      name: 'Apple Inc.',
      lastUpdated: new Date(),
      rating: 5,
      chartData: [
        { date: '2024-01-01', price: 150 },
        { date: '2024-01-02', price: 152 },
        { date: '2024-01-03', price: 148 },
        { date: '2024-01-04', price: 155 },
        { date: '2024-01-05', price: 153 },
      ],
      ratingExplanation: 'Strong earnings report and new product launches'
    },
    {
      ticker: 'GOOGL',
      name: 'Alphabet Inc.',
      lastUpdated: new Date(),
      rating: 3,
      chartData: [
        { date: '2024-01-01', price: 2800 },
        { date: '2024-01-02', price: 2820 },
        { date: '2024-01-03', price: 2790 },
        { date: '2024-01-04', price: 2810 },
        { date: '2024-01-05', price: 2830 },
      ],
      ratingExplanation: 'Stable performance with moderate growth'
    },
    {
      ticker: 'MSFT',
      name: 'Microsoft Corporation',
      lastUpdated: new Date(),
      rating: 4,
      chartData: [
        { date: '2024-01-01', price: 350 },
        { date: '2024-01-02', price: 352 },
        { date: '2024-01-03', price: 355 },
        { date: '2024-01-04', price: 358 },
        { date: '2024-01-05', price: 360 },
      ],
      ratingExplanation: 'Strong cloud services growth and AI initiatives'
    }
  ]);

  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth'); // Redirect to login if not authenticated
    }
  }, [navigate]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth';
  };

  const handleEditAccount = () => {
    window.location.href = '/account';
  };

  const handleAddStockChange = (e) => {
    setNewStock({ ...newStock, [e.target.name]: e.target.value });
  };
  
  const handleAddStockSubmit = (e) => {
    e.preventDefault();
    // Add the new stock to the list (you can replace this with an API call)
    setStocks([
      {
        ticker: newStock.ticker,
        name: newStock.name,
        lastUpdated: new Date(),
        rating: 0,
        chartData: [],
        ratingExplanation: '',
        shares: newStock.shares,
        purchaseDate: newStock.date
      },
      ...stocks
    ]);
    setShowAddModal(false);
    setNewStock({ ticker: '', name: '', shares: '', date: '' });
  };

  return (
    <div className="app-container">
      <header className="app-header">
      <img src={logo} alt="AccessInvest Logo" className="banner-logo" />
      <div className="account-menu-container">
        <button
          className="account-btn"
          onClick={() => setShowDropdown((v) => !v)}
          aria-label="Account"
        >
          {/* Minimalist user icon SVG */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="14" fill="#eee"/>
            <circle cx="14" cy="11" r="5" fill="#bbb"/>
            <ellipse cx="14" cy="20" rx="7" ry="4" fill="#bbb"/>
          </svg>
        </button>
          {showDropdown && (
            <div className="account-dropdown" ref={dropdownRef}>
              <button className="account-dropdown-item" onClick={handleEditAccount}>Edit Account</button>
              <button className="account-dropdown-item logout" onClick={handleLogout}>Log Out</button>
            </div>
          )}
        </div>
      </header>
      <div className="main-content">
        <div className="stock-list">
        <button
            className="add-stock-btn"
            onClick={() => setShowAddModal(true)}
          >
            <span style={{ fontSize: 22, marginRight: 8 }}>＋</span>
            Add Stock
        </button>
          {stocks.map((stock) => (
            <div 
              key={stock.ticker} 
              className="stock-card"
              onClick={() => setSelectedStock(stock)}
            >
              <div className="stock-header">
                <h3>{stock.ticker}</h3>
                <span className="company-name">{stock.name}</span>
              </div>
              <div className="stock-info">
                <p>Last Updated: {stock.lastUpdated.toLocaleString()}</p>
                <Rating value={stock.rating} />
              </div>
              <StockChart data={stock.chartData} size="small" />
            </div>
          ))}
        </div>
        <div className="stock-detail">
          {selectedStock ? (
            <>
              <div className="stock-header">
                <h2>{selectedStock.ticker}</h2>
                <span className="company-name">{selectedStock.name}</span>
              </div>
              <div className="stock-info">
                <p>Last Updated: {selectedStock.lastUpdated.toLocaleString()}</p>
                <Rating value={selectedStock.rating} />
                <p>Explanation: {selectedStock.ratingExplanation}</p>
              </div>
              <StockChart data={selectedStock.chartData} size="large" />
            </>
          ) : (
            <p>Select a stock to view details</p>
          )}
        </div>
      </div>
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add New Stock</h2>
            <form onSubmit={handleAddStockSubmit} className="modal-form">
              <label>
                Ticker
                <input
                  type="text"
                  name="ticker"
                  value={newStock.ticker}
                  onChange={handleAddStockChange}
                  required
                />
              </label>
              <label>
                Company Name
                <input
                  type="text"
                  name="name"
                  value={newStock.name}
                  onChange={handleAddStockChange}
                  required
                />
              </label>
              <label>
                Shares
                <input
                  type="number"
                  name="shares"
                  value={newStock.shares}
                  onChange={handleAddStockChange}
                  required
                  min="1"
                />
              </label>
              <label>
                Purchase Date
                <input
                  type="date"
                  name="date"
                  value={newStock.date}
                  onChange={handleAddStockChange}
                  required
                />
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="add-stock-btn" style={{margin:0}}>Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login/Signup page */}
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Protected dashboard */}
        <Route path="/*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;