import { useState, useEffect } from 'react';
import { FaBuilding, FaHome, FaUsers, FaExclamationTriangle, FaBell, FaMoneyBillWave } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { societyService, buildingService, flatService, complaintService, noticeService, maintenanceBillService } from '../../services/api';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBuildings: 0,
    totalFlats: 0,
    totalResidents: 0,
    pendingComplaints: 0,
    pendingAllocations: 0,
    unpaidBills: 0
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!currentUser || !currentUser.societyId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch buildings
        const buildingsResponse = await buildingService.getAllBuildings(currentUser.societyId);
        const buildings = buildingsResponse.data || [];
        
        // Fetch flats
        let flats = [];
        try {
          for (const building of buildings) {
            try {
              const flatsResponse = await flatService.getFlatsByBuilding(building.id);
              if (flatsResponse.data) {
                flats = [...flats, ...flatsResponse.data];
              }
            } catch (flatError) {
              console.error(`Error fetching flats for building ${building.id}:`, flatError);
            }
          }
        } catch (buildingError) {
          console.error('Error processing buildings:', buildingError);
        }
        
        // Fetch complaints
        let pendingComplaints = [];
        try {
          const complaintsResponse = await complaintService.getAllComplaints();
          pendingComplaints = (complaintsResponse.data || []).filter(
            complaint => complaint.status === 'PENDING' || complaint.status === 'IN_PROGRESS'
          );
        } catch (complaintsError) {
          console.error('Error fetching complaints:', complaintsError);
        }
        
        // Fetch maintenance bills
        let unpaidBills = [];
        try {
          const billsResponse = await maintenanceBillService.getAllBills();
          unpaidBills = (billsResponse.data || []).filter(bill => !bill.paid);
        } catch (billsError) {
          console.error('Error fetching maintenance bills:', billsError);
        }
        
        // Set stats
        setStats({
          totalBuildings: buildings.length,
          totalFlats: flats.length,
          totalResidents: flats.reduce((acc, flat) => acc + (flat.occupiedStatus === 'OCCUPIED' ? 1 : 0), 0),
          pendingComplaints: pendingComplaints.length,
          pendingAllocations: flats.filter(flat => flat.allocationStatus === 'PENDING').length,
          unpaidBills: unpaidBills.length
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Set default stats to prevent UI from being stuck in loading state
        setStats({
          totalBuildings: 0,
          totalFlats: 0,
          totalResidents: 0,
          pendingComplaints: 0,
          pendingAllocations: 0,
          unpaidBills: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {currentUser?.name}</h1>
        <p className="text-gray-600">Society Admin Dashboard</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Buildings */}
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <FaBuilding className="text-blue-600 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Buildings</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalBuildings}</p>
          </div>
        </div>
        
        {/* Flats */}
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <FaHome className="text-green-600 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Flats</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalFlats}</p>
          </div>
        </div>
        
        {/* Residents */}
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <FaUsers className="text-purple-600 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Residents</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalResidents}</p>
          </div>
        </div>
        
        {/* Pending Complaints */}
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-red-100 p-3 mr-4">
            <FaExclamationTriangle className="text-red-600 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Pending Complaints</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingComplaints}</p>
          </div>
        </div>
        
        {/* Allocation Requests */}
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-yellow-100 p-3 mr-4">
            <FaHome className="text-yellow-600 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Allocation Requests</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingAllocations}</p>
          </div>
        </div>
        
        {/* Unpaid Bills */}
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-indigo-100 p-3 mr-4">
            <FaMoneyBillWave className="text-indigo-600 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Unpaid Bills</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.unpaidBills}</p>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaUsers className="text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">New resident registered</p>
                <p className="text-sm text-gray-500">John Doe requested flat allocation</p>
                <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <FaExclamationTriangle className="text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">New complaint registered</p>
                <p className="text-sm text-gray-500">Water leakage in Building A, Flat 101</p>
                <p className="text-xs text-gray-400 mt-1">3 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <FaMoneyBillWave className="text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Maintenance bill paid</p>
                <p className="text-sm text-gray-500">Building B, Flat 202 paid ₹5,000</p>
                <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <FaBell className="text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">New notice published</p>
                <p className="text-sm text-gray-500">Monthly society meeting scheduled</p>
                <p className="text-xs text-gray-400 mt-1">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;