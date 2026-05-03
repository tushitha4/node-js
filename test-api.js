const http = require('http');

// Function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test the API endpoints
async function testAPI() {
  console.log('🚀 Testing School Management API...\n');
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/health',
      method: 'GET'
    });
    console.log(`Status: ${healthResponse.statusCode}`);
    console.log('Response:', JSON.parse(healthResponse.body));
    console.log('');
    
    // Test 2: List Schools
    console.log('2️⃣ Testing List Schools...');
    const listResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/listSchools?latitude=40.7128&longitude=-74.0060',
      method: 'GET'
    });
    console.log(`Status: ${listResponse.statusCode}`);
    const listData = JSON.parse(listResponse.body);
    console.log(`Found ${listData.count} schools`);
    listData.data.forEach((school, index) => {
      console.log(`  ${index + 1}. ${school.name} - ${school.distance.toFixed(2)}km away`);
    });
    console.log('');
    
    // Test 3: Add School
    console.log('3️⃣ Testing Add School...');
    const newSchool = {
      name: "Demo Test School",
      address: "789 API Test Street, New York, NY 10004",
      latitude: 40.7505,
      longitude: -73.9934
    };
    
    const addResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/addSchool',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, newSchool);
    console.log(`Status: ${addResponse.statusCode}`);
    console.log('Response:', JSON.parse(addResponse.body));
    console.log('');
    
    // Test 4: List Schools Again (to see the new school)
    console.log('4️⃣ Testing List Schools Again (with new school)...');
    const listResponse2 = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/listSchools?latitude=40.7128&longitude=-74.0060',
      method: 'GET'
    });
    console.log(`Status: ${listResponse2.statusCode}`);
    const listData2 = JSON.parse(listResponse2.body);
    console.log(`Found ${listData2.count} schools (including new one)`);
    listData2.data.forEach((school, index) => {
      console.log(`  ${index + 1}. ${school.name} - ${school.distance.toFixed(2)}km away`);
    });
    
    console.log('\n✅ All API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    console.log('\n💡 Make sure the server is running with: node server-demo.js');
  }
}

// Run the tests
testAPI();
