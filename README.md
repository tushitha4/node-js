# School Management API

A comprehensive Node.js REST API for managing school data with MySQL database, featuring location-based proximity search.

## Features

- ✅ Add new schools with validation
- ✅ List schools sorted by proximity to user location
- ✅ Input validation and error handling
- ✅ MySQL database with optimized schema
- ✅ CORS enabled for cross-origin requests
- ✅ Security headers with Helmet
- ✅ Request logging with Morgan
- ✅ Environment-based configuration

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger
- **Dotenv** - Environment variables

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=school_management
   PORT=3000
   ```

4. Start the server:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### 1. Health Check
- **GET** `/health`
- Returns server health status

### 2. Add School
- **POST** `/api/addSchool`
- **Request Body:**
  ```json
  {
    "name": "Example School",
    "address": "123 Main Street, City, State 12345",
    "latitude": 40.7128,
    "longitude": -74.0060
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "School added successfully",
    "data": {
      "id": 1,
      "name": "Example School",
      "address": "123 Main Street, City, State 12345",
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  }
  ```

### 3. List Schools
- **GET** `/api/listSchools`
- **Query Parameters:**
  - `latitude` (required): User's latitude (-90 to 90)
  - `longitude` (required): User's longitude (-180 to 180)
- **Example:** `/api/listSchools?latitude=40.7128&longitude=-74.0060`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Schools retrieved successfully",
    "data": [
      {
        "id": 1,
        "name": "Example School",
        "address": "123 Main Street, City, State 12345",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "distance": 0.5,
        "created_at": "2024-01-01T12:00:00.000Z",
        "updated_at": "2024-01-01T12:00:00.000Z"
      }
    ],
    "count": 1
  }
  ```

## Database Schema

### Schools Table
```sql
CREATE TABLE schools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_coordinates (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## Validation Rules

### Add School
- `name`: Required, 2-255 characters
- `address`: Required, 5-500 characters
- `latitude`: Required, number between -90 and 90
- `longitude`: Required, number between -180 and 180

### List Schools
- `latitude`: Required, number between -90 and 90
- `longitude`: Required, number between -180 and 180

## Error Handling

The API returns consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors if applicable
}
```

## Postman Collection

Import the `postman-collection.json` file to test all API endpoints:
1. Open Postman
2. Click "Import"
3. Select the `postman-collection.json` file
4. Update the `baseUrl` variable if needed

## Deployment

### Environment Variables
- `NODE_ENV`: Set to 'production' for production deployment
- `PORT`: Server port (default: 3000)
- `DB_HOST`: Database host
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `DB_PORT`: Database port (default: 3306)
- `CORS_ORIGIN`: Allowed CORS origins

### Production Deployment
1. Set `NODE_ENV=production`
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "school-api"
   ```

## Distance Calculation

The API uses the Haversine formula to calculate the great-circle distance between two points on Earth's surface, providing accurate proximity measurements in kilometers.

## License

ISC

## Deployment Status
✅ Vercel deployment ready with latest fixes
