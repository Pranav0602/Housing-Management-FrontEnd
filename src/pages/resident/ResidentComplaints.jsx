import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaExclamationTriangle, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { complaintService, flatService } from '../../services/api';
import ComplaintForm from '../../components/resident/ComplaintForm';

const ResidentComplaints = () => {
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [flatDetails, setFlatDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get all flats to find the one assigned to the current user
      const flatsResponse = await flatService.getAllFlats();
      const userFlat = flatsResponse.data.find(flat => 
        flat.ownerId === currentUser.id || 
        (flat.residents && flat.residents.some(resident => resident.userId === currentUser.id))
      );
      
      if (userFlat) {
        setFlatDetails(userFlat);
        
        // Fetch complaints for this user
        const complaintsResponse = await complaintService.getAllComplaints();
        const userComplaints = complaintsResponse.data.filter(
          complaint => complaint.raisedById === currentUser.id || complaint.flatId === userFlat.id
        );
        setComplaints(userComplaints);
      } else {
        setError('No flat is currently assigned to you. Please request a flat allocation.');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load complaints. Please try again later.');
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComplaint = () => {
    setEditingComplaint(null);
    setShowForm(true);
  };

  const handleEditComplaint = (complaint) => {
    setEditingComplaint(complaint);
    setShowForm(true);
  };

  const handleDeleteComplaint = async (complaintId) => {
    if (confirmDelete !== complaintId) {
      setConfirmDelete(complaintId);
      return;
    }
    
    try {
      await complaintService.deleteComplaint(complaintId);
      toast.success('Complaint deleted successfully');
      fetchData();
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting complaint:', error);
      toast.error('Failed to delete complaint. Please try again.');
    }
  };

  const handleFormSubmit = async (complaintData) => {
    try {
      // Add user and flat information
      const complaintWithDetails = {
        ...complaintData,
        flatId: flatDetails.id,
        raisedById: currentUser.id
      };
      
      if (editingComplaint) {
        await complaintService.updateComplaint(editingComplaint.id, complaintWithDetails);
        toast.success('Complaint updated successfully');
      } else {
        await complaintService.createComplaint(complaintWithDetails);
        toast.success('Complaint registered successfully');
      }
      
      fetchData();
      setShowForm(false);
      setEditingComplaint(null);
    } catch (error) {
      console.error('Error saving complaint:', error);
      toast.error('Failed to save complaint. Please try again.');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingComplaint(null);
  };

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
  };

  const handleCloseDetails = () => {
    setSelectedComplaint(null);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    // Filter by search term
    const matchesSearch = 
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesStatus = statusFilter ? complaint.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{error}</h2>
        {error.includes('request') && (
          <a 
            href="/resident/request-allocation"
            className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Request Flat Allocation
          </a>
        )}
      </div>
    );
  }

  if (!flatDetails) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Flat Found</h2>
        <p className="text-gray-600 mb-4">
          You don't have a flat assigned yet. Please request a flat allocation.
        </p>
        <a 
          href="/resident/request-allocation"
          className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Request Flat Allocation
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
        <button
          onClick={handleAddComplaint}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <FaPlus className="mr-2" />
          Register Complaint
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingComplaint ? 'Edit Complaint' : 'Register New Complaint'}
          </h2>
          <ComplaintForm
            initialValues={editingComplaint || {}}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex items-center flex-grow">
              <FaSearch className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search complaints..."
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
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {filteredComplaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
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
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                          <FaExclamationTriangle className="text-red-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{complaint.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{complaint.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(complaint)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Details
                      </button>
                      {complaint.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleEditComplaint(complaint)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteComplaint(complaint.id)}
                            className={`${
                              confirmDelete === complaint.id ? 'text-red-600' : 'text-gray-600'
                            } hover:text-red-900`}
                          >
                            <FaTrash />
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
            {searchTerm || statusFilter ? 
              'No complaints match your search criteria.' : 
              'No complaints found. Register your first complaint!'}
          </div>
        )}
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Complaint Details</h3>
              <button
                onClick={handleCloseDetails}
                className="text-gray-400 hover:text-gray-500"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FaExclamationTriangle className="text-red-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-gray-900">{selectedComplaint.title}</h2>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Category</h4>
                  <p className="text-base">{selectedComplaint.category}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date Submitted</h4>
                  <p className="text-base">
                    {new Date(selectedComplaint.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {selectedComplaint.resolvedAt && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Date Resolved</h4>
                    <p className="text-base">
                      {new Date(selectedComplaint.resolvedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="text-base mt-1 bg-gray-50 p-3 rounded-md">
                  {selectedComplaint.description}
                </p>
              </div>
              
              {selectedComplaint.resolution && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Resolution</h4>
                  <p className="text-base mt-1 bg-gray-50 p-3 rounded-md">
                    {selectedComplaint.resolution}
                  </p>
                </div>
              )}
              
              {selectedComplaint.status === 'PENDING' && (
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      handleEditComplaint(selectedComplaint);
                      handleCloseDetails();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Edit Complaint
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

export default ResidentComplaints;