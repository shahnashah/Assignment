// import { jsPDF } from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import html2canvas from 'html2canvas';

// /**
//  * Generates a PDF with dashboard statistics and charts
//  * @param {Object} dashboardData - Data from the dashboard
//  * @param {Object} chartRefs - References to chart components
//  * @param {boolean} darkMode - Whether dark mode is enabled
//  */
// export const generateDashboardPDF = async (dashboardData, chartRefs, darkMode = false) => {
//   // Create a new PDF document
//   const pdf = new jsPDF('p', 'mm', 'a4');
//   const pageWidth = pdf.internal.pageSize.getWidth();
//   const pageHeight = pdf.internal.pageSize.getHeight();
  
//   // Add title
//   pdf.setFontSize(20);
//   pdf.setTextColor(0, 0, 0);
//   pdf.text('Wealth Dashboard Report', pageWidth / 2, 15, { align: 'center' });
  
//   // Add date
//   pdf.setFontSize(10);
//   pdf.setTextColor(100, 100, 100);
//   pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 22, { align: 'center' });
  
//   // Add AUM and SIP stats
//   pdf.setFontSize(14);
//   pdf.setTextColor(0, 0, 0);
//   pdf.text('Key Statistics', 14, 35);
  
//   // Create a table for key stats
//   const statsData = [
//     ['Metric', 'Value', 'Change'],
//     ['AUM', `${dashboardData.aum} Cr`, `${dashboardData.aumChange}% MoM`],
//     ['SIP', `${dashboardData.sip} Lakh`, `${dashboardData.sipChange}% MoM`],
//   ];
  
//   autoTable(pdf, {
//     startY: 40,
//     head: [statsData[0]],
//     body: statsData.slice(1),
//     theme: 'grid',
//     headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255] },
//     styles: { halign: 'center' },
//     columnStyles: {
//       0: { cellWidth: 40 },
//       1: { cellWidth: 40 },
//       2: { cellWidth: 40 }
//     }
//   });
  
//   // Add transaction stats
//   pdf.setFontSize(14);
//   const statsTableHeight = (pdf.lastAutoTable ? pdf.lastAutoTable.finalY : 40);
//   pdf.text('Transaction Statistics', 14, statsTableHeight + 15);
  
//   const transactionData = [
//     ['Type', 'Count', 'Amount'],
//     ['Purchases', dashboardData.purchases.value, dashboardData.purchases.amount],
//     ['Redemptions', dashboardData.redemptions.value, dashboardData.redemptions.amount],
//     ['Reg Transactions', dashboardData.regTransactions.value, dashboardData.regTransactions.amount],
//     ['SIP Rejections', dashboardData.sipRejections.value, dashboardData.sipRejections.amount],
//     ['New SIP', dashboardData.newSip.value, dashboardData.newSip.amount],
//   ];
  
//   autoTable(pdf, {
//     startY: statsTableHeight + 20,
//     head: [transactionData[0]],
//     body: transactionData.slice(1),
//     theme: 'grid',
//     headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255] },
//     styles: { halign: 'center' },
//   });
  
//   // Add client statistics
//   pdf.setFontSize(14);
//   const transactionTableHeight = (pdf.lastAutoTable ? pdf.lastAutoTable.finalY : statsTableHeight + 40);
//   pdf.text('Client Statistics', 14, transactionTableHeight + 15);
  
//   const clientData = [
//     ['Type', 'Count'],
//     ['Active', dashboardData.clients.active],
//     ['Inactive', dashboardData.clients.inactive],
//     ['New', dashboardData.clients.new],
//     ['Online', dashboardData.clients.online],
//   ];
  
//   autoTable(pdf, {
//     startY: transactionTableHeight + 20,
//     head: [clientData[0]],
//     body: clientData.slice(1),
//     theme: 'grid',
//     headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255] },
//     styles: { halign: 'center' },
//   });
  
//   // Add charts
//   let yPosition = (pdf.lastAutoTable ? pdf.lastAutoTable.finalY : transactionTableHeight + 40) + 15;
  
//   // Check if we need to add a new page for charts
//   if (yPosition > pageHeight - 100) {
//     pdf.addPage();
//     yPosition = 20;
//   }
  
//   pdf.setFontSize(14);
//   pdf.text('Charts', 14, yPosition);
//   yPosition += 10;
  
//   // Add charts from refs if available
//   if (chartRefs && Object.keys(chartRefs).length > 0) {
//     for (const [chartName, chartRef] of Object.entries(chartRefs)) {
//       if (chartRef && chartRef.current) {
//         try {
//           // Convert chart to canvas
//           const canvas = await html2canvas(chartRef.current, {
//             scale: 2,
//             logging: false,
//             useCORS: true,
//             allowTaint: true,
//             foreignObjectRendering: false,
//             backgroundColor: darkMode ? '#1f2937' : '#ffffff'
//           });
          
//           // Check if we need to add a new page
//           if (yPosition > pageHeight - 80) {
//             pdf.addPage();
//             yPosition = 20;
//           }
          
//           // Add chart title
//           pdf.setFontSize(12);
//           pdf.text(chartName, 14, yPosition);
//           yPosition += 5;
          
//           // Add chart image
//           const imgData = canvas.toDataURL('image/png');
//           const imgWidth = pageWidth - 28; // Margins on both sides
//           const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
//           pdf.addImage(imgData, 'PNG', 14, yPosition, imgWidth, imgHeight);
//           yPosition += imgHeight + 15;
//         } catch (error) {
//           console.error(`Error adding chart ${chartName}:`, error);
//         }
//       }
//     }
//   } else {
//     // If no chart refs are provided, add placeholder text
//     pdf.setFontSize(12);
//     pdf.text('No charts available', 14, yPosition + 10);
//   }
  
//   // Save the PDF
//   pdf.save('wealth-dashboard-report.pdf');
// };

// /**
//  * Prepares dashboard data for PDF generation
//  * @param {Object} sipData - SIP chart data
//  * @param {Object} monthlyMisData - Monthly MIS chart data
//  * @param {Object} clientsData - Clients data
//  * @returns {Object} Formatted dashboard data
//  */
// export const prepareDashboardData = (sipData, monthlyMisData, clientsData) => {
//   return {
//     aum: '12.19',
//     aumChange: '+0.77',
//     sip: '1.39',
//     sipChange: '+0',
//     purchases: { value: 0, amount: '0.00 INR' },
//     redemptions: { value: 0, amount: '0.00 INR' },
//     regTransactions: { value: 0, amount: '0.00 INR' },
//     sipRejections: { value: 0, amount: '0.00 INR' },
//     newSip: { value: 0, amount: '0.00 INR' },
//     clients: {
//       active: clientsData.find(item => item.name === 'Active')?.value || 0,
//       inactive: clientsData.find(item => item.name === 'InActive')?.value || 0,
//       new: clientsData.find(item => item.name === 'New')?.value || 0,
//       online: clientsData.find(item => item.name === 'Online')?.value || 0,
//     },
//     sipData,
//     monthlyMisData,
//     clientsData
//   };
// };

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates a PDF with dashboard statistics and charts
 * @param {Object} dashboardData - Data from the dashboard
 * @param {Object} chartRefs - References to chart components (not used in this approach)
 * @param {boolean} darkMode - Whether dark mode is enabled
 */
export const generateDashboardPDF = async (dashboardData, chartRefs, darkMode = false) => {
  // Create a new PDF document
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Add title
  pdf.setFontSize(20);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Wealth Dashboard Report', pageWidth / 2, 15, { align: 'center' });
  
  // Add date
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 22, { align: 'center' });
  
  // Add AUM and SIP stats
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Key Statistics', 14, 35);
  
  // Create a table for key stats
  const statsData = [
    ['Metric', 'Value', 'Change'],
    ['AUM', `${dashboardData.aum} Cr`, `${dashboardData.aumChange}% MoM`],
    ['SIP', `${dashboardData.sip} Lakh`, `${dashboardData.sipChange}% MoM`],
  ];
  
  autoTable(pdf, {
    startY: 40,
    head: [statsData[0]],
    body: statsData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255] },
    styles: { halign: 'center' },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 40 },
      2: { cellWidth: 40 }
    }
  });
  
  // Add transaction stats
  pdf.setFontSize(14);
  const statsTableHeight = (pdf.lastAutoTable ? pdf.lastAutoTable.finalY : 40);
  pdf.text('Transaction Statistics', 14, statsTableHeight + 15);
  
  const transactionData = [
    ['Type', 'Count', 'Amount'],
    ['Purchases', dashboardData.purchases.value, dashboardData.purchases.amount],
    ['Redemptions', dashboardData.redemptions.value, dashboardData.redemptions.amount],
    ['Reg Transactions', dashboardData.regTransactions.value, dashboardData.regTransactions.amount],
    ['SIP Rejections', dashboardData.sipRejections.value, dashboardData.sipRejections.amount],
    ['New SIP', dashboardData.newSip.value, dashboardData.newSip.amount],
  ];
  
  autoTable(pdf, {
    startY: statsTableHeight + 20,
    head: [transactionData[0]],
    body: transactionData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255] },
    styles: { halign: 'center' },
  });
  
  // Add client statistics
  pdf.setFontSize(14);
  const transactionTableHeight = (pdf.lastAutoTable ? pdf.lastAutoTable.finalY : statsTableHeight + 40);
  pdf.text('Client Statistics', 14, transactionTableHeight + 15);
  
  const clientData = [
    ['Type', 'Count'],
    ['Active', dashboardData.clients.active],
    ['Inactive', dashboardData.clients.inactive],
    ['New', dashboardData.clients.new],
    ['Online', dashboardData.clients.online],
  ];
  
  autoTable(pdf, {
    startY: transactionTableHeight + 20,
    head: [clientData[0]],
    body: clientData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255] },
    styles: { halign: 'center' },
  });
  
  // Add charts section
  let yPosition = (pdf.lastAutoTable ? pdf.lastAutoTable.finalY : transactionTableHeight + 40) + 15;
  
  // Check if we need to add a new page for charts
  if (yPosition > pageHeight - 120) {
    pdf.addPage();
    yPosition = 20;
  }
  
  pdf.setFontSize(14);
  pdf.text('Charts', 14, yPosition);
  yPosition += 10;
  
  // Draw Client Pie Chart using native PDF drawing
  if (yPosition > pageHeight - 80) {
    pdf.addPage();
    yPosition = 20;
  }
  
  pdf.setFontSize(12);
  pdf.text('Client Distribution', 14, yPosition);
  yPosition += 10;
  
  // Draw pie chart manually
  const centerX = pageWidth / 2;
  const centerY = yPosition + 30;
  const radius = 25;
  
  // Client data with colors (RGB values to avoid oklch issues)
  const clientChartData = [
    { name: 'Active', value: dashboardData.clients.active, color: [220, 38, 38] },
    { name: 'Inactive', value: dashboardData.clients.inactive, color: [185, 28, 28] },
    { name: 'New', value: dashboardData.clients.new, color: [5, 150, 105] },
    { name: 'Online', value: dashboardData.clients.online, color: [245, 158, 11] }
  ];
  
  const total = clientChartData.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  
  // Draw pie slices
  clientChartData.forEach((item) => {
    if (item.value > 0) {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      
      pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
      
      // Create path for pie slice
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      
      // Draw slice (simplified approach)
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      // For simplicity, draw as a triangle from center
      pdf.triangle(centerX, centerY, x1, y1, x2, y2, 'F');
      
      currentAngle += sliceAngle;
    }
  });
  
  // Add legend
  let legendY = centerY + radius + 15;
  clientChartData.forEach((item, index) => {
    const legendX = 14 + (index % 2) * 90;
    if (index % 2 === 0 && index > 0) {
      legendY += 8;
    }
    
    // Draw color box
    pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
    pdf.rect(legendX, legendY - 2, 3, 3, 'F');
    
    // Add text
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${item.name}: ${item.value}`, legendX + 6, legendY);
  });
  
  yPosition = legendY + 20;
  
  // Add SIP Business Chart data as table
  if (yPosition > pageHeight - 60) {
    pdf.addPage();
    yPosition = 20;
  }
  
  pdf.setFontSize(12);
  pdf.text('SIP Business Data', 14, yPosition);
  yPosition += 5;
  
  const sipTableData = [
    ['Month', 'Amount (Lakh)', 'Target'],
    ...dashboardData.sipData.map(item => [item.month, item.amount.toString(), item.target.toString()])
  ];
  
  autoTable(pdf, {
    startY: yPosition + 5,
    head: [sipTableData[0]],
    body: sipTableData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
    styles: { halign: 'center' },
  });
  
  // Add Monthly MIS data as table
  yPosition = (pdf.lastAutoTable ? pdf.lastAutoTable.finalY : yPosition + 30) + 15;
  
  if (yPosition > pageHeight - 60) {
    pdf.addPage();
    yPosition = 20;
  }
  
  pdf.setFontSize(12);
  pdf.text('Monthly MIS Data', 14, yPosition);
  yPosition += 5;
  
  const misTableData = [
    ['Month', 'Series 1', 'Series 2', 'Series 3'],
    ...dashboardData.monthlyMisData.map(item => [
      item.month, 
      item.series1.toString(), 
      item.series2.toString(), 
      item.series3.toString()
    ])
  ];
  
  autoTable(pdf, {
    startY: yPosition + 5,
    head: [misTableData[0]],
    body: misTableData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255] },
    styles: { halign: 'center' },
  });
  
  // Add footer
  const finalY = (pdf.lastAutoTable ? pdf.lastAutoTable.finalY : yPosition + 30);
  if (finalY < pageHeight - 20) {
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Generated by WealthElite Dashboard', pageWidth / 2, pageHeight - 10, { align: 'center' });
  }
  
  // Save the PDF
  pdf.save('wealth-dashboard-report.pdf');
};

/**
 * Prepares dashboard data for PDF generation
 * @param {Object} sipData - SIP chart data
 * @param {Object} monthlyMisData - Monthly MIS chart data
 * @param {Object} clientsData - Clients data
 * @returns {Object} Formatted dashboard data
 */
export const prepareDashboardData = (sipData, monthlyMisData, clientsData) => {
  return {
    aum: '12.19',
    aumChange: '+0.77',
    sip: '1.39',
    sipChange: '+0',
    purchases: { value: 0, amount: '0.00 INR' },
    redemptions: { value: 0, amount: '0.00 INR' },
    regTransactions: { value: 0, amount: '0.00 INR' },
    sipRejections: { value: 0, amount: '0.00 INR' },
    newSip: { value: 0, amount: '0.00 INR' },
    clients: {
      active: clientsData.find(item => item.name === 'Active')?.value || 0,
      inactive: clientsData.find(item => item.name === 'InActive')?.value || 0,
      new: clientsData.find(item => item.name === 'New')?.value || 0,
      online: clientsData.find(item => item.name === 'Online')?.value || 0,
    },
    sipData,
    monthlyMisData,
    clientsData
  };
};