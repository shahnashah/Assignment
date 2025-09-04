// Simple test to verify PDF generation works
const { generateDashboardPDF, prepareDashboardData } = require('./src/utils/pdfGenerator.js');

// Test data
const sipData = [
  { month: 'Mar', amount: 1.4, target: 95 },
  { month: 'Apr', amount: 0, target: 100 },
  { month: 'May', amount: 1.6, target: 105 },
  { month: 'Jun', amount: 1.4, target: 110 }
];

const monthlyMisData = [
  { month: 'Jan', series1: 0.40, series2: 0.35, series3: 0.30 },
  { month: 'Feb', series1: 0.30, series2: 0.25, series3: 0.20 },
  { month: 'Mar', series1: 0.35, series2: 0.40, series3: 0.25 },
  { month: 'Apr', series1: 0.25, series2: 0.30, series3: 0.35 }
];

const clientsData = [
  { name: 'Active', value: 3824, color: '#DC2626' },
  { name: 'InActive', value: 541, color: '#F97316' },
  { name: 'New', value: 2, color: '#059669' },
  { name: 'Online', value: 60, color: '#F59E0B' }
];

async function testPdfGeneration() {
  try {
    console.log('Testing PDF generation...');
    
    // Prepare dashboard data
    const dashboardData = prepareDashboardData(sipData, monthlyMisData, clientsData);
    console.log('Dashboard data prepared:', Object.keys(dashboardData));
    
    // Generate PDF
    const pdfBlob = await generateDashboardPDF(dashboardData, {}, false);
    console.log('PDF generated successfully!');
    console.log('PDF blob size:', pdfBlob.size, 'bytes');
    console.log('PDF blob type:', pdfBlob.type);
    
    return true;
  } catch (error) {
    console.error('PDF generation failed:', error);
    return false;
  }
}

// Run test
testPdfGeneration().then(success => {
  if (success) {
    console.log('✅ PDF generation test passed!');
  } else {
    console.log('❌ PDF generation test failed!');
  }
});
