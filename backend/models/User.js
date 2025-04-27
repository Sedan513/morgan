const mongoose = require('mongoose');

const { fetch8KHtmlFromTicker } = require('../sec-functions/fetch8K');   
const { fetch10KHtmlFromTicker } = require('../sec-functions/fetch10K');
const { fetch10QHtmlFromTicker } = require('../sec-functions/fetch10Q');
const { getNews } = require('../sec-functions/getNews');

// Each stock the user owns
const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true },    // e.g., "AAPL"
  quantity: { type: Number, required: true },   // Number of shares
  averagePrice: { type: Number, required: true }, // Average purchase price
  tenKSummary: { type: String, default: "" },    // Summary of 10-K filing
  tenQSummary: { type: String, default: "" },    // Summary of 10-Q filing
  eightKSummary: { type: String, default: "" },  // Summary of 8-K filing
  sentimentScore: { type: Number, default: 0 }   // Sentiment score (1-5)
});

// User schema with full profile
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  hashedPassword: { type: String, required: true },

  // New profile fields
  name: { type: String, required: true, trim: true },   // Full Name
  age: { type: Number, required: true },                // Age
  location: { type: String, trim: true },               // City / State / Country
  birthday: { type: Date },                             // Birthday Date

  // Stock portfolio
  stocks: [stockSchema],
  
}, {
  timestamps: true // createdAt, updatedAt fields
});

// --- Instance methods ---

// Add a stock
userSchema.methods.addStock = function(symbol, quantity, averagePrice) {
  this.stocks.push({ 
    symbol, 
    quantity, 
    averagePrice,
    tenKSummary: "",
    tenQSummary: "",
    eightKSummary: "",
    sentimentScore: 0
  });
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

// Update 10-K summary for a stock
userSchema.methods.updateTenKSummary = async function(symbol, summary) {
  const stock = this.stocks.find(s => s.symbol === symbol);
  if (stock) {
    stock.tenKSummary = summary;
  }
  return this.save();
};

// Update 10-Q summary for a stock
userSchema.methods.updateTenQSummary = async function(symbol, summary) {
  const stock = this.stocks.find(s => s.symbol === symbol);
  if (stock) {
    stock.tenQSummary = summary;
  }
  return this.save();
};

// Update 8-K summary for a stock
userSchema.methods.updateEightKSummary = async function(symbol, summary) {
  const stock = this.stocks.find(s => s.symbol === symbol);
  if (stock) {
    stock.eightKSummary = summary;
  }
  return this.save();
};

// Update sentiment score for a stock
userSchema.methods.updateSentimentScore = async function(symbol, score) {
  const stock = this.stocks.find(s => s.symbol === symbol);
  if (stock) {
    stock.sentimentScore = score;
  }
  return this.save();
};

userSchema.methods.generateGeminiPromptData = async function() { 
  let stockSummary = '';

  for (const stock of this.stocks) {
    const { symbol, quantity, averagePrice } = stock;

    let eightK = "N/A", tenK = "N/A", tenQ = "N/A";

    try {
      eightK = await fetch8KHtmlFromTicker(symbol);
    } catch (err) {
      console.warn(`8-K fetch failed for ${symbol}:`, err.message);
    }

    try {
      tenK = await fetch10KHtmlFromTicker(symbol);
    } catch (err) {
      console.warn(`10-K fetch failed for ${symbol}:`, err.message);
    }

    try {
      tenQ = await fetch10QHtmlFromTicker(symbol);
    } catch (err) {
      console.warn(`10-Q fetch failed for ${symbol}:`, err.message);
    }
    try {
        news = await getNews(symbol);
    } catch (err) {
        console.warn(`News fetch failed for ${symbol}:`, err.message);
    }

      stockSummary += `
  Symbol: ${symbol}
  Shares: ${quantity}
  Average Price: $${averagePrice.toFixed(2)}
  8-K: ${eightK.substring(0, 1000)}${eightK.length > 1000 ? "..." : ""}
  10-K: ${tenK.substring(0, 1000)}${tenK.length > 1000 ? "..." : ""}
  10-Q: ${tenQ.substring(0, 1000)}${tenQ.length > 1000 ? "..." : ""}
  
  -------------------
  `;
      } 
  return `
  Goal: Below, I include a full profile for a user, including their stock portfolio. For each stock, there are the latest 8-K, 10-K, and 10-Q filings, ignore the news section right now. For each stock, I want you to give a concise summary of the most important information in the filings that a user should know. After the 8k, 10k, 10q info is top headlines about the current market, using this, give a sentiment analysis of the news, rank it from 1-10 integers on how positive the news is, and give a brief explanation of why you gave that score. 1 being very negative and 10 being very positive. Prioritize the information of the stocks that the user has the most value in.
  Name: ${this.name}
  Age: ${this.age}
  Location: ${this.location}
  Birthday: ${this.birthday ? this.birthday.toISOString().split('T')[0] : 'N/A'}
  
  Stock Portfolio:
  ${stockSummary.length > 0 ? stockSummary : 'No stocks owned yet.'}
    `.trim();
  };

const User = mongoose.model('User', userSchema);

module.exports = User;



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