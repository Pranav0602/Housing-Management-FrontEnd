import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaBell, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { noticeService } from '../../services/api';
import { useWebSocket } from '../../context/WebSocketContext';
import NoticeForm from '../../components/admin/NoticeForm';

const AdminNotices = () => {
  const { currentUser } = useAuth();
  const { sendMessage } = useWebSocket();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, [currentUser]);

  const fetchNotices = async () => {
    if (!currentUser || !currentUser.societyId) return;
    
    try {
      setLoading(true);
      const response = await noticeService.getAllNotices();
      // Filter notices by society ID
      const societyNotices = response.data.filter(notice => notice.societyId === currentUser.societyId);
      setNotices(societyNotices);
    } catch (error) {
      console.error('Error fetching notices:', error);
      toast.error('Failed to load notices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNotice = () => {
    setEditingNotice(null);
    setShowForm(true);
  };

  const handleEditNotice = (notice) => {
    setEditingNotice(notice);
    setShowForm(true);
  };

  const handleDeleteNotice = async (noticeId) => {
    if (confirmDelete !== noticeId) {
      setConfirmDelete(noticeId);
      return;
    }
    
    try {
      await noticeService.deleteNotice(noticeId);
      toast.success('Notice deleted successfully');
      fetchNotices();
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting notice:', error);
      toast.error('Failed to delete notice. Please try again.');
    }
  };

  const handleFormSubmit = async (noticeData) => {
    try {
      // Add society ID to notice data
      const noticeWithSocietyId = {
        ...noticeData,
        societyId: currentUser.societyId
      };
      
      let response;
      if (editingNotice) {
        response = await noticeService.updateNotice(editingNotice.id, noticeWithSocietyId);
        toast.success('Notice updated successfully');
      } else {
        response = await noticeService.createNotice(noticeWithSocietyId);
        toast.success('Notice published successfully');
        
        // Send WebSocket notification to all society members
        sendMessage(`/topic/society/${currentUser.societyId}/notifications`, {
          type: 'NOTICE',
          message: `New notice: ${noticeData.title}`,
          data: response.data
        });
      }
      
      fetchNotices();
      setShowForm(false);
      setEditingNotice(null);
    } catch (error) {
      console.error('Error saving notice:', error);
      toast.error('Failed to save notice. Please try again.');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingNotice(null);
  };

  const filteredNotices = notices.filter(notice => {
    // Filter by search term
    const matchesSearch = 
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by priority
    const matchesPriority = priorityFilter ? notice.priority === priorityFilter : true;
    
    return matchesSearch && matchesPriority;
  });

  if (loading && notices.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Notices Management</h1>
        <button
          onClick={handleAddNotice}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <FaPlus className="mr-2" />
          Add Notice
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingNotice ? 'Edit Notice' : 'Add New Notice'}
          </h2>
          <NoticeForm
            initialValues={editingNotice || {}}
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
                placeholder="Search notices..."
                className="border-none focus:ring-0 flex-grow"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center">
              <FaFilter className="text-gray-400 mr-2" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border-none focus:ring-0"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
        </div>

        {filteredNotices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredNotices.map((notice) => (
                  <tr key={notice.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaBell className="text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{notice.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2">{notice.content}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${notice.priority === 'LOW' ? 'bg-green-100 text-green-800' : 
                          notice.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {notice.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditNotice(notice)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteNotice(notice.id)}
                        className={`${
                          confirmDelete === notice.id ? 'text-red-600' : 'text-gray-600'
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
            {searchTerm || priorityFilter ? 
              'No notices match your search criteria.' : 
              'No notices found. Add your first notice!'}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotices;