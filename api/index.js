// Ultra-minimal Vercel serverless function
export default function handler(req, res) {
  // Sample schools data
  const schools = [
    {
      id: 1,
      name: "Central High School",
      address: "123 Education Boulevard, New York, NY 10001",
      latitude: 40.7128,
      longitude: -74.0060
    },
    {
      id: 2,
      name: "Westside Elementary", 
      address: "456 Learning Lane, New York, NY 10002",
      latitude: 40.7580,
      longitude: -73.9855
    },
    {
      id: 3,
      name: "North Academy",
      address: "789 Knowledge Drive, New York, NY 10003", 
      latitude: 40.7831,
      longitude: -73.9712
    }
  ];

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Set CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { url, method } = req;
    const path = url.split('?')[0];

    // Main API info
    if (path === '/' && method === 'GET') {
      return res.status(200).json({
        success: true,
        message: 'School Management API is running',
        version: '1.0.0',
        endpoints: {
          addSchool: 'POST /api/addSchool',
          listSchools: 'GET /api/listSchools'
        }
      });
    }

    // Health check
    if (path === '/health' && method === 'GET') {
      return res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        schools_count: schools.length
      });
    }

    // List schools with proximity
    if (path === '/api/listSchools' && method === 'GET') {
      const { latitude, longitude } = req.query;

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
          message: 'Invalid latitude'
        });
      }

      if (isNaN(lon) || lon < -180 || lon > 180) {
        return res.status(400).json({
          success: false,
          message: 'Invalid longitude'
        });
      }

      const schoolsWithDistance = schools.map(school => ({
        ...school,
        distance: calculateDistance(lat, lon, school.latitude, school.longitude)
      }));

      schoolsWithDistance.sort((a, b) => a.distance - b.distance);

      return res.status(200).json({
        success: true,
        message: 'Schools retrieved successfully',
        data: schoolsWithDistance,
        count: schoolsWithDistance.length
      });
    }

    // Add school
    if (path === '/api/addSchool' && method === 'POST') {
      const { name, address, latitude, longitude } = req.body;

      if (!name || !address || !latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lon) || lon < -180 || lon > 180) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates'
        });
      }

      const newSchool = {
        id: schools.length + 1,
        name: name.trim(),
        address: address.trim(),
        latitude: lat,
        longitude: lon,
        created_at: new Date().toISOString()
      };

      return res.status(201).json({
        success: true,
        message: 'School added successfully',
        data: newSchool
      });
    }

    // 404
    return res.status(404).json({
      success: false,
      message: 'Endpoint not found'
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
