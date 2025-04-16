// This script helps with GitHub Pages SPA navigation
(function() {
  // Only run this script in production on GitHub Pages
  if (window.location.hostname.indexOf('github.io') === -1) {
    return;
  }

  var segmentCount = 1; // Disaster-Alert-System is at index 1
  var location = window.location;
  
  // Don't redirect if already using the hash or in the root
  if (location.hash || location.pathname === '/' || 
      location.pathname === '/Disaster-Alert-System/' ||
      location.pathname === '/Disaster-Alert-System/index.html') {
    return;
  }
  
  // Get the path segments and remove the project name
  var pathSegments = location.pathname.split('/');
  if (pathSegments.length > segmentCount + 1) {
    // Remove the first segments (empty string and project name)
    var newPath = pathSegments.slice(segmentCount + 1).join('/');
    
    // Build the new URL with hash router format
    var redirectUrl = location.origin + 
                     '/Disaster-Alert-System/#/' + 
                     newPath + 
                     location.search;
    
    window.location.replace(redirectUrl);
  }
})(); 