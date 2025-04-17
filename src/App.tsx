import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import PhoneIcon from '@mui/icons-material/Phone';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import './App.css';
import HomePage from './pages/HomePage';
import AlertDetailPage from './pages/AlertDetailPage';
import ReportPage from './pages/ReportPage';

// LiveClock component to display real-time updates
const LiveClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      background: 'rgba(0,0,0,0.1)', 
      px: 2, 
      py: 0.5, 
      borderRadius: 1,
      marginRight: 2 
    }}>
      <AccessTimeIcon sx={{ mr: 1, fontSize: '0.9rem' }} />
      <Typography variant="body2">
        {currentTime.toLocaleTimeString()} | {currentTime.toLocaleDateString()}
      </Typography>
    </Box>
  );
};

// Emergency contact component
const EmergencyContact = () => {
  return (
    <Paper 
      elevation={0}
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 1.5, 
        borderRadius: '10px',
        backgroundColor: 'error.main',
        color: 'white',
        mb: 3,
        boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)'
      }}
    >
      <PhoneIcon sx={{ mr: 2 }} />
      <Box>
        <Typography variant="subtitle1" fontWeight="bold">
          Emergency Contact
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
          <Chip 
            label="911 (US)" 
            size="small" 
            sx={{ 
              backgroundColor: 'white', 
              color: 'error.main',
              fontWeight: 'bold' 
            }} 
          />
          <Chip 
            label="112 (EU)" 
            size="small" 
            sx={{ 
              backgroundColor: 'white', 
              color: 'error.main',
              fontWeight: 'bold' 
            }} 
          />
          <Chip 
            label="108 (India)" 
            size="small" 
            sx={{ 
              backgroundColor: 'white', 
              color: 'error.main',
              fontWeight: 'bold' 
            }} 
          />
        </Box>
      </Box>
    </Paper>
  );
};

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Create a theme with red primary color for disaster alerts and dark mode support
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#d32f2f',
      },
      secondary: {
        main: darkMode ? '#2c2c2c' : '#f5f5f5',
      },
      background: {
        default: darkMode ? '#121212' : '#f8f9fa',
        paper: darkMode ? '#1e1e1e' : '#ffffff'
      },
      error: {
        main: '#d32f2f'
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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          backgroundColor: 'background.default' 
        }}>
          <AppBar position="static" color="primary" elevation={0}>
            <Toolbar>
              <WarningIcon sx={{ mr: 1 }} />
              <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, color: 'white', textDecoration: 'none' }}>
                Disaster Alert System
              </Typography>
              <LiveClock />
              <IconButton 
                color="inherit" 
                onClick={toggleDarkMode} 
                sx={{ mr: 2 }}
                aria-label="toggle dark mode"
              >
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
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
          
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
            <EmergencyContact />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/alerts/:id" element={<AlertDetailPage />} />
              <Route path="/report" element={<ReportPage />} />
            </Routes>
          </Container>
          
          <Paper 
            component="footer" 
            square 
            elevation={0}
            sx={{ 
              padding: '24px', 
              textAlign: 'center',
              marginTop: 'auto',
              borderTop: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper'
            }}
          >
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Disaster Alert System
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Emergency Numbers
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label="911 (US)" color="error" size="small" icon={<PhoneIcon />} />
                  <Chip label="112 (EU)" color="error" size="small" icon={<PhoneIcon />} />
                  <Chip label="108 (India)" color="error" size="small" icon={<PhoneIcon />} />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Stay Prepared
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Keep emergency supplies ready and stay updated with alerts
                </Typography>
              </Grid>
            </Grid>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              © {new Date().getFullYear()} Disaster Alert System | Real-time monitoring for emergency situations
            </Typography>
          </Paper>
        </Box>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App; 