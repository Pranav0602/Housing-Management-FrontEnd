import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUser, FaSearch, FaFilter, FaHome, FaUserFriends, FaEnvelope, FaPhone } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { flatService, flatMemberService } from '../../services/api';

const AdminResidents = () => {
  const { currentUser } = useAuth();
  const [residents, setResidents] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedResident, setSelectedResident] = useState(null);
  const [flatMembers, setFlatMembers] = useState([]);

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    if (!currentUser || !currentUser.societyId) return;
    
    try {
      setLoading(true);
      
      // Fetch all flats in the society
      const flatsResponse = await flatService.getAllFlats();
      const societyFlats = flatsResponse.data.filter(flat => flat.societyId === currentUser.societyId);
      setFlats(societyFlats);
      
      // Fetch residents (flat owners and members)
      const allResidents = [];
      const allFlatMembers = [];
      
      // Process each flat to get its residents
      for (const flat of societyFlats) {
        if (flat.occupiedStatus === 'OCCUPIED') {
          try {
            // Get flat members
            const membersResponse = await flatMemberService.getAllFlatMembers(flat.id);
            const members = membersResponse.data;
            
            // Add flat members to the list
            allFlatMembers.push(...members);
            
            // Add flat owner as a resident
            if (flat.ownerId) {
              allResidents.push({
                id: flat.ownerId,
                name: flat.ownerName || 'Unknown',
                email: flat.ownerEmail || 'N/A',
                phone: flat.ownerPhone || 'N/A',
                flatId: flat.id,
                flatNumber: flat.flatNumber,
                isOwner: true,
                residentType: flat.residentType || 'OWNER'
              });
            }
          } catch (error) {
            console.error(`Error fetching members for flat ${flat.id}:`, error);
          }
        }
      }
      
      setResidents(allResidents);
      setFlatMembers(allFlatMembers);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load residents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (resident) => {
    setSelectedResident(resident);
  };

  const handleCloseDetails = () => {
    setSelectedResident(null);
  };

  const getResidentFlatMembers = (resident) => {
    return flatMembers.filter(member => member.flatId === resident.flatId);
  };

  const filteredResidents = residents.filter(resident => {
    // Filter by search term
    const matchesSearch = 
      resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.flatNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by resident type
    const matchesType = statusFilter ? resident.residentType === statusFilter : true;
    
    return matchesSearch && matchesType;
  });

  if (loading && residents.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Residents Management</h1>
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
                <option value="">All Types</option>
                <option value="OWNER">Owner</option>
                <option value="TENANT">Tenant</option>
              </select>
            </div>
          </div>
        </div>

        {filteredResidents.length > 0 ? (
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
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Family Members
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResidents.map((resident) => {
                  const members = getResidentFlatMembers(resident);
                  return (
                    <tr key={resident.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{resident.name}</div>
                            <div className="text-sm text-gray-500">{resident.isOwner ? 'Primary Resident' : 'Family Member'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                            <FaHome className="text-green-600" />
                          </div>
                          <div className="text-sm text-gray-900">{resident.flatNumber}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaEnvelope className="text-gray-400 mr-1" />
                            {resident.email}
                          </div>
                          <div className="flex items-center mt-1">
                            <FaPhone className="text-gray-400 mr-1" />
                            {resident.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${resident.residentType === 'OWNER' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                          {resident.residentType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaUserFriends className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{members.length}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(resident)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            {searchTerm || statusFilter ? 
              'No residents match your search criteria.' : 
              'No residents found.'}
          </div>
        )}
      </div>

      {/* Resident Details Modal */}
      {selectedResident && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Resident Details</h3>
              <button
                onClick={handleCloseDetails}
                className="text-gray-400 hover:text-gray-500"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaUser className="text-blue-600 text-2xl" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-gray-900">{selectedResident.name}</h2>
                  <p className="text-gray-600">{selectedResident.isOwner ? 'Primary Resident' : 'Family Member'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <p className="text-base">{selectedResident.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                  <p className="text-base">{selectedResident.phone}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Flat Number</h4>
                  <p className="text-base">{selectedResident.flatNumber}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Resident Type</h4>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${selectedResident.residentType === 'OWNER' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                    {selectedResident.residentType}
                  </span>
                </div>
              </div>
              
              {/* Family Members */}
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Family Members</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  {getResidentFlatMembers(selectedResident).length > 0 ? (
                    <div className="space-y-4">
                      {getResidentFlatMembers(selectedResident).map(member => (
                        <div key={member.id} className="flex items-center border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            <div className="text-xs text-gray-500">{member.relationship}</div>
                          </div>
                          <div className="ml-auto text-sm text-gray-500">
                            {member.contactNumber}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">No family members registered</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResidents;