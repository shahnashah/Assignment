# WealthElite Dashboard

A comprehensive wealth management dashboard built with Next.js, featuring real-time financial data visualization, interactive charts, and PDF report generation capabilities.

## 🚀 Features

### 📊 Dashboard Overview
- **Real-time AUM (Assets Under Management)** tracking with month-over-month growth indicators
- **SIP (Systematic Investment Plan)** monitoring with performance metrics
- **Interactive time-based filtering** (3 Days, 7 Days, 15 Days, 30 Days)
- **Responsive design** that works seamlessly across desktop, tablet, and mobile devices

### 📈 Advanced Data Visualization

#### 1. Client Analytics Chart
- **Interactive pie chart** displaying client distribution
- Categories: Active, Inactive, New, and Online clients
- Real-time client count: 3,824 Active, 541 Inactive, 2 New, 60 Online
- Color-coded legend for easy identification

#### 2. SIP Business Chart
- **Composed chart** combining bar and line visualizations
- Monthly SIP amount tracking with target comparison
- Interactive tooltips showing detailed metrics
- Trend analysis for business performance

#### 3. Monthly MIS (Management Information System) Chart
- **Stacked area chart** for multi-series data visualization
- Three data series with distinct color coding
- Monthly performance tracking across different metrics
- Smooth area transitions for better visual appeal

### 💼 Transaction Monitoring
Real-time tracking of financial transactions including:
- **Purchases**: Transaction count and total amount
- **Redemptions**: Withdrawal tracking
- **Regular Transactions**: Standard transaction monitoring
- **SIP Rejections**: Failed SIP transaction alerts
- **New SIP**: Fresh SIP registrations

### 🎨 User Experience Features

#### Dark/Light Mode Toggle
- **Seamless theme switching** between light and dark modes
- **Persistent theme preference** across sessions
- **Smooth transitions** with CSS animations
- **Optimized contrast** for better readability in both modes

#### Responsive Navigation
- **Collapsible sidebar** for desktop users
- **Mobile-friendly hamburger menu** for smaller screens
- **Comprehensive navigation menu** with 12+ sections:
  - HOME, CRM, UTILITIES, INSURANCE, ASSETS, MUTUAL
  - RESEARCH, TRANSACT ONLINE, GOAL GPS, FINANCIAL PLANNING
  - WEALTH REPORT, OTHERS

#### Interactive Elements
- **Hover effects** on all interactive components
- **Loading states** with animated spinners
- **Dropdown menus** for advanced filtering
- **Search functionality** with live suggestions

### 📄 PDF Report Generation

#### Comprehensive Report Features
- **Automated PDF generation** of complete dashboard data
- **Multi-page layout** with professional formatting
- **Chart visualization export** including all three chart types
- **Statistical tables** with formatted data presentation
- **Custom styling** that adapts to current theme (dark/light mode)

#### Report Contents
1. **Executive Summary** with key statistics
2. **AUM and SIP Performance** metrics
3. **Transaction Statistics** detailed breakdown
4. **Client Analytics** with distribution data
5. **Visual Charts** exported as high-quality images
6. **Professional formatting** with headers, footers, and branding

#### Technical Implementation
- Uses `jsPDF` for PDF document creation
- `html2canvas` for chart image capture
- `jspdf-autotable` for structured data tables
- Supports both light and dark theme exports
- Optimized file size and quality

### 🛠 Technical Stack

#### Frontend Framework
- **Next.js 15.4.6** - React framework with App Router
- **React 19.1.0** - Latest React with concurrent features
- **Tailwind CSS 4.1.11** - Utility-first CSS framework

#### Data Visualization
- **Recharts 3.1.2** - Composable charting library
- **Lucide React 0.539.0** - Beautiful icon library
- **Custom chart components** with responsive design

#### PDF Generation
- **jsPDF** - Client-side PDF generation
- **html2canvas** - HTML to canvas conversion
- **jspdf-autotable** - Table generation for PDFs

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dashboard
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## 📱 Responsive Design

The dashboard is fully responsive and optimized for:
- **Desktop** (1024px+): Full feature set with sidebar navigation
- **Tablet** (768px-1023px): Adapted layout with collapsible elements
- **Mobile** (320px-767px): Mobile-first design with hamburger menu

## 🎯 Key Metrics Displayed

### Financial Metrics
- **Current AUM**: ₹12.19 Cr (+0.77% MoM)
- **Current SIP**: ₹1.39 Lakh (+0% MoM)
- **Transaction volumes** across all categories
- **Client distribution** and engagement metrics

### Performance Indicators
- **Month-over-Month growth** tracking
- **Trend analysis** with visual indicators
- **Target vs. actual** performance comparison
- **Real-time status updates**

## 🔧 Customization

### Theme Customization
- Modify colors in `tailwind.config.js`
- Update dark mode preferences in the component
- Customize chart colors in the data configuration

### Data Integration
- Replace sample data with real API endpoints
- Modify chart configurations in `WealthDashboard.js`
- Update PDF generation templates in `pdfGenerator.js`

## 📊 Chart Configuration

Each chart is highly configurable:
- **Color schemes** can be customized per theme
- **Data refresh intervals** can be adjusted
- **Chart types** can be swapped (bar, line, area, pie)
- **Responsive breakpoints** can be modified

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Deploy with zero configuration
3. Automatic deployments on git push

### Other Platforms
- **Netlify**: Drag and drop the `out` folder after `npm run build`
- **AWS S3**: Upload static files after `npm run export`
- **Docker**: Use the included Dockerfile for containerization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the component code for implementation details

---

**Built with ❤️ using Next.js and modern web technologies**
