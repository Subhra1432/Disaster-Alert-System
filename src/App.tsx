import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import WarningIcon from '@mui/icons-material/Warning';
import './App.css';
import HomePage from './pages/HomePage';
import AlertDetailPage from './pages/AlertDetailPage';
import ReportPage from './pages/ReportPage';

// Create a theme with red primary color for disaster alerts
const theme = createTheme({
  palette: {
    primary: {
      main: '#d32f2f',
    },
    secondary: {
      main: '#f5f5f5',
    },
    background: {
      default: '#f8f9fa'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppBar position="static" color="primary" elevation={0}>
          <Toolbar>
            <WarningIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, color: 'white', textDecoration: 'none' }}>
              Disaster Alert System
            </Typography>
            <Button 
              component={Link} 
              to="/report" 
              color="inherit" 
              variant="outlined" 
              sx={{ 
                borderColor: 'white', 
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: 'white'
                } 
              }}
            >
              Report Disaster
            </Button>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/alerts/:id" element={<AlertDetailPage />} />
            <Route path="/report" element={<ReportPage />} />
          </Routes>
        </Container>
        
        <footer style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '16px', 
          textAlign: 'center',
          marginTop: 'auto',
          borderTop: '1px solid #ddd'
        }}>
          <Typography variant="body2" color="text.secondary">
            Disaster Alert System © {new Date().getFullYear()} | Real-time monitoring for emergency situations
          </Typography>
        </footer>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App; 