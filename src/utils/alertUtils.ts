import { AlertSeverity, DisasterType, DisasterAlert } from '../models/types';

// Get color for alert severity
export const getSeverityColor = (severity: AlertSeverity): string => {
  switch (severity) {
    case AlertSeverity.CRITICAL:
      return '#ff0000'; // Red
    case AlertSeverity.HIGH:
      return '#ff9900'; // Orange
    case AlertSeverity.MEDIUM:
      return '#ffcc00'; // Yellow
    case AlertSeverity.LOW:
      return '#3399ff'; // Blue
    default:
      return '#999999'; // Gray
  }
};

// Get icon for disaster type
export const getDisasterIcon = (type: DisasterType): string => {
  switch (type) {
    case DisasterType.EARTHQUAKE:
      return '🏚️';
    case DisasterType.FLOOD:
      return '🌊';
    case DisasterType.WILDFIRE:
      return '🔥';
    case DisasterType.HURRICANE:
      return '🌀';
    case DisasterType.TSUNAMI:
      return '🌊';
    default:
      return '⚠️';
  }
};

// Format timestamp to readable date
export const formatAlertTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

// Get human-readable severity
export const getSeverityLabel = (severity: AlertSeverity): string => {
  switch (severity) {
    case AlertSeverity.CRITICAL:
      return 'Critical';
    case AlertSeverity.HIGH:
      return 'High';
    case AlertSeverity.MEDIUM:
      return 'Medium';
    case AlertSeverity.LOW:
      return 'Low';
    default:
      return 'Unknown';
  }
};

// Get human-readable disaster type
export const getDisasterTypeLabel = (type: DisasterType): string => {
  switch (type) {
    case DisasterType.EARTHQUAKE:
      return 'Earthquake';
    case DisasterType.FLOOD:
      return 'Flood';
    case DisasterType.WILDFIRE:
      return 'Wildfire';
    case DisasterType.HURRICANE:
      return 'Hurricane';
    case DisasterType.TSUNAMI:
      return 'Tsunami';
    default:
      return 'Unknown';
  }
};

// Sort alerts by severity (critical first)
export const sortAlertsBySeverity = (alerts: DisasterAlert[]): DisasterAlert[] => {
  const severityOrder = {
    [AlertSeverity.CRITICAL]: 0,
    [AlertSeverity.HIGH]: 1,
    [AlertSeverity.MEDIUM]: 2,
    [AlertSeverity.LOW]: 3
  };
  
  return [...alerts].sort((a, b) => {
    // First sort by severity
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    
    // Then sort by timestamp (newer first)
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return dateB - dateA;
  });
};
