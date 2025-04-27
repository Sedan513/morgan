// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';

import StockChart from './components/StockChart';
import Rating from './components/Rating';
import AddStock from './components/AddStock';
import AuthPage from './Auth.jsx';

import { UserProvider, useUser } from './contexts/UserContext';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';

function AppContent() {
  const { user, loading } = useUser();
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

  const [selectedStock, setSelectedStock] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');

  const handleAddStock = (symbol) => {
    const newStock = {
      ticker: symbol,
      name: `${symbol} Inc.`,
      lastUpdated: new Date(),
      rating: Math.floor(Math.random() * 5) + 1,
      chartData: [
        { date: '2024-01-01', price: 100 },
        { date: '2024-01-02', price: 102 },
        { date: '2024-01-03', price: 98 },
        { date: '2024-01-04', price: 105 },
        { date: '2024-01-05', price: 103 },
      ],
      ratingExplanation: 'Newly added stock'
    };
    setStocks([newStock, ...stocks]);
  };

  const handleOpenAddDialog = () => setOpenAddDialog(true);
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewSymbol('');
  };
  const handleSubmitNewStock = () => {
    if (newSymbol.trim()) {
      handleAddStock(newSymbol.trim().toUpperCase());
      handleCloseAddDialog();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AccessInvest</h1>
        {user && <div className="user-info">Welcome, {user.name}</div>}
      </header>

      <div className="main-content">
        <div className="stock-list">
          <div className="stock-list-header">
            <Button
              variant="contained"
              onClick={handleOpenAddDialog}
              fullWidth
              sx={{ height: '48px', fontSize: '1.1rem', fontWeight: 'bold' }}
            >
              Add Stock
            </Button>
          </div>

          {stocks.map(stock => (
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

      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            minWidth: '400px',
            minHeight: '300px',
            '& .MuiDialogTitle-root': { fontSize: '1.5rem' },
          }
        }}
      >
        <DialogTitle>Add New Stock</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Ticker Symbol"
            fullWidth
            value={newSymbol}
            onChange={e => setNewSymbol(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSubmitNewStock()}
            sx={{ '& .MuiInputLabel-root': { fontSize: '1.2rem' } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitNewStock}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/auth');
    }
  }, [navigate]);

  return <AppContent />;
}

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/*" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;

