import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaHome, FaBuilding, FaRulerCombined, FaUserFriends, FaMoneyBillWave } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { flatService } from '../../services/api';

const ResidentFlat = () => {
  const { currentUser } = useAuth();
  const [flatDetails, setFlatDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFlatDetails();
  }, [currentUser]);

  const fetchFlatDetails = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get all flats to find the one assigned to the current user
      const response = await flatService.getAllFlats();
      const userFlat = response.data.find(flat => 
        flat.ownerId === currentUser.id || 
        (flat.residents && flat.residents.some(resident => resident.userId === currentUser.id))
      );
      
      if (userFlat) {
        setFlatDetails(userFlat);
      } else {
        setError('No flat is currently assigned to you. Please request a flat allocation.');
      }
    } catch (err) {
      console.error('Error fetching flat details:', err);
      setError('Failed to load flat details. Please try again later.');
      toast.error('Failed to load flat details');
    } finally {
      setLoading(false);
    }
  };

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
        <FaHome className="text-blue-500 text-5xl mx-auto mb-4" />
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
        <FaHome className="text-blue-500 text-5xl mx-auto mb-4" />
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
      <h1 className="text-2xl font-bold text-gray-900">My Flat</h1>
      
      {/* Flat Overview Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <FaHome className="text-blue-600 text-2xl" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-gray-900">Flat {flatDetails.flatNumber}</h2>
              <p className="text-gray-600">{flatDetails.buildingName || 'Building'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Flat Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaHome className="mr-2 text-blue-500" />
                Flat Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{flatDetails.type || 'Standard'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Floor:</span>
                  <span className="font-medium">{flatDetails.floor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Area:</span>
                  <span className="font-medium">{flatDetails.area} sq.ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bedrooms:</span>
                  <span className="font-medium">{flatDetails.bedrooms || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bathrooms:</span>
                  <span className="font-medium">{flatDetails.bathrooms || '-'}</span>
                </div>
              </div>
            </div>
            
            {/* Building Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaBuilding className="mr-2 text-blue-500" />
                Building Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Building Name:</span>
                  <span className="font-medium">{flatDetails.buildingName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Floors:</span>
                  <span className="font-medium">{flatDetails.totalFloors || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium">{flatDetails.buildingAddress || '-'}</span>
                </div>
              </div>
            </div>
            
            {/* Occupancy Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaUserFriends className="mr-2 text-blue-500" />
                Occupancy Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{flatDetails.occupiedStatus || 'OCCUPIED'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Resident Type:</span>
                  <span className="font-medium">{flatDetails.residentType || 'OWNER'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Family Members:</span>
                  <span className="font-medium">{flatDetails.familyMembers || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Since:</span>
                  <span className="font-medium">
                    {flatDetails.occupiedSince ? new Date(flatDetails.occupiedSince).toLocaleDateString() : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a 
          href="/resident/family-members" 
          className="bg-white rounded-lg shadow p-6 flex items-center hover:bg-gray-50 transition"
        >
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <FaUserFriends className="text-blue-600 text-xl" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Family Members</h3>
            <p className="text-sm text-gray-600">Manage your family members</p>
          </div>
        </a>
        
        <a 
          href="/resident/complaints" 
          className="bg-white rounded-lg shadow p-6 flex items-center hover:bg-gray-50 transition"
        >
          <div className="rounded-full bg-red-100 p-3 mr-4">
            <FaExclamationTriangle className="text-red-600 text-xl" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Complaints</h3>
            <p className="text-sm text-gray-600">Register and track complaints</p>
          </div>
        </a>
        
        <a 
          href="/resident/maintenance" 
          className="bg-white rounded-lg shadow p-6 flex items-center hover:bg-gray-50 transition"
        >
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <FaMoneyBillWave className="text-green-600 text-xl" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Maintenance</h3>
            <p className="text-sm text-gray-600">View and pay maintenance bills</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default ResidentFlat;