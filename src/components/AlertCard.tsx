import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Paper, 
  Typography, 
  Chip, 
  Box, 
  Button, 
  Divider, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText 
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { DisasterAlert } from '../models/types';
import { 
  getSeverityColor, 
  getDisasterIcon, 
  formatAlertTime, 
  getSeverityLabel 
} from '../utils/alertUtils';

interface AlertCardProps {
  alert: DisasterAlert;
  compact?: boolean;
  onClick?: () => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, compact = false, onClick }) => {
  const navigate = useNavigate();
  const severityColor = getSeverityColor(alert.severity);
  const disasterIcon = getDisasterIcon(alert.type);
  
  const handleViewDetails = () => {
    navigate(`/alerts/${alert.id}`);
  };
  
  return (
    <Paper 
      elevation={1}
      className="alert-card"
      onClick={onClick}
      sx={{ 
        borderLeft: `5px solid ${severityColor}`,
        borderRadius: '8px',
        p: 2,
        mb: 2,
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
          transform: 'translateY(-4px)'
        },
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6" component="h3" sx={{ display: 'flex', alignItems: 'center' }}>
          <span role="img" aria-label="disaster icon" style={{ marginRight: '8px', fontSize: '1.5rem' }}>
            {disasterIcon}
          </span>
          {alert.title}
        </Typography>
        <Chip
          label={getSeverityLabel(alert.severity)}
          sx={{
            bgcolor: severityColor,
            color: 'white',
            fontWeight: 'bold',
            '& .MuiChip-label': { px: 1 }
          }}
        />
      </Box>
      
      <Box display="flex" alignItems="center" gap={2} mb={1.5}>
        <Box display="flex" alignItems="center">
          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {formatAlertTime(alert.timestamp)}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {alert.location.name}
          </Typography>
        </Box>
      </Box>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        {alert.description}
      </Typography>
      
      {!compact && alert.safetyTips.length > 0 && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Safety Tips:
          </Typography>
          <List dense disablePadding>
            {alert.safetyTips.slice(0, 3).map((tip, index) => (
              <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <CheckCircleIcon fontSize="small" sx={{ color: severityColor }} />
                </ListItemIcon>
                <ListItemText 
                  primary={tip} 
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
          {alert.safetyTips.length > 3 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              +{alert.safetyTips.length - 3} more tips
            </Typography>
          )}
        </>
      )}
      
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button
          variant="text"
          color="primary"
          size="small"
          onClick={handleViewDetails}
          endIcon={<ArrowForwardIcon />}
          sx={{ color: severityColor }}
        >
          View Details
        </Button>
      </Box>
    </Paper>
  );
};

export default AlertCard; 