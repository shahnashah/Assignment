"use client"

import React, { useState, useEffect, useRef } from 'react';
import { 
  Filter,
  MapPin,
  Settings,
  Bell,
  User,
  ChevronDown,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Share2,
  BarChart3,
  PieChart,
  ArrowUp,
  Sun,
  Moon,
  Search,
  Star,
  Users,
  Lock,
  LogOut,
  ShoppingBag,
  ArrowDownCircle,
  RefreshCw,
  XCircle,
  Plus,
  FileText,
  FileDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Tooltip,
  LineChart, 
  Line, 
  Area,
  AreaChart,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  ComposedChart
} from 'recharts';

import { makeDashboardPdf, prepareDashboardData } from '../lib/pdf/makeReport';
import { saveOrSharePdf, saveOnlyPdf, shareOnlyPdf } from '../lib/mobile/saveSharePdf';
import { isNative } from '../utils/platform';

const WealthDashboard = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('3 Days');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [sharingPdf, setSharingPdf] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isNativePlatform, setIsNativePlatform] = useState(false);
  
  // Refs for chart components
  const clientsChartRef = useRef(null);
  const sipChartRef = useRef(null);
  const monthlyMisChartRef = useRef(null);

  // Sample data for charts
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

  const menuItems = [
    'HOME', 'CRM', 'UTILITIES', 'INSURANCE', 'ASSETS', 'MUTUAL', 'RESEARCH', 
    'TRANSACT ONLINE', 'GOAL GPS', 'FINANCIAL PLANNING', 'WEALTH REPORT', 'OTHERS'
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setLoading(true);
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    setIsNativePlatform(Capacitor.isNativePlatform());
  }, []);
  
  const handleSavePdf = async () => {
    setGeneratingPdf(true);
    
    try {
      // Prepare dashboard data for PDF
      const dashboardData = prepareDashboardData();
      
      // Prepare chart refs
      const chartRefs = {
        'Clients Chart': clientsChartRef,
        'SIP Business Chart': sipChartRef,
        'Monthly MIS Chart': monthlyMisChartRef
      };
      
      if (isNative()) {
        // Native platform (iOS/Android): use Capacitor file system and sharing
        const { base64 } = await makeDashboardPdf(dashboardData, chartRefs, darkMode);
        
        // First try save-only approach to avoid share cancellation issues
        const saveResult = await saveOnlyPdf(base64);
        
        if (saveResult.success) {
          setToastMessage(saveResult.message + ' Tap to share if needed.');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 5000);
          
          // Optional: Try to share after successful save
          try {
            const shareResult = await saveOrSharePdf(base64);
            // Don't override success message if share fails
          } catch (shareError) {
            console.log('Share failed but file was saved:', shareError);
          }
        } else {
          alert(saveResult.message);
        }
      } else {
        // Web platform (browser/Next.js dev): use traditional download
        const { blob } = await makeDashboardPdf(dashboardData, chartRefs, darkMode);
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'wealth-dashboard-report.pdf';
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the object URL
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
        
        setToastMessage('PDF downloaded successfully to your Downloads folder');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleShareOnlyPdf = async () => {
    setSharingPdf(true);
    
    try {
      // Prepare dashboard data for PDF
      const dashboardData = prepareDashboardData();
      
      // Prepare chart refs
      const chartRefs = {
        'Clients Chart': clientsChartRef,
        'SIP Business Chart': sipChartRef,
        'Monthly MIS Chart': monthlyMisChartRef
      };
      
      // Generate PDF and share without permanent storage
      const { base64 } = await makeDashboardPdf(dashboardData, chartRefs, darkMode);
      const shareResult = await shareOnlyPdf(base64);
      
      if (shareResult.success) {
        setToastMessage(shareResult.message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert(shareResult.message);
      }
    } catch (error) {
      console.error('PDF share error:', error);
      alert('Failed to share PDF. Please try again.');
    } finally {
      setSharingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Top Header */}
      <div className={`px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between border-b transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        {/* Logo and Search */}
        <div className="flex items-center flex-1">
          <div className="text-xl sm:text-2xl font-bold text-blue-600 mr-4 lg:mr-8">
            <span className="text-blue-500">Wealth</span>
            <span className="text-green-500">Elite</span>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 mr-4"
            onClick={toggleMobileMenu}
          >
            <Menu className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
          
          {/* Search Bar - Hidden on small screens */}
          <div className="relative hidden sm:block flex-1 max-w-md">
            <input 
              type="text" 
              placeholder="eg Live portfolio"
              className={`w-full px-3 sm:px-4 py-2 border rounded text-sm transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
            />
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* PDF Download Button */}
            <button
              onClick={handleSavePdf}
              disabled={generatingPdf}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium transition-all duration-200 ${
                generatingPdf
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : darkMode
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">
                {generatingPdf 
                  ? 'Generating...' 
                  : isNativePlatform 
                    ? 'Save/Share PDF' 
                    : 'Download PDF'
                }
              </span>
            </button>

            {/* Share PDF Only Button - Native platforms only */}
            {isNativePlatform && (
              <button
                onClick={handleShareOnlyPdf}
                disabled={sharingPdf || generatingPdf}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium transition-all duration-200 ${
                  sharingPdf || generatingPdf
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : darkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {sharingPdf ? 'Sharing...' : 'Share PDF Only'}
                </span>
              </button>
            )}
          {/* Hide some icons on small screens */}
          <div className="hidden md:flex items-center space-x-4">
            <Filter className={`w-5 h-5 cursor-pointer transition-colors duration-300 ${
              darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
            }`} />
            <MapPin className={`w-5 h-5 cursor-pointer transition-colors duration-300 ${
              darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
            }`} />
            <Settings className={`w-5 h-5 cursor-pointer transition-colors duration-300 ${
              darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
            }`} />
          </div>
          
          <Bell className={`w-5 h-5 cursor-pointer transition-colors duration-300 ${
            darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
          }`} />
          
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode} 
            className={`p-2 rounded-lg transition-all duration-300 ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />}
          </button>
          
          <div className="flex items-center space-x-2 cursor-pointer">
            <span className={`text-xs sm:text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>LOGOUT</span>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className={`sm:hidden px-4 py-3 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="relative">
          <input 
            type="text" 
            placeholder="eg Live portfolio"
            className={`w-full px-4 py-2 border rounded text-sm transition-colors duration-300 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            }`}
          />
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-red-600">
        {/* Desktop Navigation */}
        <div className="hidden lg:block px-4">
          <div className="flex items-center space-x-8 text-white text-sm font-medium overflow-x-auto">
            {menuItems.map((item, index) => (
              <div key={index} className="py-3 cursor-pointer hover:bg-red-700 px-2 transition-colors duration-200 flex items-center whitespace-nowrap">
                <span>{item}</span>
                {(item === 'INSURANCE' || item === 'ASSETS' || item === 'OTHERS') && (
                  <ChevronDown className="w-3 h-3 ml-1" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-red-600 border-t border-red-700">
            <div className="px-4 py-2 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {menuItems.map((item, index) => (
                  <div key={index} className="py-2 px-3 cursor-pointer hover:bg-red-700 text-white text-xs font-medium rounded transition-colors duration-200 flex items-center justify-between">
                    <span>{item}</span>
                    {(item === 'INSURANCE' || item === 'ASSETS' || item === 'OTHERS') && (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Top Stats Row - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6">
          {/* AUM Card */}
          <div className={`p-4 sm:p-6 rounded-lg shadow-sm transition-colors duration-300 ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
              <div className="mb-4 sm:mb-0">
                <div className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current</div>
                <div className="text-2xl sm:text-3xl font-bold">AUM 12.19 <span className="text-lg">Cr</span></div>
                <div className="flex items-center text-green-600 text-sm mt-2">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span>+0.77% MoM</span>
                </div>
              </div>
              <button style={{ color: '#DC2626', borderColor: '#DC2626' }} className="border px-3 py-1 rounded text-xs transition-colors duration-200 self-start" onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                View Report
              </button>
            </div>
            <div className="text-right">
              <button className="text-green-600 text-sm flex items-center ml-auto hover:underline">
                View Trend <ChevronDown className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>

          {/* SIP Card */}
          <div className={`p-4 sm:p-6 rounded-lg shadow-sm transition-colors duration-300 ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
              <div className="mb-4 sm:mb-0">
                <div className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current</div>
                <div className="text-2xl sm:text-3xl font-bold">SIP 1.39 <span className="text-lg">Lakh</span></div>
                <div className="flex items-center text-green-600 text-sm mt-2">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span>+0% MoM</span>
                </div>
              </div>
              <button style={{ color: '#DC2626', borderColor: '#DC2626' }} className="border px-3 py-1 rounded text-xs transition-colors duration-200 self-start" onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                View Report
              </button>
            </div>
            <div className="text-right">
              <button className="text-green-600 text-sm flex items-center ml-auto hover:underline">
                View Trend <ChevronDown className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Buttons - Responsive */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
          {['3 Days', '7 Days', '15 Days', '30 Days'].map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeFilter === filter
                  ? 'bg-red-100 text-red-600'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Stats Cards Row - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {[
            { 
              title: 'Purchases', 
              value: 0, 
              amount: '0.00 INR', 
              icon: () => (
                <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
                  <div className="relative">
                    <div className="w-3 h-2 rounded-sm mb-1" style={{ backgroundColor: '#DC2626' }}></div>
                    <div className="w-1 h-2 rounded-full mx-auto" style={{ backgroundColor: '#DC2626' }}></div>
                  </div>
                </div>
              )
            },
            { 
              title: 'Redemptions', 
              value: 0, 
              amount: '0.00 INR', 
              icon: () => (
                <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
                  <div className="w-4 h-3 rounded-sm relative" style={{ border: '2px solid #DC2626' }}>
                    <div className="w-2 h-1 absolute -top-1 left-1" style={{ backgroundColor: '#DC2626' }}></div>
                  </div>
                </div>
              )
            },
            { 
              title: 'Reg Transactions', 
              value: 0, 
              amount: '0.00 INR', 
              icon: () => (
                <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
                  <div className="relative">
                    <div className="w-3 h-2 rounded-sm mb-1" style={{ backgroundColor: '#DC2626' }}></div>
                    <div className="w-1 h-2 rounded-full mx-auto" style={{ backgroundColor: '#DC2626' }}></div>
                    <div className="w-2 h-1 rounded absolute -top-1 right-0" style={{ backgroundColor: '#DC2626' }}></div>
                  </div>
                </div>
              )
            },
            { 
              title: 'SIP Rejections', 
              value: 0, 
              amount: '0.00 INR', 
              icon: () => (
                <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
                  <div className="relative w-4 h-4">
                    <div className="w-4 h-4 rounded-full relative" style={{ border: '2px solid #DC2626' }}>
                      <div className="absolute inset-1 flex items-center justify-center">
                        <div className="w-2 h-0.5 transform rotate-45" style={{ backgroundColor: '#DC2626' }}></div>
                        <div className="w-2 h-0.5 transform -rotate-45 absolute" style={{ backgroundColor: '#DC2626' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            },
            { 
              title: 'New SIP', 
              value: 0, 
              amount: '0.00 INR', 
              icon: () => (
                <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
                  <div className="relative w-5 h-4 flex items-end justify-center space-x-0.5">
                    <div className="w-0.5 h-1" style={{ backgroundColor: '#DC2626' }}></div>
                    <div className="w-0.5 h-2" style={{ backgroundColor: '#DC2626' }}></div>
                    <div className="w-0.5 h-3" style={{ backgroundColor: '#DC2626' }}></div>
                    <div className="w-0.5 h-4" style={{ backgroundColor: '#DC2626' }}></div>
                    <div className="absolute -top-1 right-0">
                      <div className="w-1 h-1 transform rotate-45" style={{ borderTop: '2px solid #DC2626', borderRight: '2px solid #DC2626' }}></div>
                    </div>
                  </div>
                </div>
              )
            }
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className={`p-3 sm:p-4 rounded-lg shadow-sm transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                  <button className="text-red-500 border border-red-500 px-2 py-1 rounded text-xs hover:bg-red-50 transition-colors duration-200">
                    View Report
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <IconComponent />
                  <div>
                    <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.title}</div>
                    <div className="text-xs sm:text-sm font-medium">{stat.amount}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Clients Pie Chart */}
          <div 
            ref={clientsChartRef}
            className={`p-4 sm:p-6 rounded-lg shadow-sm transition-colors duration-300 ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-0">CLIENTS</h3>
              <button className="text-red-500 border border-red-500 px-3 py-1 rounded text-xs hover:bg-red-50 transition-colors duration-200 self-start">
                Download Report
              </button>
            </div>
            <div className="relative h-48 sm:h-64">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-32 sm:w-48 h-32 sm:h-48 rounded-full flex items-center justify-center relative" style={{ backgroundColor: '#DC2626' }}>
                    <div className="text-white text-center">
                      <div className="text-2xl sm:text-4xl font-bold">3824</div>
                    </div>
                    
                    <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-12 sm:w-20 h-12 sm:h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F59E0B' }}>
                      <span className="text-white font-bold text-sm sm:text-lg">60</span>
                    </div>
                    
                    <div className="absolute -bottom-1 sm:-bottom-2 left-4 sm:left-8 text-white font-bold text-base sm:text-xl">541</div>
                    
                    <div className="absolute -bottom-3 sm:-bottom-6 -left-3 sm:-left-6 w-8 sm:w-12 h-8 sm:h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#059669' }}>
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
                <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#059669' }}></div>
                <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>New</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#DC2626' }}></div>
                <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#B91C1C' }}></div>
                <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>InActive</span>
              </div>
            </div>
          </div>

          {/* SIP Business Chart */}
          <div 
            ref={sipChartRef}
            className={`p-4 sm:p-6 rounded-lg shadow-sm transition-colors duration-300 ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-0">SIP BUSINESS CHART</h3>
              <button className="text-red-500 border border-red-500 px-3 py-1 rounded text-xs hover:bg-red-50 transition-colors duration-200 self-start">
                View Report
              </button>
            </div>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={sipData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
                  <YAxis yAxisId="left" stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      border: '1px solid #e5e7eb',
                      color: darkMode ? '#ffffff' : '#000000'
                    }} 
                  />
                  <Bar yAxisId="left" dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly MIS */}
          <div 
            ref={monthlyMisChartRef}
            className={`p-4 sm:p-6 rounded-lg shadow-sm transition-colors duration-300 lg:col-span-2 xl:col-span-1 ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-0">MONTHLY MIS</h3>
              <button className="text-red-500 border border-red-500 px-3 py-1 rounded text-xs hover:bg-red-50 transition-colors duration-200 self-start">
                View Report
              </button>
            </div>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyMisData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
                  <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      border: '1px solid #e5e7eb',
                      color: darkMode ? '#ffffff' : '#000000'
                    }} 
                  />
                  <Area type="monotone" dataKey="series1" stackId="1" stroke="rgb(239, 68, 68)" fill="rgb(239, 68, 68)" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="series2" stackId="1" stroke="rgb(34, 197, 94)" fill="rgb(34, 197, 94)" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="series3" stackId="1" stroke="rgb(59, 130, 246)" fill="rgb(59, 130, 246)" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 duration-300">
          <div className={`px-4 py-3 rounded-lg shadow-lg max-w-sm ${
            darkMode 
              ? 'bg-gray-800 text-white border border-gray-700' 
              : 'bg-white text-gray-900 border border-gray-200'
          }`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Success!</p>
                <p className={`text-xs mt-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {toastMessage}
                </p>
              </div>
              <button 
                onClick={() => setShowToast(false)}
                className={`flex-shrink-0 ${
                  darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                } transition-colors duration-200`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WealthDashboard;