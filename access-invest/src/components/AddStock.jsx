import { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Separate component for the Add Stock button
export const AddStockButton = ({ onClick }) => (
  <Button 
    onClick={onClick} 
    variant="contained" 
    startIcon={<AddIcon />}
    fullWidth
    sx={{ 
      height: '48px',
      borderRadius: '8px',
      textTransform: 'none',
      fontSize: '1rem',
      backgroundColor: '#1976d2',
      '&:hover': {
        backgroundColor: '#1565c0',
      }
    }}
  >
    Add Stock
  </Button>
);

// Separate component for the Add Stock dialog
export const AddStockDialog = ({ open, onClose, onAdd }) => {
  const [symbol, setSymbol] = useState('');

  const handleAdd = () => {
    if (symbol.trim()) {
      onAdd(symbol.trim().toUpperCase());
      setSymbol('');
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '300px',
          width: '600px',
          maxHeight: 'calc(100vh - 200px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle sx={{ 
        fontSize: '1.5rem', 
        textAlign: 'center', 
        pb: 1,
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #e0e0e0'
      }}>
        Add New Stock
      </DialogTitle>
      <DialogContent sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 0, 
        padding: '8px 24px',
        overflow: 'auto',
        flex: 1
      }}>
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
      <DialogActions sx={{ 
        padding: '4px 24px 16px', 
        mt: 0,
        backgroundColor: '#f5f5f5',
        borderTop: '1px solid #e0e0e0'
      }}>
        <Button 
          onClick={onClose} 
          sx={{ 
            fontSize: '1.1rem', 
            padding: '8px 24px',
            color: '#666'
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleAdd} 
          variant="contained"
          sx={{ 
            fontSize: '1.1rem', 
            padding: '8px 24px',
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0',
            }
          }}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main component that combines both
const AddStock = ({ onAdd }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddStockButton onClick={() => setOpen(true)} />
      <AddStockDialog 
        open={open} 
        onClose={() => setOpen(false)} 
        onAdd={onAdd} 
      />
    </>
  );
};

export default AddStock; 