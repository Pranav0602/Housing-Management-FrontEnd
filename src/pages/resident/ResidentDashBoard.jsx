import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaUsers, FaExclamationTriangle, FaMoneyBillWave, FaBell } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { flatService, complaintService, maintenanceBillService, noticeService } from '../../services/api';

const ResidentDashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [flatDetails, setFlatDetails] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [bills, setBills] = useState([]);
  const [notices, setNotices] = useState([]);
  const [flatMembers, setFlatMembers] = useState([]);
  const [allocationStatus, setAllocationStatus] = useState(null);

  useEffect(() => {
    const fetchResidentData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // --- THIS IS THE REFACTORED LOGIC ---
        // Single, efficient API call to get only the user's flat
        const flatResponse = await flatService.getMyFlat();
        setFlatDetails(flatResponse.data);

        // You can now fetch other data related to this specific flat
        const userFlat = flatResponse.data;
        // Fetch complaints for this flat
        const complaintsResponse = await complaintService.getAllComplaints();
        const userComplaints = complaintsResponse.data.filter(c => c.flatId === userFlat.id);
        setComplaints(userComplaints);
        // ... fetch bills, etc.
        
      } catch (error) {
        // A 404 error from our new endpoint now clearly means no flat is allocated
        if (error.response && error.response.status === 404) {
          console.log("User does not have an allocated flat.");
          setAllocationStatus('NOT_REQUESTED'); 
        } else {
          console.error('Error fetching resident data:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResidentData();
  }, [currentUser]);
        
    
          

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user doesn't have an allocated flat yet
  if (!flatDetails) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {currentUser?.name}</h1>
          <p className="text-gray-600">Resident Portal</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FaHome className="text-blue-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Flat Allocated Yet</h2>
          
          {allocationStatus === 'PENDING' && (
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Your flat allocation request is pending approval from the admin.
                We'll notify you once it's approved.
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                Pending Approval
              </div>
            </div>
          )}
          
          {allocationStatus === 'REJECTED' && (
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Your previous flat allocation request was rejected.
                Please submit a new request or contact the admin for more information.
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Request Rejected
              </div>
            </div>
          )}
          
          {(allocationStatus === 'NOT_REQUESTED' || allocationStatus === 'REJECTED') && (
            <Link 
              to="/resident/request-allocation"
              className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Request Flat Allocation
            </Link>
          )}
        </div>
        
        {/* Society Notices */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Society Notices</h2>
          </div>
          <div className="p-6">
            {notices.length > 0 ? (
              <div className="space-y-4">
                {notices.slice(0, 3).map((notice) => (
                  <div key={notice.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                    <h3 className="font-medium text-gray-900">{notice.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{notice.content}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                      {notice.priority === 'HIGH' && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          Important
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No notices available</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {currentUser?.name}</h1>
        <p className="text-gray-600">Resident Portal</p>
      </div>
      
      {/* Flat Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <FaHome className="text-blue-500 text-2xl mr-3" />
          <h2 className="text-xl font-semibold text-gray-800">Your Flat</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Flat Number</p>
            <p className="font-medium">{flatDetails.flatNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Building</p>
            <p className="font-medium">{flatDetails.buildingName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Floor</p>
            <p className="font-medium">{flatDetails.floor}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Type</p>
            <p className="font-medium">{flatDetails.type}</p>
          </div>
        </div>
        <div className="mt-4">
          <Link 
            to="/resident/flat"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Details →
          </Link>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Family Members */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-2 mr-3">
                <FaUsers className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Family Members</h3>
            </div>
            <span className="text-2xl font-bold text-gray-900">{flatMembers.length}</span>
          </div>
          <Link 
            to="/resident/family-members"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Manage Members →
          </Link>
        </div>
        
        {/* Complaints */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="rounded-full bg-red-100 p-2 mr-3">
                <FaExclamationTriangle className="text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Complaints</h3>
            </div>
            <span className="text-2xl font-bold text-gray-900">{complaints.length}</span>
          </div>
          <Link 
            to="/resident/complaints"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Complaints →
          </Link>
        </div>
        
        {/* Bills */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-2 mr-3">
                <FaMoneyBillWave className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Pending Bills</h3>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {bills.filter(bill => !bill.paid).length}
            </span>
          </div>
          <Link 
            to="/resident/maintenance"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Bills →
          </Link>
        </div>
      </div>
      
      {/* Recent Notices */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Recent Notices</h2>
          <Link 
            to="/resident/notices"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View All
          </Link>
        </div>
        <div className="p-6">
          {notices.length > 0 ? (
            <div className="space-y-4">
              {notices.slice(0, 3).map((notice) => (
                <div key={notice.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                  <h3 className="font-medium text-gray-900">{notice.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{notice.content}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
                    {notice.priority === 'HIGH' && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        Important
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No notices available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;