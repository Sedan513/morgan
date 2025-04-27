import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const addStock = (symbol, quantity, averagePrice) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      stocks: [
        ...user.stocks,
        { symbol, quantity, averagePrice }
      ]
    };
    setUser(updatedUser);
  };

  const removeStock = (symbol) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      stocks: user.stocks.filter(stock => stock.symbol !== symbol)
    };
    setUser(updatedUser);
  };

  return (
    <UserContext.Provider value={{
      user,
      loading,
      login,
      logout,
      updateUser,
      addStock,
      removeStock
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 