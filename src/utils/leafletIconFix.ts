import L from 'leaflet';

// Fix for Leaflet marker icons in production/GitHub Pages environment
const fixLeafletIcons = () => {
  // Get the public URL path from package.json's homepage or fallback to root
  const publicUrl = process.env.PUBLIC_URL || '';
  
  // Update the icon paths
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: `${publicUrl}/leaflet/marker-icon-2x.png`,
    iconUrl: `${publicUrl}/leaflet/marker-icon.png`,
    shadowUrl: `${publicUrl}/leaflet/marker-shadow.png`,
  });
};

export default fixLeafletIcons; 