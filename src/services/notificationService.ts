import { DisasterAlert, AlertSeverity } from '../models/types';

// Helper to add severity prefix to notification title
function getSeverityPrefix(severity: AlertSeverity): string {
  switch (severity) {
    case AlertSeverity.CRITICAL:
      return '🔴 CRITICAL:';
    case AlertSeverity.HIGH:
      return '🟠 WARNING:';
    case AlertSeverity.MEDIUM:
      return '🟡 ALERT:';
    case AlertSeverity.LOW:
      return '🔵 NOTICE:';
    default:
      return '';
  }
}

export const notificationService = {
  // Check if browser notifications are supported
  isNotificationSupported(): boolean {
    return 'Notification' in window;
  },
  
  // Request notification permission
  async requestPermission(): Promise<boolean> {
    return Promise.resolve(true); // Always allow in demo
  },
  
  // Show a notification for a disaster alert
  async showAlertNotification(alert: DisasterAlert): Promise<boolean> {
    console.log(`[NOTIFICATION] ${getSeverityPrefix(alert.severity)} ${alert.title}: ${alert.description}`);
    return true;
  },
  
  // Mock SMS notification (in a real app, this would integrate with an SMS service API)
  sendSMSAlert(phoneNumber: string, alert: DisasterAlert): Promise<boolean> {
    return new Promise((resolve) => {
      // Mock SMS sending
      console.log(`[SMS MOCK] Sending SMS to ${phoneNumber}: ${getSeverityPrefix(alert.severity)} ${alert.title} - ${alert.description}`);
      // In a real app, this would call an SMS API service like Twilio
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  }
}; 