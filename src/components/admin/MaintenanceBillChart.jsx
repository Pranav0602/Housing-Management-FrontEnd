import { useState, useEffect } from 'react';
import { FaChartBar, FaChartPie, FaChartLine, FaCalendarAlt } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const MaintenanceBillsChart = ({ bills, flats }) => {
  const [chartType, setChartType] = useState('monthly'); // monthly, status, building
  const [chartData, setChartData] = useState(null);
  const [timeRange, setTimeRange] = useState('6'); // months

  useEffect(() => {
    if (bills && bills.length > 0) {
      generateChartData();
    }
  }, [bills, chartType, timeRange]);

  const generateChartData = () => {
    switch (chartType) {
      case 'monthly':
        generateMonthlyData();
        break;
      case 'status':
        generateStatusData();
        break;
      case 'building':
        generateBuildingData();
        break;
      default:
        generateMonthlyData();
    }
  };

  const generateMonthlyData = () => {
    // Filter bills based on time range
    const months = parseInt(timeRange);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const filteredBills = bills.filter(bill => new Date(bill.billDate) >= startDate);
    
    // Group bills by month
    const monthlyData = {};
    const monthlyPaidData = {};
    
    filteredBills.forEach(bill => {
      const date = new Date(bill.billDate);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
        monthlyPaidData[monthYear] = 0;
      }
      
      monthlyData[monthYear] += bill.amount;
      if (bill.paid) {
        monthlyPaidData[monthYear] += bill.amount;
      }
    });
    
    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      const [aMonth, aYear] = [a.split(' ')[0], parseInt(a.split(' ')[1])];
      const [bMonth, bYear] = [b.split(' ')[0], parseInt(b.split(' ')[1])];
      
      if (aYear !== bYear) return aYear - bYear;
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthNames.indexOf(aMonth) - monthNames.indexOf(bMonth);
    });
    
    setChartData({
      labels: sortedMonths,
      datasets: [
        {
          label: 'Total Billed',
          data: sortedMonths.map(month => monthlyData[month]),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        },
        {
          label: 'Total Collected',
          data: sortedMonths.map(month => monthlyPaidData[month]),
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1
        }
      ]
    });
  };

  const generateStatusData = () => {
    // Count paid vs unpaid bills
    const paidBills = bills.filter(bill => bill.paid);
    const unpaidBills = bills.filter(bill => !bill.paid);
    
    // Calculate total amounts
    const paidAmount = paidBills.reduce((sum, bill) => sum + bill.amount, 0);
    const unpaidAmount = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0);
    
    setChartData({
      labels: ['Paid', 'Unpaid'],
      datasets: [
        {
          data: [paidAmount, unpaidAmount],
          backgroundColor: ['rgba(16, 185, 129, 0.5)', 'rgba(239, 68, 68, 0.5)'],
          borderColor: ['rgb(16, 185, 129)', 'rgb(239, 68, 68)'],
          borderWidth: 1
        }
      ]
    });
  };

  const generateBuildingData = () => {
    // Group bills by building
    const buildingData = {};
    const buildingPaidData = {};
    
    bills.forEach(bill => {
      const flat = flats.find(flat => flat.id === bill.flatId);
      if (!flat) return;
      
      const buildingName = flat.buildingName || 'Unknown Building';
      
      if (!buildingData[buildingName]) {
        buildingData[buildingName] = 0;
        buildingPaidData[buildingName] = 0;
      }
      
      buildingData[buildingName] += bill.amount;
      if (bill.paid) {
        buildingPaidData[buildingName] += bill.amount;
      }
    });
    
    const buildings = Object.keys(buildingData);
    
    setChartData({
      labels: buildings,
      datasets: [
        {
          label: 'Total Billed',
          data: buildings.map(building => buildingData[building]),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        },
        {
          label: 'Total Collected',
          data: buildings.map(building => buildingPaidData[building]),
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1
        }
      ]
    });
  };

  // Function to render chart based on chartData and chartType
  const renderChart = () => {
    if (!chartData) return null;
    
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: getChartTitle(),
        },
      },
    };
    
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="h-64">
          {chartType === 'status' ? (
            <Pie data={chartData} options={options} />
          ) : (
            <Bar data={chartData} options={options} />
          )}
        </div>
        
        {/* Display data summary */}
        <div className="mt-4 border-t pt-4">
          <h4 className="font-medium text-gray-700 mb-2">Data Summary:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chartType === 'monthly' && (
              <>
                <div>
                  <p className="text-sm text-gray-500">Time Range:</p>
                  <p className="font-medium">Last {timeRange} months</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Months:</p>
                  <p className="font-medium">{chartData.labels.length}</p>
                </div>
              </>
            )}
            
            <div>
              <p className="text-sm text-gray-500">Total Billed:</p>
              <p className="font-medium">₹{getTotalBilled().toLocaleString()}</p>
            </div>
            
            {chartType !== 'status' && (
              <div>
                <p className="text-sm text-gray-500">Total Collected:</p>
                <p className="font-medium">₹{getTotalCollected().toLocaleString()}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm text-gray-500">Collection Rate:</p>
              <p className="font-medium">
                {getCollectionRate()}%
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getChartTitle = () => {
    switch (chartType) {
      case 'monthly':
        return `Monthly Maintenance Bills (Last ${timeRange} Months)`;
      case 'status':
        return 'Maintenance Bills by Payment Status';
      case 'building':
        return 'Maintenance Bills by Building';
      default:
        return 'Maintenance Bills Analytics';
    }
  };

  const getTotalBilled = () => {
    if (!chartData) return 0;
    
    if (chartType === 'status') {
      return chartData.datasets[0].data.reduce((a, b) => a + b, 0);
    } else {
      return chartData.datasets[0].data.reduce((a, b) => a + b, 0);
    }
  };

  const getTotalCollected = () => {
    if (!chartData) return 0;
    
    if (chartType === 'status') {
      return chartData.datasets[0].data[0] || 0;
    } else {
      return chartData.datasets[1].data.reduce((a, b) => a + b, 0);
    }
  };

  const getCollectionRate = () => {
    const totalBilled = getTotalBilled();
    if (totalBilled === 0) return '0.0';
    
    const totalCollected = getTotalCollected();
    return ((totalCollected / totalBilled) * 100).toFixed(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Maintenance Bills Analytics</h2>
          <p className="text-sm text-gray-500">Visualize maintenance bill data and collection trends</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Chart Type Selector */}
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setChartType('monthly')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                chartType === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300`}
            >
              <FaChartLine className="inline mr-1" /> Monthly
            </button>
            <button
              type="button"
              onClick={() => setChartType('status')}
              className={`px-4 py-2 text-sm font-medium ${
                chartType === 'status'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border-t border-b border-gray-300`}
            >
              <FaChartPie className="inline mr-1" /> Status
            </button>
            <button
              type="button"
              onClick={() => setChartType('building')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                chartType === 'building'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300`}
            >
              <FaChartBar className="inline mr-1" /> By Building
            </button>
          </div>
          
          {/* Time Range Selector (only for monthly view) */}
          {chartType === 'monthly' && (
            <div className="inline-flex items-center rounded-md shadow-sm">
              <div className="px-3 py-2 text-sm font-medium bg-gray-100 border border-gray-300 rounded-l-md">
                <FaCalendarAlt className="inline mr-1" /> Range
              </div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 text-sm font-medium bg-white border-t border-b border-r border-gray-300 rounded-r-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
                <option value="24">24 Months</option>
              </select>
            </div>
          )}
        </div>
      </div>
      
      {bills.length > 0 ? (
        renderChart()
      ) : (
        <div className="p-6 text-center text-gray-500 bg-white rounded-lg shadow">
          <FaChartBar className="mx-auto text-4xl mb-2" />
          <p>No bill data available for visualization</p>
          <p className="text-sm mt-2">Generate bills to see analytics</p>
        </div>
      )}
    </div>
  );
};

export default MaintenanceBillsChart;