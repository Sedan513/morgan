const mongoose = require('mongoose');

// Each stock the user owns
const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true },    // e.g., "AAPL"
  quantity: { type: Number, required: true },   // Number of shares
  averagePrice: { type: Number, required: true } // Average purchase price
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

userSchema.methods.generateGeminiPromptData = function() {
    const stockSummary = this.stocks.map(stock => 
      `${stock.quantity} shares of ${stock.symbol} at an average price of $${stock.averagePrice.toFixed(2)}`
    ).join(', ');
  
    return `
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