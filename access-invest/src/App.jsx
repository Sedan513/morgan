import { useState } from 'react'
import './App.css'
import StockChart from './components/StockChart'
import Rating from './components/Rating'

function App() {
  const [selectedStock, setSelectedStock] = useState(null)
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
  ])

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AccessInvest</h1>
      </header>
      <div className="main-content">
        <div className="stock-list">
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
    </div>
  )
}

export default App
