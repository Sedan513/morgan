import yahooFinance from 'yahoo-finance2';

export const fetchStockData = async (symbol) => {
  try {
    const quote = await yahooFinance.quote(symbol);
    console.log(quote);
    const historical = await yahooFinance.historical(symbol, {
      period1: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      interval: '1h',
      events: 'history', // This will include split-adjusted prices
    });

    // Get the current price from the quote
    const currentPrice = quote.regularMarketPrice;
    const currentChange = quote.regularMarketChange;
    const currentChangePercent = quote.regularMarketChangePercent;

    // Process historical data to ensure it's in sync with current price
    const processedHistorical = historical.map(data => ({
      time: new Date(data.date).toLocaleTimeString(),
      price: data.close, // This will be split-adjusted
    }));

    return {
      symbol: quote.symbol,
      name: quote.longName,
      price: currentPrice,
      change: currentChange,
      changePercent: currentChangePercent,
      lastUpdated: new Date(quote.regularMarketTime * 1000).toISOString(),
      historicalData: processedHistorical,
    };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    throw error;
  }
};

export const fetchMultipleStocks = async (symbols) => {
  try {
    const stockPromises = symbols.map(symbol => fetchStockData(symbol));
    return await Promise.all(stockPromises);
  } catch (error) {
    console.error('Error fetching multiple stocks:', error);
    throw error;
  }
}; 

// Test fetching a single stock
async function testSingleStock() {
  try {
    const stock = await fetchStockData('AAPL'); // Apple Inc.
    console.log('Single Stock Data:', stock);
  } catch (error) {
    console.error('Single stock test failed:', error);
  }
}

// Test fetching multiple stocks
async function testMultipleStocks() {
  try {
    const stocks = await fetchMultipleStocks(['AAPL', 'GOOGL', 'MSFT']);
    console.log('Multiple Stocks Data:', stocks);
  } catch (error) {
    console.error('Multiple stocks test failed:', error);
  }
}

// Run tests
testSingleStock();
testMultipleStocks();