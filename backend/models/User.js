import mongoose from 'mongoose';
import { fetch8KHtmlFromTicker } from '../sec-functions/fetch8K.js';
import { fetch10KHtmlFromTicker } from '../sec-functions/fetch10K.js';
import { fetch10QHtmlFromTicker } from '../sec-functions/fetch10Q.js';
import { getNews } from '../sec-functions/getNews.js';
import { fetchFilingSection } from '../sec-functions/fetch.js';

// Each stock the user owns
const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true },    // e.g., "AAPL"
  quantity: { type: Number, required: true },   // Number of shares
  averagePrice: { type: Number, required: true } // Average purchase price
});

// User schema with full profile
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  hashedPassword: {
    type: String,
    required: [true, 'Password is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [1, 'Age must be greater than 0']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  stocks: [stockSchema]
}, {
  timestamps: true // createdAt, updatedAt fields
});

// Add index for email
userSchema.index({ email: 1 }, { unique: true });

// --- Instance methods ---

// Add a stock
userSchema.methods.addStock = function(symbol, quantity, averagePrice) {
  this.stocks.push({ symbol, quantity, averagePrice });
  return this.save();
};

// Update an existing stock
userSchema.methods.updateStock = function(symbol, newQuantity, newAveragePrice) {
  const stock = this.stocks.find(s => s.symbol === symbol);
  if (stock) {
    stock.quantity = newQuantity;
    stock.averagePrice = newAveragePrice;
  }
  return this.save();
};

// Remove a stock
userSchema.methods.removeStock = function(symbol) {
  this.stocks = this.stocks.filter(s => s.symbol !== symbol);
  return this.save();
};

userSchema.methods.generateGeminiPromptData = async function() { 
  let stockSummary = 'Below is a summary of the stocks in your portfolio. Please provide a detailed analysis of each stock, including recent news and any relevant filings that would help users of this applications make decisions on what to do with the. Analysze the documents and make suggestiosn out of them. Do not just summarize the document, analyze them in a way that makes it simple to understand and sentimentally analyze how this would effect the stock price';

  for (const stock of this.stocks) {
    const { symbol, quantity, averagePrice } = stock;

    let eightK = "N/A", tenK = "N/A", tenQ = "N/A";

    try {
      eightK = await fetchFilingSection("8-K", symbol);
    } catch (err) {
      console.warn(`8-K fetch failed for ${symbol}:`, err.message);
    }

    try {
      tenk = await fetchFilingSection("10-K", symbol);
    } catch (err) {
      console.warn(`10-K fetch failed for ${symbol}:`, err.message);
    }

    try {
      tenQ = await fetchFilingSection("10-Q", symbol);
    } catch (err) {
      console.warn(`10-Q fetch failed for ${symbol}:`, err.message);
    }

    stockSummary += `\nStock: ${symbol}\n`;
    stockSummary += `Quantity: ${quantity}\n`;
    stockSummary += `Average Price: ${averagePrice}\n`;
    stockSummary += `8-K: ${eightK}\n`;
    stockSummary += `10-K: ${tenK}\n`;
    stockSummary += `10-Q: ${tenQ}\n`;
    stockSummary += `News: ${await getNews(symbol).splice(0,1000)}\n`;
  }

  return stockSummary;
};

export default mongoose.model('User', userSchema);



/*

Name: Sebastian Rincon
Age: 22
Location: New York, NY
Birthday: 2002-03-15

Stock Portfolio:
Symbol: AAPL
Shares: 10
Average Price: $148.50
8-K: Apple Inc. announced its quarterly earnings for the fiscal year 2024...
10-K: Apple Inc. 2023 Annual Report filed with the SEC...
10-Q: Apple Inc. Q1 2024 Quarterly Report shows strong growth in services...

-------------------
Symbol: TSLA
Shares: 5
Average Price: $720.00
8-K: Tesla announces launch of new Model Z...
10-K: Tesla 2023 Annual Report highlights expansion in Asia...
10-Q: Tesla Q2 2024 Quarterly Results...

*/