/**
 * @jest-environment jsdom
 */

import { makeDashboardPdf, prepareDashboardData } from './makeReport';

// Mock chart refs for testing
const mockChartRefs = {
  'Clients Chart': { current: document.createElement('div') },
  'SIP Business Chart': { current: document.createElement('div') },
  'Monthly MIS Chart': { current: document.createElement('div') }
};

describe('PDF Factory (Web Side)', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test('makeDashboardPdf returns a Blob with non-zero size', async () => {
    // Prepare test data
    const dashboardData = prepareDashboardData();
    const darkMode = false;

    // Call the function
    const result = await makeDashboardPdf(dashboardData, mockChartRefs, darkMode);

    // Assertions
    expect(result).toHaveProperty('blob');
    expect(result).toHaveProperty('base64');
    
    // Check that blob is actually a Blob
    expect(result.blob).toBeInstanceOf(Blob);
    
    // Check that blob has non-zero size
    expect(result.blob.size).toBeGreaterThan(0);
    
    // Check that blob has correct MIME type
    expect(result.blob.type).toBe('application/pdf');
    
    // Check that base64 is a non-empty string
    expect(typeof result.base64).toBe('string');
    expect(result.base64.length).toBeGreaterThan(0);
  });

  test('makeDashboardPdf works with dark mode', async () => {
    const dashboardData = prepareDashboardData();
    const darkMode = true;

    const result = await makeDashboardPdf(dashboardData, mockChartRefs, darkMode);

    expect(result.blob).toBeInstanceOf(Blob);
    expect(result.blob.size).toBeGreaterThan(0);
  });

  test('prepareDashboardData returns valid data structure', () => {
    const data = prepareDashboardData();

    // Check that it returns an object with expected properties
    expect(typeof data).toBe('object');
    expect(data).not.toBeNull();
    
    // The function should return some data structure
    // (specific assertions would depend on the actual implementation)
    expect(data).toBeDefined();
  });

  test('makeDashboardPdf handles missing chart refs gracefully', async () => {
    const dashboardData = prepareDashboardData();
    const emptyChartRefs = {};

    // Should not throw an error even with empty chart refs
    const result = await makeDashboardPdf(dashboardData, emptyChartRefs, false);

    expect(result.blob).toBeInstanceOf(Blob);
    expect(result.blob.size).toBeGreaterThan(0);
  });
});

// Note: Native save/share functionality is not unit-tested here.
// The native mobile functionality (Capacitor Filesystem & Share) 
// requires integration testing on actual devices.
