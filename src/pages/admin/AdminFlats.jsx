import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaHome, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaBuilding } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { flatService, buildingService } from '../../services/api';
import FlatForm from '../../components/admin/FlatForm';

const AdminFlats = () => {
  const { currentUser } = useAuth();
  const [flats, setFlats] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFlat, setEditingFlat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchBuildings();
  }, [currentUser]);

  useEffect(() => {
    if (buildings.length > 0) {
      fetchFlats();
    }
  }, [buildings, selectedBuilding]);

  const fetchBuildings = async () => {
    if (!currentUser || !currentUser.societyId) return;
    
    try {
      const response = await buildingService.getAllBuildings(currentUser.societyId);
      setBuildings(response.data);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      toast.error('Failed to load buildings. Please try again.');
    }
  };

  const fetchFlats = async () => {
    try {
      setLoading(true);
      let response;
      
      if (selectedBuilding) {
        response = await flatService.getAllFlats(selectedBuilding);
      } else if (buildings.length > 0) {
        // Fetch flats from all buildings
        const allFlats = [];
        for (const building of buildings) {
          const buildingFlats = await flatService.getAllFlats(building.id);
          allFlats.push(...buildingFlats.data);
        }
        response = { data: allFlats };
      } else {
        response = { data: [] };
      }
      
      setFlats(response.data);
    } catch (error) {
      console.error('Error fetching flats:', error);
      toast.error('Failed to load flats. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFlat = () => {
    setEditingFlat(null);
    setShowForm(true);
  };

  const handleEditFlat = (flat) => {
    setEditingFlat(flat);
    setShowForm(true);
  };

  const handleDeleteFlat = async (flatId) => {
    if (confirmDelete !== flatId) {
      setConfirmDelete(flatId);
      return;
    }
    
    try {
      await flatService.deleteFlat(flatId);
      toast.success('Flat deleted successfully');
      fetchFlats();
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting flat:', error);
      toast.error('Failed to delete flat. Please try again.');
    }
  };

  const handleFormSubmit = async (flatData) => {
    try {
      if (editingFlat) {
        await flatService.updateFlat(editingFlat.id, flatData);
        toast.success('Flat updated successfully');
      } else {
        await flatService.createFlat(flatData);
        toast.success('Flat added successfully');
      }
      fetchFlats();
      setShowForm(false);
      setEditingFlat(null);
    } catch (error) {
      console.error('Error saving flat:', error);
      toast.error('Failed to save flat. Please try again.');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingFlat(null);
  };

  const handleBuildingChange = (e) => {
    setSelectedBuilding(e.target.value);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const filteredFlats = flats.filter(flat => {
    // Filter by search term
    const matchesSearch = 
      flat.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (flat.description && flat.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by status
    const matchesStatus = selectedStatus ? flat.occupiedStatus === selectedStatus : true;
    
    return matchesSearch && matchesStatus;
  });

  if (loading && flats.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Flats Management</h1>
        <button
          onClick={handleAddFlat}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <FaPlus className="mr-2" />
          Add Flat
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingFlat ? 'Edit Flat' : 'Add New Flat'}
          </h2>
          <FlatForm
            initialValues={editingFlat || {}}
            buildings={buildings}
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
                placeholder="Search flats..."
                className="border-none focus:ring-0 flex-grow"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FaBuilding className="text-gray-400 mr-2" />
                <select
                  value={selectedBuilding}
                  onChange={handleBuildingChange}
                  className="border-none focus:ring-0"
                >
                  <option value="">All Buildings</option>
                  {buildings.map(building => (
                    <option key={building.id} value={building.id}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <FaFilter className="text-gray-400 mr-2" />
                <select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className="border-none focus:ring-0"
                >
                  <option value="">All Status</option>
                  <option value="VACANT">Vacant</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="MAINTENANCE">Under Maintenance</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {filteredFlats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flat Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Building
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Floor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Area (sq.ft)
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
                {filteredFlats.map((flat) => (
                  <tr key={flat.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaHome className="text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{flat.flatNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {buildings.find(b => b.id === flat.buildingId)?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{flat.floor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{flat.type || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{flat.area}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${flat.occupiedStatus === 'VACANT' ? 'bg-green-100 text-green-800' : 
                          flat.occupiedStatus === 'OCCUPIED' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {flat.occupiedStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditFlat(flat)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteFlat(flat.id)}
                        className={`${
                          confirmDelete === flat.id ? 'text-red-600' : 'text-gray-600'
                        } hover:text-red-900`}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            {searchTerm || selectedBuilding || selectedStatus ? 
              'No flats match your search criteria.' : 
              'No flats found. Add your first flat!'}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFlats;