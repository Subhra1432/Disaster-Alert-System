import React from 'react';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Button, 
  Chip, 
  Box 
} from '@mui/material';
import DirectionsIcon from '@mui/icons-material/Directions';
import PersonIcon from '@mui/icons-material/Person';
import { SafetyShelter } from '../models/types';

interface ShelterCardProps {
  shelter: SafetyShelter;
  elevation?: number;
  userLocation?: { latitude: number; longitude: number };
  onClick?: () => void;
}

const ShelterCard: React.FC<ShelterCardProps> = ({
  shelter,
  elevation = 1,
  userLocation,
  onClick
}) => {
  return (
    <Card 
      elevation={elevation}
      onClick={onClick}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        },
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h3" gutterBottom>
          {shelter.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Address:</strong> {shelter.address}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <PersonIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            <strong>Capacity:</strong> {shelter.capacity} people
          </Typography>
        </Box>
        <Typography variant="body2" gutterBottom>
          <strong>Status:</strong>{' '}
          <Chip 
            label={shelter.available ? 'Open' : 'Full'} 
            color={shelter.available ? 'success' : 'error'}
            size="small"
          />
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          variant="outlined"
          size="small"
          color="primary"
          startIcon={<DirectionsIcon />}
          href={`https://maps.google.com/?q=${shelter.coordinates.latitude},${shelter.coordinates.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          fullWidth
        >
          Get Directions
        </Button>
      </CardActions>
    </Card>
  );
};

export default ShelterCard; 