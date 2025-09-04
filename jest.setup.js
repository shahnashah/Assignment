// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Mock html2canvas
jest.mock('html2canvas', () => {
  return jest.fn(() => Promise.resolve({
    toDataURL: jest.fn(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='),
    width: 800,
    height: 600
  }));
});

// Mock jsPDF
jest.mock('jspdf', () => {
  const mockJsPDF = jest.fn().mockImplementation(() => ({
    addImage: jest.fn(),
    addPage: jest.fn(),
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    text: jest.fn(),
    output: jest.fn(() => 'mock-pdf-output'),
    internal: {
      pageSize: {
        getWidth: jest.fn(() => 210),
        getHeight: jest.fn(() => 297)
      }
    }
  }));
  
  return {
    __esModule: true,
    default: mockJsPDF,
    jsPDF: mockJsPDF
  };
});

// Mock jspdf-autotable
jest.mock('jspdf-autotable', () => ({
  __esModule: true,
  default: jest.fn()
}));

// Mock Capacitor
jest.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: jest.fn(() => false),
    getPlatform: jest.fn(() => 'web')
  }
}));
