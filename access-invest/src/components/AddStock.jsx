import { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const AddStock = ({ onAdd }) => {
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleAdd = () => {
    if (symbol.trim()) {
      onAdd(symbol.trim().toUpperCase());
      setSymbol('');
      handleClose();
    }
  };

  return (
    <>
      <Button 
        onClick={handleOpen} 
        variant="contained" 
        startIcon={<AddIcon />}
        fullWidth
        sx={{ 
          height: '48px',
          borderRadius: '8px',
          textTransform: 'none',
          fontSize: '1rem'
        }}
      >
        Add Stock
      </Button>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '300px',
            width: '600px'
          }
        }}
      >
        <DialogTitle sx={{ fontSize: '1.5rem', textAlign: 'center', pb: 1 }}>Add New Stock</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '8px 24px' }}>
          <TextField
            autoFocus
            margin="none"
            label="Ticker Symbol"
            fullWidth
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: '1.2rem',
                height: '60px'
              },
              '& .MuiInputLabel-root': {
                fontSize: '1.1rem'
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ padding: '4px 24px 16px', mt: 0 }}>
          <Button 
            onClick={handleClose} 
            sx={{ fontSize: '1.1rem', padding: '8px 24px' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAdd} 
            variant="contained"
            sx={{ fontSize: '1.1rem', padding: '8px 24px' }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddStock; 