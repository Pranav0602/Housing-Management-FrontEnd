import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaBuilding, FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { buildingService } from '../../services/api';
import BuildingForm from '../../components/admin/BuildingForm';

const AdminBuildings = () => {
  const { currentUser } = useAuth();
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchBuildings();
  }, [currentUser]);

  const fetchBuildings = async () => {
    if (!currentUser || !currentUser.societyId) return;
    
    try {
      setLoading(true);
      const response = await buildingService.getAllBuildings(currentUser.societyId);
      setBuildings(response.data);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      toast.error('Failed to load buildings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBuilding = () => {
    setEditingBuilding(null);
    setShowForm(true);
  };

  const handleEditBuilding = (building) => {
    setEditingBuilding(building);
    setShowForm(true);
  };

  const handleDeleteBuilding = async (buildingId) => {
    if (confirmDelete !== buildingId) {
      setConfirmDelete(buildingId);
      return;
    }
    
    try {
      await buildingService.deleteBuilding(buildingId);
      toast.success('Building deleted successfully');
      fetchBuildings();
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting building:', error);
      toast.error('Failed to delete building. Please try again.');
    }
  };

  const handleFormSubmit = async (buildingData) => {
    try {
      if (editingBuilding) {
        await buildingService.updateBuilding(editingBuilding.id, buildingData);
        toast.success('Building updated successfully');
      } else {
        // Add society ID to building data
        const newBuildingData = {
          ...buildingData,
          societyId: currentUser.societyId
        };
        await buildingService.createBuilding(newBuildingData);
        toast.success('Building added successfully');
      }
      fetchBuildings();
      setShowForm(false);
      setEditingBuilding(null);
    } catch (error) {
      console.error('Error saving building:', error);
      toast.error('Failed to save building. Please try again.');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingBuilding(null);
  };

  const filteredBuildings = buildings.filter(building => 
    building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    building.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && buildings.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Buildings Management</h1>
        <button
          onClick={handleAddBuilding}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <FaPlus className="mr-2" />
          Add Building
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingBuilding ? 'Edit Building' : 'Add New Building'}
          </h2>
          <BuildingForm
            initialValues={editingBuilding || {}}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search buildings..."
              className="border-none focus:ring-0 flex-grow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredBuildings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Floors
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Flats
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBuildings.map((building) => (
                  <tr key={building.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaBuilding className="text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{building.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{building.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{building.totalFloors}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{building.totalFlats || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditBuilding(building)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteBuilding(building.id)}
                        className={`${
                          confirmDelete === building.id ? 'text-red-600' : 'text-gray-600'
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
            {searchTerm ? 'No buildings match your search.' : 'No buildings found. Add your first building!'}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBuildings;