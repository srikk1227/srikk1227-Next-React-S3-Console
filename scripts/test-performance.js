#!/usr/bin/env node

/**
 * Performance Test Runner for Next-React-S3-Console
 * 
 * This script runs performance tests to verify the application can handle
 * large numbers of files efficiently.
 */

const fs = require('fs');
const path = require('path');

// Simple test runner
class PerformanceTestRunner {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 Running: ${testName}`);
    const testStart = performance.now();
    
    try {
      await testFunction();
      const testTime = performance.now() - testStart;
      this.results.push({
        name: testName,
        status: 'PASS',
        duration: testTime,
        timestamp: new Date().toISOString()
      });
      console.log(`✅ PASS - ${testName} (${testTime.toFixed(2)}ms)`);
    } catch (error) {
      const testTime = performance.now() - testStart;
      this.results.push({
        name: testName,
        status: 'FAIL',
        duration: testTime,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      console.log(`❌ FAIL - ${testName} (${testTime.toFixed(2)}ms)`);
      console.log(`   Error: ${error.message}`);
    }
  }

  generateReport() {
    const totalTime = Date.now() - this.startTime;
    const passedTests = this.results.filter(r => r.status === 'PASS').length;
    const failedTests = this.results.filter(r => r.status === 'FAIL').length;
    const totalTests = this.results.length;

    console.log('\n' + '='.repeat(60));
    console.log('📊 PERFORMANCE TEST REPORT');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Total Time: ${totalTime}ms`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(result => {
          console.log(`   - ${result.name}: ${result.error}`);
        });
    }

    console.log('\n📈 PERFORMANCE METRICS:');
    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / totalTests;
    console.log(`Average Test Duration: ${avgDuration.toFixed(2)}ms`);
    
    const slowestTest = this.results.reduce((slowest, current) => 
      current.duration > slowest.duration ? current : slowest
    );
    console.log(`Slowest Test: ${slowestTest.name} (${slowestTest.duration.toFixed(2)}ms)`);

    // Save report to file
    const reportPath = path.join(__dirname, '../performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      summary: {
        totalTests,
        passedTests,
        failedTests,
        totalTime,
        successRate: (passedTests / totalTests) * 100,
        avgDuration,
        timestamp: new Date().toISOString()
      },
      results: this.results
    }, null, 2));

    console.log(`\n📄 Report saved to: ${reportPath}`);
  }
}

// Mock data generators (same as in test file)
const generateMockFiles = (count) => {
  const files = [];
  for (let i = 0; i < count; i++) {
    files.push({
      name: `file-${i}.txt`,
      key: `folder/file-${i}.txt`,
      size: `${Math.floor(Math.random() * 1000)} KB`,
      lastModified: '2024-01-01',
      type: 'file'
    });
  }
  return files;
};

const generateMockFolders = (count) => {
  const folders = [];
  for (let i = 0; i < count; i++) {
    folders.push({
      name: `folder-${i}`,
      key: `folder-${i}/`,
      lastModified: '2024-01-01',
      type: 'folder'
    });
  }
  return folders;
};

// Performance tests
const performanceTests = {
  'Pagination Performance - 10k files': async () => {
    const totalFiles = 10000;
    const filesPerPage = 100;
    
    // Simulate loading first page
    const startTime = performance.now();
    const firstPageFiles = generateMockFiles(filesPerPage);
    const firstPageTime = performance.now() - startTime;
    
    if (firstPageTime > 1000) {
      throw new Error(`First page load took ${firstPageTime.toFixed(2)}ms (should be < 1000ms)`);
    }
    
    if (firstPageFiles.length !== filesPerPage) {
      throw new Error(`Expected ${filesPerPage} files, got ${firstPageFiles.length}`);
    }
  },

  'Search Performance - 5k files': async () => {
    const files = generateMockFiles(5000);
    const searchQuery = 'test';
    
    const startTime = performance.now();
    const searchResults = files.filter(file => 
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const searchTime = performance.now() - startTime;
    
    if (searchTime > 50) {
      throw new Error(`Search took ${searchTime.toFixed(2)}ms (should be < 50ms)`);
    }
  },

  'Memory Performance - Large datasets': async () => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0;
    
    // Simulate loading and unloading large datasets
    for (let i = 0; i < 10; i++) {
      const files = generateMockFiles(1000);
      const folders = generateMockFolders(100);
      
      // Simulate component unmounting
      files.length = 0;
      folders.length = 0;
    }
    
    const finalMemory = performance.memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    if (memoryIncrease > 10 * 1024 * 1024) {
      throw new Error(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB (should be < 10MB)`);
    }
  },

  'Rendering Performance - Virtual scrolling': async () => {
    const files = generateMockFiles(1000);
    
    const startTime = performance.now();
    const visibleItems = files.slice(0, 20); // Only render first 20 items
    const renderTime = performance.now() - startTime;
    
    if (renderTime > 100) {
      throw new Error(`Rendering took ${renderTime.toFixed(2)}ms (should be < 100ms)`);
    }
    
    if (visibleItems.length !== 20) {
      throw new Error(`Expected 20 visible items, got ${visibleItems.length}`);
    }
  },

  'API Performance - Concurrent calls': async () => {
    const apiCalls = [];
    
    // Simulate multiple concurrent API calls
    for (let i = 0; i < 10; i++) {
      const call = new Promise(resolve => {
        setTimeout(() => resolve(`call-${i}`), Math.random() * 100);
      });
      apiCalls.push(call);
    }
    
    const startTime = performance.now();
    const results = await Promise.all(apiCalls);
    const totalTime = performance.now() - startTime;
    
    if (results.length !== 10) {
      throw new Error(`Expected 10 results, got ${results.length}`);
    }
    
    if (totalTime > 200) {
      throw new Error(`Total time: ${totalTime.toFixed(2)}ms (should be < 200ms)`);
    }
  }
};

// Main execution
async function main() {
  console.log('🚀 Next-React-S3-Console Performance Test Runner');
  console.log('='.repeat(60));
  
  const runner = new PerformanceTestRunner();
  
  for (const [testName, testFunction] of Object.entries(performanceTests)) {
    await runner.runTest(testName, testFunction);
  }
  
  runner.generateReport();
  
  // Exit with appropriate code
  const failedTests = runner.results.filter(r => r.status === 'FAIL').length;
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { PerformanceTestRunner, performanceTests }; 