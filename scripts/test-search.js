#!/usr/bin/env node

/**
 * Test script for Next-React-S3-Console search functionality
 */

const https = require('https');
const http = require('http');

const checkServerAvailability = async () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/api/health-check', (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });
  });
};

const makeRequest = async (url, options) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(options.body);
    
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...options.headers
      }
    };
    
    const req = client.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            json: () => Promise.resolve(jsonBody)
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            json: () => Promise.resolve({ error: 'Invalid JSON response' })
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (data) {
      req.write(data);
    }
    req.end();
  });
};

const testSearchAPI = async () => {
  console.log('🧪 Testing Next-React-S3-Console Search API...\n');

  // Check if server is running
  console.log('🔍 Checking server availability...');
  const serverAvailable = await checkServerAvailability();
  
  if (!serverAvailable) {
    console.log('❌ Server not available on http://localhost:3000');
    console.log('💡 Please start the development server with: npm run dev');
    console.log('💡 Then run this test again.');
    return;
  }
  
  console.log('✅ Server is running!\n');

  let passedTests = 0;
  let failedTests = 0;

  // Test data - using mock credentials for testing
  const testConfig = {
    accessKeyId: 'test-key',
    secretAccessKey: 'test-secret',
    bucketName: 'test-bucket',
    region: 'us-east-1'
  };

  const testCases = [
    {
      name: 'Valid search query (should fail auth)',
      query: 'test',
      prefix: '',
      expectedStatus: 401, // Should fail due to invalid credentials
      description: 'Tests that API rejects invalid credentials'
    },
    {
      name: 'Empty query (should fail auth)',
      query: '',
      prefix: '',
      expectedStatus: 401, // Authentication happens before validation
      description: 'Tests that API rejects invalid credentials before validation'
    },
    {
      name: 'Single character query (should fail auth)',
      query: 'a',
      prefix: '',
      expectedStatus: 401, // Authentication happens before validation
      description: 'Tests that API rejects invalid credentials before validation'
    },
    {
      name: 'Search with prefix (should fail auth)',
      query: 'file',
      prefix: 'folder/',
      expectedStatus: 401, // Should fail due to invalid credentials
      description: 'Tests that API rejects invalid credentials with prefix'
    }
  ];

  console.log('🔍 Testing authentication and basic functionality...\n');

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    console.log(`Description: ${testCase.description}`);
    console.log(`Query: "${testCase.query}", Prefix: "${testCase.prefix}"`);
    
    try {
      const response = await makeRequest('http://localhost:3000/api/s3/search-files', {
        method: 'POST',
        body: {
          ...testConfig,
          query: testCase.query,
          prefix: testCase.prefix
        }
      });

      const result = await response.json();
      
      if (response.status === testCase.expectedStatus) {
        console.log(`✅ PASS - Status: ${response.status}`);
        if (result.success) {
          console.log(`   Results: ${result.files?.length || 0} files found`);
        } else {
          console.log(`   Error: ${result.error}`);
        }
        passedTests++;
      } else {
        console.log(`❌ FAIL - Expected status ${testCase.expectedStatus}, got ${response.status}`);
        console.log(`   Response:`, result);
        failedTests++;
      }
    } catch (error) {
      console.log(`❌ FAIL - Network error: ${error.message}`);
      failedTests++;
    }
    
    console.log('');
  }

  // Test validation logic by testing the protectApiRoute function
  console.log('🔍 Testing API validation logic...\n');
  
  const validationTests = [
    {
      name: 'Missing required fields',
      body: { query: 'test' }, // Missing AWS credentials
      expectedStatus: 400,
      description: 'Tests that API requires all required fields'
    },
    {
      name: 'Empty AWS credentials',
      body: { 
        accessKeyId: '', 
        secretAccessKey: '', 
        bucketName: '', 
        region: 'us-east-1',
        query: 'test'
      },
      expectedStatus: 400,
      description: 'Tests that API validates AWS credentials are not empty'
    }
  ];

  for (const testCase of validationTests) {
    console.log(`Testing: ${testCase.name}`);
    console.log(`Description: ${testCase.description}`);
    
    try {
      const response = await makeRequest('http://localhost:3000/api/s3/search-files', {
        method: 'POST',
        body: testCase.body
      });

      const result = await response.json();
      
      if (response.status === testCase.expectedStatus) {
        console.log(`✅ PASS - Status: ${response.status}`);
        console.log(`   Error: ${result.error}`);
        passedTests++;
      } else {
        console.log(`❌ FAIL - Expected status ${testCase.expectedStatus}, got ${response.status}`);
        console.log(`   Response:`, result);
        failedTests++;
      }
    } catch (error) {
      console.log(`❌ FAIL - Network error: ${error.message}`);
      failedTests++;
    }
    
    console.log('');
  }

  console.log('🎯 Search API test completed!');
  console.log(`📊 Results: ${passedTests} passed, ${failedTests} failed`);
  
  if (failedTests === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
  }
};

// Run the test
testSearchAPI().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
}); 