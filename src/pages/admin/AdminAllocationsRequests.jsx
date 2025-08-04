import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaHome, FaUser, FaCheck, FaTimes, FaSearch, FaFilter } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { flatService } from '../../services/api';
import { useWebSocket } from '../../context/WebSocketContext';

const AdminAllocationRequests = () => {
  const { currentUser } = useAuth();
  const { sendMessage } = useWebSocket();
  const [allocationRequests, setAllocationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchAllocationRequests();
  }, [currentUser, statusFilter]);

  const fetchAllocationRequests = async () => {
    if (!currentUser || !currentUser.societyId) return;
    
    try {
      setLoading(true);
      const response = await flatService.getAllFlatAllocationRequests(currentUser.societyId);
      
      // Filter requests based on status
      const filteredRequests = statusFilter === 'ALL' 
        ? response.data 
        : response.data.filter(req => req.status === statusFilter);
      
      setAllocationRequests(filteredRequests);
    } catch (error) {
      console.error('Error fetching allocation requests:', error);
      toast.error('Failed to load allocation requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await flatService.approveAllocationRequest(requestId);
      
      // Send WebSocket notification to the resident
      const request = allocationRequests.find(req => req.id === requestId);
      if (request) {
        sendMessage(`/app/user/${request.userId}/notifications`, {
          type: 'ALLOCATION_APPROVED',
          message: `Your flat allocation request for ${request.flatNumber} has been approved`,
          data: {
            requestId: request.id,
            flatId: request.flatId,
            flatNumber: request.flatNumber
          }
        });
      }
      
      toast.success('Allocation request approved successfully');
      fetchAllocationRequests();
    } catch (error) {
      console.error('Error approving allocation request:', error);
      toast.error('Failed to approve request. Please try again.');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await flatService.rejectAllocationRequest(requestId);
      
      // Send WebSocket notification to the resident
      const request = allocationRequests.find(req => req.id === requestId);
      if (request) {
        sendMessage(`/app/user/${request.userId}/notifications`, {
          type: 'ALLOCATION_REJECTED',
          message: `Your flat allocation request for ${request.flatNumber} has been rejected`,
          data: {
            requestId: request.id,
            flatId: request.flatId,
            flatNumber: request.flatNumber
          }
        });
      }
      
      toast.success('Allocation request rejected successfully');
      fetchAllocationRequests();
    } catch (error) {
      console.error('Error rejecting allocation request:', error);
      toast.error('Failed to reject request. Please try again.');
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
  };

  const handleCloseDetails = () => {
    setSelectedRequest(null);
  };

  const filteredRequests = allocationRequests.filter(request => 
    request.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.flatNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && allocationRequests.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Flat Allocation Requests</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex items-center flex-grow">
              <FaSearch className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search by name, email, or flat number..."
                className="border-none focus:ring-0 flex-grow"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center">
              <FaFilter className="text-gray-400 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-none focus:ring-0"
              >
                <option value="ALL">All Requests</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {filteredRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resident
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flat
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resident Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Family Members
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaUser className="text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                          <div className="text-sm text-gray-500">{request.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                          <FaHome className="text-green-600" />
                        </div>
                        <div className="text-sm text-gray-900">{request.flatNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.residentType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.familyMembers}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                          request.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(request)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Details
                      </button>
                      
                      {request.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            {searchTerm || statusFilter !== 'ALL' ? 
              'No allocation requests match your search criteria.' : 
              'No allocation requests found.'}
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Allocation Request Details</h3>
              <button
                onClick={handleCloseDetails}
                className="text-gray-400 hover:text-gray-500"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Resident Name</h4>
                  <p className="text-base">{selectedRequest.userName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <p className="text-base">{selectedRequest.userEmail}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Flat Number</h4>
                  <p className="text-base">{selectedRequest.flatNumber}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Resident Type</h4>
                  <p className="text-base">{selectedRequest.residentType}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Family Members</h4>
                  <p className="text-base">{selectedRequest.familyMembers}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Occupation</h4>
                  <p className="text-base">{selectedRequest.occupation}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Emergency Contact</h4>
                  <p className="text-base">{selectedRequest.emergencyContact}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${selectedRequest.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                      selectedRequest.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>
              
              {selectedRequest.status === 'PENDING' && (
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      handleRejectRequest(selectedRequest.id);
                      handleCloseDetails();
                    }}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                  >
                    Reject Request
                  </button>
                  <button
                    onClick={() => {
                      handleApproveRequest(selectedRequest.id);
                      handleCloseDetails();
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Approve Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAllocationRequests;