import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUserFriends, FaPlus, FaEdit, FaTrash, FaUser } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { flatService, flatMemberService } from '../../services/api';
import FamilyMemberForm from '../../components/resident/FamilyMemberForm';

const ResidentFamilyMembers = () => {
  const { currentUser } = useAuth();
  const [flatDetails, setFlatDetails] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
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
        
        // Fetch family members for this flat
        const membersResponse = await flatMemberService.getAllFlatMembers(userFlat.id);
        setFamilyMembers(membersResponse.data);
      } else {
        setError('No flat is currently assigned to you. Please request a flat allocation.');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
      toast.error('Failed to load family members');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setShowForm(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleDeleteMember = async (memberId) => {
    if (confirmDelete !== memberId) {
      setConfirmDelete(memberId);
      return;
    }
    
    try {
      await flatMemberService.deleteFlatMember(memberId);
      toast.success('Family member removed successfully');
      fetchData();
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting family member:', error);
      toast.error('Failed to remove family member. Please try again.');
    }
  };

  const handleFormSubmit = async (memberData) => {
    try {
      // Add flat ID to member data
      const memberWithFlatId = {
        ...memberData,
        flatId: flatDetails.id
      };
      
      if (editingMember) {
        await flatMemberService.updateFlatMember(editingMember.id, memberWithFlatId);
        toast.success('Family member updated successfully');
      } else {
        await flatMemberService.createFlatMember(memberWithFlatId);
        toast.success('Family member added successfully');
      }
      
      fetchData();
      setShowForm(false);
      setEditingMember(null);
    } catch (error) {
      console.error('Error saving family member:', error);
      toast.error('Failed to save family member. Please try again.');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingMember(null);
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
        <FaUserFriends className="text-blue-500 text-5xl mx-auto mb-4" />
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
        <FaUserFriends className="text-blue-500 text-5xl mx-auto mb-4" />
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

  // Check if the current user is the flat owner
  const isOwner = flatDetails.ownerId === currentUser.id;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Family Members</h1>
        {isOwner && (
          <button
            onClick={handleAddMember}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <FaPlus className="mr-2" />
            Add Family Member
          </button>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <FaHome className="text-blue-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold text-gray-900">Flat {flatDetails.flatNumber}</h2>
            <p className="text-gray-600">{flatDetails.buildingName || 'Building'}</p>
          </div>
        </div>
        
        {showForm && isOwner && (
          <div className="mb-8 border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingMember ? 'Edit Family Member' : 'Add New Family Member'}
            </h3>
            <FamilyMemberForm
              initialValues={editingMember || {}}
              onSubmit={handleFormSubmit}
              onCancel={handleCancelForm}
            />
          </div>
        )}
        
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FaUserFriends className="mr-2 text-blue-500" />
          Family Members
        </h3>
        
        {familyMembers.length > 0 ? (
          <div className="space-y-4">
            {familyMembers.map((member) => (
              <div 
                key={member.id} 
                className="bg-gray-50 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between"
              >
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900">{member.name}</h4>
                    <p className="text-sm text-gray-600">{member.relationship}</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0">
                  <div className="mr-6">
                    <p className="text-sm text-gray-600">Contact</p>
                    <p className="text-sm font-medium">{member.contactNumber}</p>
                  </div>
                  
                  {isOwner && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditMember(member)}
                        className="p-2 text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className={`p-2 ${
                          confirmDelete === member.id ? 'text-red-600' : 'text-gray-600'
                        } hover:text-red-800`}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <FaUserFriends className="text-gray-400 text-4xl mx-auto mb-2" />
            <p className="text-gray-600">No family members added yet.</p>
            {isOwner && (
              <button
                onClick={handleAddMember}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Add Family Member
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidentFamilyMembers;