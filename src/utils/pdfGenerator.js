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
import html2canvas from 'html2canvas';

/**
 * Generates a PDF with dashboard statistics and charts
 * @param {Object} dashboardData - Data from the dashboard
 * @param {Object} chartRefs - References to chart components
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
  
  // Add charts section - Start on new page for better layout
  pdf.addPage();
  let yPosition = 20;
  
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Dashboard Charts', 14, yPosition);
  yPosition += 15;
  
  // Draw CLIENTS Chart
  if (yPosition > pageHeight - 100) {
    pdf.addPage();
    yPosition = 20;
  }
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text('CLIENTS', 14, yPosition);
  yPosition += 15;
  
  // Draw donut chart manually
  const centerX = pageWidth / 2;
  const centerY = yPosition + 40;
  const outerRadius = 30;
  const innerRadius = 18;
  
  // Client data
  const clientChartData = [
    { name: 'Active', value: dashboardData.clients.active, color: [220, 38, 38] },
    { name: 'InActive', value: dashboardData.clients.inactive, color: [185, 28, 28] },
    { name: 'New', value: dashboardData.clients.new, color: [5, 150, 105] },
    { name: 'Online', value: dashboardData.clients.online, color: [245, 158, 11] }
  ];
  
  const total = clientChartData.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -Math.PI / 2; // Start from top
  
  // Draw donut slices
  clientChartData.forEach((item) => {
    if (item.value > 0) {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      
      // Draw outer arc
      pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
      
      // Create multiple triangles to approximate the arc
      const segments = Math.max(8, Math.floor(sliceAngle * 20));
      for (let i = 0; i < segments; i++) {
        const angle1 = currentAngle + (sliceAngle * i) / segments;
        const angle2 = currentAngle + (sliceAngle * (i + 1)) / segments;
        
        const x1 = centerX + outerRadius * Math.cos(angle1);
        const y1 = centerY + outerRadius * Math.sin(angle1);
        const x2 = centerX + outerRadius * Math.cos(angle2);
        const y2 = centerY + outerRadius * Math.sin(angle2);
        const x3 = centerX + innerRadius * Math.cos(angle2);
        const y3 = centerY + innerRadius * Math.sin(angle2);
        const x4 = centerX + innerRadius * Math.cos(angle1);
        const y4 = centerY + innerRadius * Math.sin(angle1);
        
        // Draw quad as two triangles
        pdf.triangle(x1, y1, x2, y2, x3, y3, 'F');
        pdf.triangle(x1, y1, x3, y3, x4, y4, 'F');
      }
      
      currentAngle += sliceAngle;
    }
  });
  
  // Add center text
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text(total.toString(), centerX, centerY + 3, { align: 'center' });
  
  // Add legend
  let legendY = centerY + outerRadius + 20;
  clientChartData.forEach((item, index) => {
    const legendX = 14 + (index % 2) * 90;
    if (index % 2 === 0 && index > 0) {
      legendY += 10;
    }
    
    // Draw color box
    pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
    pdf.rect(legendX, legendY - 2, 4, 4, 'F');
    
    // Add text
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${item.name}: ${item.value}`, legendX + 8, legendY + 1);
  });
  
  yPosition = legendY + 25;
  
  // Draw SIP Business Chart
  if (yPosition > pageHeight - 80) {
    pdf.addPage();
    yPosition = 20;
  }
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text('SIP BUSINESS CHART', 14, yPosition);
  yPosition += 15;
  
  // Chart dimensions
  const chartX = 20;
  const chartY = yPosition;
  const chartWidth = pageWidth - 40;
  const chartHeight = 60;
  
  // Draw grid
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.1);
  for (let i = 0; i <= 4; i++) {
    const y = chartY + (chartHeight / 4) * i;
    pdf.line(chartX, y, chartX + chartWidth, y);
  }
  for (let i = 0; i <= dashboardData.sipData.length; i++) {
    const x = chartX + (chartWidth / dashboardData.sipData.length) * i;
    pdf.line(x, chartY, x, chartY + chartHeight);
  }
  
  // Find max values for scaling
  const maxAmount = Math.max(...dashboardData.sipData.map(d => d.amount));
  const maxTarget = Math.max(...dashboardData.sipData.map(d => d.target));
  const maxValue = Math.max(maxAmount, maxTarget / 50);
  
  // Draw bars
  dashboardData.sipData.forEach((item, index) => {
    const barWidth = (chartWidth / dashboardData.sipData.length) * 0.6;
    const barX = chartX + (chartWidth / dashboardData.sipData.length) * index + (chartWidth / dashboardData.sipData.length - barWidth) / 2;
    const barHeight = (item.amount / maxValue) * chartHeight;
    const barY = chartY + chartHeight - barHeight;
    
    pdf.setFillColor(59, 130, 246); // Blue color
    pdf.rect(barX, barY, barWidth, barHeight, 'F');
    
    // Add month label
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text(item.month, barX + barWidth / 2, chartY + chartHeight + 8, { align: 'center' });
  });
  
  // Draw line for targets
  pdf.setDrawColor(239, 68, 68); // Red color
  pdf.setLineWidth(1);
  let prevX, prevY;
  
  dashboardData.sipData.forEach((item, index) => {
    const pointX = chartX + (chartWidth / dashboardData.sipData.length) * index + (chartWidth / dashboardData.sipData.length) / 2;
    const pointY = chartY + chartHeight - ((item.target / 50) / maxValue) * chartHeight;
    
    if (index > 0) {
      pdf.line(prevX, prevY, pointX, pointY);
    }
    
    // Draw point
    pdf.setFillColor(239, 68, 68);
    pdf.circle(pointX, pointY, 1, 'F');
    
    prevX = pointX;
    prevY = pointY;
  });
  
  yPosition += chartHeight + 25;
  
  // Draw Monthly MIS Chart
  if (yPosition > pageHeight - 80) {
    pdf.addPage();
    yPosition = 20;
  }
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text('MONTHLY MIS', 14, yPosition);
  yPosition += 15;
  
  // Chart dimensions for MIS
  const misChartY = yPosition;
  const misChartHeight = 60;
  
  // Draw grid for MIS
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.1);
  for (let i = 0; i <= 4; i++) {
    const y = misChartY + (misChartHeight / 4) * i;
    pdf.line(chartX, y, chartX + chartWidth, y);
  }
  
  // Find max value for MIS
  const misMaxValue = Math.max(...dashboardData.monthlyMisData.map(d => d.series1 + d.series2 + d.series3));
  
  // Draw stacked areas
  const colors = [
    [239, 68, 68],   // Red for series1
    [34, 197, 94],   // Green for series2
    [59, 130, 246]   // Blue for series3
  ];
  
  dashboardData.monthlyMisData.forEach((item, index) => {
    const barX = chartX + (chartWidth / dashboardData.monthlyMisData.length) * index;
    const barWidth = chartWidth / dashboardData.monthlyMisData.length;
    
    let cumulativeHeight = 0;
    
    // Draw each series as a stacked bar
    ['series1', 'series2', 'series3'].forEach((series, seriesIndex) => {
      const value = item[series];
      const segmentHeight = (value / misMaxValue) * misChartHeight;
      const segmentY = misChartY + misChartHeight - cumulativeHeight - segmentHeight;
      
      pdf.setFillColor(colors[seriesIndex][0], colors[seriesIndex][1], colors[seriesIndex][2]);
      pdf.rect(barX, segmentY, barWidth, segmentHeight, 'F');
      
      cumulativeHeight += segmentHeight;
    });
    
    // Add month label
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text(item.month, barX + barWidth / 2, misChartY + misChartHeight + 8, { align: 'center' });
  });
  
  yPosition += misChartHeight + 20;
  
  // Add footer
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Generated by WealthElite Dashboard', pageWidth / 2, pageHeight - 10, { align: 'center' });
  
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