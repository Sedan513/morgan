import { useState } from 'react';
import { 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button,
  Box
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const AddStock = ({ onAddStock }) => {
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [error, setError] = useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSymbol('');
    setError('');
  };

  const handleAdd = () => {
    if (!symbol.trim()) {
      setError('Please enter a stock symbol');
      return;
    }
    onAddStock(symbol.trim().toUpperCase());
    handleClose();
  };

  return (
    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
      <IconButton 
        onClick={handleClickOpen}
        sx={{ 
          backgroundColor: 'primary.main',
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark',
          }
        }}
      >
        <AddIcon />
      </IconButton>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Stock</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Stock Symbol"
            type="text"
            fullWidth
            variant="outlined"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            error={!!error}
            helperText={error}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAdd();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddStock; 