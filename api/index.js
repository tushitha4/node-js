// Simple Vercel serverless function
module.exports = async (req, res) => {
  // In-memory storage for demo purposes
  let schools = [
    {
      id: 1,
      name: "Central High School",
      address: "123 Education Boulevard, New York, NY 10001",
      latitude: 40.7128,
      longitude: -74.0060,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      name: "Westside Elementary",
      address: "456 Learning Lane, New York, NY 10002",
      latitude: 40.7580,
      longitude: -73.9855,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      name: "North Academy",
      address: "789 Knowledge Drive, New York, NY 10003",
      latitude: 40.7831,
      longitude: -73.9712,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { url, method } = req;

    // Parse URL and query parameters
    const parsedUrl = new URL(url, `http://${req.headers.host}`);
    const path = parsedUrl.pathname;
    const query = Object.fromEntries(parsedUrl.searchParams);

    // Route handling
    if (path === '/' && method === 'GET') {
      res.json({
        success: true,
        message: 'School Management API is running (Demo Mode)',
        version: '1.0.0',
        mode: 'demo',
        endpoints: {
          addSchool: 'POST /api/addSchool',
          listSchools: 'GET /api/listSchools'
        }
      });
      return;
    }

    if (path === '/health' && method === 'GET') {
      res.json({
        success: true,
        message: 'Server is healthy (Demo Mode)',
        timestamp: new Date().toISOString(),
        schools_count: schools.length
      });
      return;
    }

    if (path === '/api/listSchools' && method === 'GET') {
      const { latitude, longitude } = query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      if (isNaN(lat) || lat < -90 || lat > 90) {
        return res.status(400).json({
          success: false,
          message: 'Latitude must be a number between -90 and 90'
        });
      }

      if (isNaN(lon) || lon < -180 || lon > 180) {
        return res.status(400).json({
          success: false,
          message: 'Longitude must be a number between -180 and 180'
        });
      }

      // Calculate distance for each school and sort
      const schoolsWithDistance = schools.map(school => ({
        ...school,
        distance: calculateDistance(lat, lon, school.latitude, school.longitude)
      }));

      // Sort by distance (closest first)
      schoolsWithDistance.sort((a, b) => a.distance - b.distance);

      res.json({
        success: true,
        message: 'Schools retrieved successfully',
        data: schoolsWithDistance,
        count: schoolsWithDistance.length
      });
      return;
    }

    if (path === '/api/addSchool' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const { name, address, latitude, longitude } = JSON.parse(body);

          // Basic validation
          if (!name || !address || !latitude || !longitude) {
            return res.status(400).json({
              success: false,
              message: 'All fields are required'
            });
          }

          if (typeof name !== 'string' || name.length < 2 || name.length > 255) {
            return res.status(400).json({
              success: false,
              message: 'School name must be between 2 and 255 characters'
            });
          }

          if (typeof address !== 'string' || address.length < 5 || address.length > 500) {
            return res.status(400).json({
              success: false,
              message: 'Address must be between 5 and 500 characters'
            });
          }

          const lat = parseFloat(latitude);
          const lon = parseFloat(longitude);

          if (isNaN(lat) || lat < -90 || lat > 90) {
            return res.status(400).json({
              success: false,
              message: 'Latitude must be a number between -90 and 90'
            });
          }

          if (isNaN(lon) || lon < -180 || lon > 180) {
            return res.status(400).json({
              success: false,
              message: 'Longitude must be a number between -180 and 180'
            });
          }

          const newSchool = {
            id: schools.length + 1,
            name: name.trim(),
            address: address.trim(),
            latitude: lat,
            longitude: lon,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          schools.push(newSchool);

          res.status(201).json({
            success: true,
            message: 'School added successfully',
            data: newSchool
          });
        } catch (error) {
          res.status(400).json({
            success: false,
            message: 'Invalid JSON in request body'
          });
        }
      });
      return;
    }

    // 404 handler
    res.status(404).json({
      success: false,
      message: 'Endpoint not found'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
