// index.test.js (Jest test file)

const request = require('supertest');
const { handler } = require('../index'); // Assuming the Express app code is in a file named 'index.js'

// Jest test cases
describe('Test API Endpoints', () => {
  // Test / endpoint
  it('should return "Go Serverless v3.0! Your function executed successfully!"', async () => {
    const response = await request(handler).get('/');
    expect(response.status).toEqual(200);
    expect(response.text).toEqual('Go Serverless v3.0! Your function executed successfully!');
  });
});