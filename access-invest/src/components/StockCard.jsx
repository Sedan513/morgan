import { Card, CardContent, Typography, Box } from '@mui/material';
import StockChart from './StockChart';

const StockCard = ({ stock, onClick, isSelected }) => {
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

  return (
    <Card
      onClick={onClick}
      sx={{
        mb: 2,
        cursor: 'pointer',
        border: isSelected ? 2 : 0,
        borderColor: 'primary.main',
        '&:hover': {
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" component="div">
              {stock.symbol}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stock.name}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" component="div">
              {formatPrice(stock.price)}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: getChangeColor(stock.change),
                fontWeight: 'bold',
              }}
            >
              {formatChange(stock.change, stock.changePercent)}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ height: 100 }}>
          <StockChart data={stock.historicalData} size="small" />
        </Box>
      </CardContent>
    </Card>
  );
};

export default StockCard; 