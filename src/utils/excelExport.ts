import { DisasterAlert, SafetyShelter } from '../models/types';

/**
 * Utility functions to export Disaster Alert System data to CSV format
 * for use with Excel or other spreadsheet applications
 */

/**
 * Convert an array of objects to CSV format
 * @param data Array of objects to convert
 * @param headers Object with keys as data properties and values as column headers
 * @returns CSV formatted string
 */
const convertToCSV = (data: any[], headers: Record<string, string>): string => {
  if (data.length === 0) return '';
  
  // Create header row
  const headerRow = Object.values(headers).join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return Object.keys(headers)
      .map(key => {
        // Handle nested properties with dot notation (e.g., "location.name")
        const value = key.includes('.')
          ? key.split('.').reduce((obj, part) => obj && obj[part], item)
          : item[key];
        
        // Handle arrays and objects by converting to JSON
        let cellValue = value;
        if (Array.isArray(value) || typeof value === 'object') {
          cellValue = JSON.stringify(value);
        }
        
        // Escape commas and quotes in cell values
        if (cellValue === null || cellValue === undefined) {
          return '';
        } else {
          const stringValue = String(cellValue);
          // If the value contains commas, quotes, or newlines, wrap it in quotes and escape any existing quotes
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }
      })
      .join(',');
  });
  
  // Combine header and data rows
  return [headerRow, ...rows].join('\n');
};

/**
 * Generate a filename with the current date and time
 * @param prefix Prefix for the filename
 * @returns Filename with date/time stamp
 */
const generateFilename = (prefix: string): string => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  return `${prefix}_${dateStr}_${timeStr}.csv`;
};

/**
 * Export disaster alerts to CSV and trigger download
 * @param alerts Array of disaster alerts to export
 */
export const exportAlertsToCSV = (alerts: DisasterAlert[]): void => {
  const headers = {
    'id': 'ID',
    'type': 'Disaster Type',
    'severity': 'Severity Level',
    'title': 'Title',
    'description': 'Description',
    'location.name': 'Location Name',
    'location.coordinates.latitude': 'Latitude',
    'location.coordinates.longitude': 'Longitude',
    'safetyTips': 'Safety Tips',
    'timestamp': 'Timestamp',
    'radius': 'Radius (km)',
    'active': 'Active'
  };
  
  const csvContent = convertToCSV(alerts, headers);
  downloadCSV(csvContent, generateFilename('disaster_alerts'));
};

/**
 * Export shelters to CSV and trigger download
 * @param shelters Array of safety shelters to export
 */
export const exportSheltersToCSV = (shelters: SafetyShelter[]): void => {
  const headers = {
    'id': 'ID',
    'name': 'Shelter Name',
    'coordinates.latitude': 'Latitude',
    'coordinates.longitude': 'Longitude',
    'address': 'Address',
    'capacity': 'Capacity',
    'available': 'Available'
  };
  
  const csvContent = convertToCSV(shelters, headers);
  downloadCSV(csvContent, generateFilename('safety_shelters'));
};

/**
 * Trigger a download of the CSV content
 * @param csvContent CSV formatted string
 * @param filename Name for the downloaded file
 */
const downloadCSV = (csvContent: string, filename: string): void => {
  // Create a blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const link = document.createElement('a');
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Set link properties
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Add link to the body
  document.body.appendChild(link);
  
  // Click the link to trigger download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export both alerts and shelters to CSV files in a ZIP archive
 * @param alerts Array of disaster alerts
 * @param shelters Array of safety shelters
 */
export const exportToExcel = (alerts: DisasterAlert[], shelters: SafetyShelter[]): void => {
  // Since we're having issues with the XLSX library, we'll just export both as separate CSV files
  exportAlertsToCSV(alerts);
  
  // Add a small delay before triggering the second download to prevent browser issues
  setTimeout(() => {
    exportSheltersToCSV(shelters);
  }, 500);
  
  // Show a message to the user
  alert('Downloading disaster alerts and shelters as separate CSV files that can be opened in Excel.');
};

// Database export service
export const databaseExportService = {
  exportAlertsToCSV,
  exportSheltersToCSV,
  exportToExcel
};

export default databaseExportService; 