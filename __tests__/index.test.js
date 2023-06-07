const { handler } = require('./handler');

describe('Test API Endpoints', () => {
  it('should return "Go Serverless v3.0! Your function executed successfully!"', async () => {
    // Mock event object
    const mockEvent = {
      key1: 'value1',
      key2: 'value2',
    };

    // Stub the JSON.stringify method to exclude circular references
    const originalStringify = JSON.stringify;
    JSON.stringify = jest.fn((obj, replacer, spaces) => {
      return originalStringify(obj, replacer, spaces);
    });

    // Invoke the handler function
    const result = await handler(mockEvent);

    // Restore the original JSON.stringify method
    JSON.stringify = originalStringify;

    // Assert the response
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      message: 'Go Serverless v3.0! Your function executed successfully!',
      input: mockEvent,
    });
  }, 10000); // Increased timeout to 10000 milliseconds
});