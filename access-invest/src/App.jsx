// src/App.jsx

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import StockChart from './components/StockChart';
import Rating from './components/Rating';
import AuthPage from './Auth.jsx'; // Fixed import path
import logo from './assets/newlogo2.png'; // Add this at the top
import { useRef } from 'react';
import { fetchSecFiling } from '../geminiFunctions/fetchSec.js';
import { fetchGeminiContent } from '../geminiFunctions/geminiRequest.js';
import { fetchFullUserProfile } from '../geminiFunctions/fetchFullUserProfile.js';
import { fetchPrices } from '../geminiFunctions/fetchSec.js';

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
      ]
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
      ]
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
      ]
    }
  ]);
  const [loadingExplanations, setLoadingExplanations] = useState(false);

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
  
  const handleAddStockSubmit = async (e) => {
    e.preventDefault();
    setLoadingExplanations(true);
    try {
      const token = localStorage.getItem('token');
      // 1. Add the stock to the backend
      const response = await fetch('http://localhost:5001/api/add-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ticker: newStock.ticker,
          name: newStock.name,
          shares: newStock.shares,
          date: newStock.date
        })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Failed to add stock');
        return;
      }

      // 2. Fetch Gemini explanations for the new stock
      const tenKData = await fetchSecFiling(newStock.ticker, '10K');
      const tenQData = await fetchSecFiling(newStock.ticker, '10Q');
      const eightKData = await fetchSecFiling(newStock.ticker, '8K');
      const explanation10K = await fetchGeminiContent(`Summarize the following 10-K filing in a short paragraph. ${tenKData}`);
      const explanation10Q = await fetchGeminiContent(`Summarize the following 10-Q filing in a short paragraph. ${tenQData}.`);
      const explanation8K = await fetchGeminiContent(`Summarize the following 8-K filing in a short paragraph. ${eightKData}.`);
      const recentNews = await fetchGeminiContent(newStock.ticker);
      const rateRaw = await fetchGeminiContent(`return a integer between 1 and 5 that describes the sentiment of the news headlines where 1 means sentiment is very negative and 5 means the sentiment is very positive return only an integer and nothing else. ${recentNews}.`);
      let rate = parseInt(rateRaw, 10);
      if (isNaN(rate) || rate < 1 || rate > 5) {
        rate = 3; // Default to Neutral if invalid
      }
      console.log(rate);
      // Fetch chart data for the new stock
      let dat = [];
      try {
        dat = await fetchPrices(newStock.ticker);
        // Format each date to 'YYYY-MM-DD'
        dat = dat.map(item => ({
          ...item,
          date: item.date.split('T')[0] // Removes the time part
        }));
      } catch (err) {
        console.error('Failed to fetch chart data:', err);
        dat = [];
      }
      console.log(dat);
      // 3. Add the new stock with its explanations to the state
      const newStockWithData = {
        ...newStock,
        lastUpdated: new Date(),
        rating: rate,
        chartData: dat,
        explanation10K,
        explanation10Q,
        explanation8K,
      };

      setStocks(prevStocks => [newStockWithData, ...prevStocks]);
      setShowAddModal(false);
      setNewStock({ ticker: '', name: '', shares: '', date: '' });
    } catch (err) {
      alert('Network error');
    } finally {
      setLoadingExplanations(false);
    }
  };

  const handleStockSelect = (stock) => {
    setSelectedStock(stock);
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
        {loadingExplanations ? (
          <div style={{ padding: '2rem', width: '100%' }}>Loading stock explanations...</div>
        ) : (
          <>
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
                  onClick={() => handleStockSelect(stock)}
                >
                  <div className="stock-header">
                    <h3>{stock.ticker}</h3>
                    <span className="company-name">{stock.name}</span>
                  </div>
                  <div className="stock-info">
                    <p>
                      Last Updated:{" "}
                      {stock.lastUpdated
                        ? new Date(stock.lastUpdated).toLocaleString()
                        : "N/A"}
                    </p>
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
                    <p>
                      Last Updated:{" "}
                      {selectedStock.lastUpdated
                        ? new Date(selectedStock.lastUpdated).toLocaleString()
                        : "N/A"}
                    </p>
                    <Rating value={selectedStock.rating} />
                    {selectedStock.explanation10K && (
                      <div>
                        <strong>10-K Summary:</strong>
                        <p>{selectedStock.explanation10K}</p>
                      </div>
                    )}
                    {selectedStock.explanation10Q && (
                      <div>
                        <strong>10-Q Summary:</strong>
                        <p>{selectedStock.explanation10Q}</p>
                      </div>
                    )}
                    {selectedStock.explanation8K && (
                      <div>
                        <strong>8-K Summary:</strong>
                        <p>{selectedStock.explanation8K}</p>
                      </div>
                    )}
                  </div>
                  <StockChart data={selectedStock.chartData} size="large" />
                </>
              ) : (
                <p>Select a stock to view details</p>
              )}
            </div>
          </>
        )}
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