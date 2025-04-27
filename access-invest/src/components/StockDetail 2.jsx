import { Card, CardContent, Typography, Box } from '@mui/material';
import StockChart from './StockChart';

const StockDetail = ({ stock }) => {
  const getChangeColor = (change) => {
    if (change > 0) return 'success.main';
    if (change < 0) return 'error.main';
    return 'text.secondary';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatChange = (change, changePercent) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${formatPrice(change)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="div">
            {stock.symbol}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {stock.name}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" component="div">
            {formatPrice(stock.price)}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: getChangeColor(stock.change),
              fontWeight: 'bold',
            }}
          >
            {formatChange(stock.change, stock.changePercent)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last updated: {formatDate(stock.lastUpdated)}
          </Typography>
        </Box>

        <Box sx={{ height: 300, mb: 3 }}>
          <StockChart data={stock.historicalData} size="large" />
        </Box>
      </CardContent>
    </Card>
  );
};

export default StockDetail; 