import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaMoneyBillWave, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaFileInvoiceDollar } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { maintenanceBillService, flatService } from '../../services/api';
import { useWebSocket } from '../../context/WebSocketContext';
import MaintenanceBillForm from '../../components/admin/MaintenanceBillForm';

const AdminMaintenance = () => {
  const { currentUser } = useAuth();
  const { sendMessage } = useWebSocket();
  const [bills, setBills] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);

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
      
      // Fetch all maintenance bills
      const billsResponse = await maintenanceBillService.getAllBills();
      // Filter bills for flats in the society
      const societyBills = billsResponse.data.filter(bill => 
        societyFlats.some(flat => flat.id === bill.flatId)
      );
      setBills(societyBills);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBill = () => {
    setEditingBill(null);
    setShowForm(true);
  };

  const handleEditBill = (bill) => {
    setEditingBill(bill);
    setShowForm(true);
  };

  const handleDeleteBill = async (billId) => {
    if (confirmDelete !== billId) {
      setConfirmDelete(billId);
      return;
    }
    
    try {
      await maintenanceBillService.deleteBill(billId);
      toast.success('Bill deleted successfully');
      fetchData();
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast.error('Failed to delete bill. Please try again.');
    }
  };

  const handleFormSubmit = async (billData) => {
    try {
      let response;
      if (editingBill) {
        response = await maintenanceBillService.updateBill(editingBill.id, billData);
        toast.success('Bill updated successfully');
      } else {
        response = await maintenanceBillService.createBill(billData);
        toast.success('Bill created successfully');
        
        // Send WebSocket notification to flat owner
        const flat = flats.find(flat => flat.id === billData.flatId);
        if (flat && flat.ownerId) {
          sendMessage(`/app/user/${flat.ownerId}/notifications`, {
            type: 'MAINTENANCE_BILL',
            message: `New maintenance bill generated for ${flat.flatNumber}`,
            data: response.data
          });
        }
      }
      
      fetchData();
      setShowForm(false);
      setEditingBill(null);
    } catch (error) {
      console.error('Error saving bill:', error);
      toast.error('Failed to save bill. Please try again.');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingBill(null);
  };

  const handleViewDetails = (bill) => {
    setSelectedBill(bill);
  };

  const handleCloseDetails = () => {
    setSelectedBill(null);
  };

  const handleMarkAsPaid = async (billId) => {
    try {
      await maintenanceBillService.markBillAsPaid(billId, {
        paymentDate: new Date().toISOString(),
        paymentReference: `ADMIN-${Date.now()}`
      });
      toast.success('Bill marked as paid successfully');
      fetchData();
      setSelectedBill(null);
    } catch (error) {
      console.error('Error marking bill as paid:', error);
      toast.error('Failed to mark bill as paid. Please try again.');
    }
  };

  const filteredBills = bills.filter(bill => {
    // Filter by search term (flat number or bill number)
    const flatNumber = flats.find(flat => flat.id === bill.flatId)?.flatNumber || '';
    const matchesSearch = 
      flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.billNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by payment status
    const matchesStatus = statusFilter === '' ? true : 
      (statusFilter === 'PAID' ? bill.paid : !bill.paid);
    
    return matchesSearch && matchesStatus;
  });

  if (loading && bills.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Maintenance Bills</h1>
        <button
          onClick={handleAddBill}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <FaPlus className="mr-2" />
          Generate Bill
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingBill ? 'Edit Maintenance Bill' : 'Generate New Bill'}
          </h2>
          <MaintenanceBillForm
            initialValues={editingBill || {}}
            flats={flats}
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
                placeholder="Search by flat number or bill number..."
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
                <option value="">All Bills</option>
                <option value="PAID">Paid</option>
                <option value="UNPAID">Unpaid</option>
              </select>
            </div>
          </div>
        </div>

        {filteredBills.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bill Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flat
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bill Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
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
                {filteredBills.map((bill) => {
                  const flat = flats.find(flat => flat.id === bill.flatId);
                  return (
                    <tr key={bill.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaFileInvoiceDollar className="text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{bill.billNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{flat?.flatNumber || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">₹{bill.amount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(bill.billDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(bill.dueDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${bill.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {bill.paid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(bill)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleEditBill(bill)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteBill(bill.id)}
                          className={`${
                            confirmDelete === bill.id ? 'text-red-600' : 'text-gray-600'
                          } hover:text-red-900`}
                        >
                          <FaTrash />
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
              'No bills match your search criteria.' : 
              'No maintenance bills found. Generate your first bill!'}
          </div>
        )}
      </div>

      {/* Bill Details Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Maintenance Bill Details</h3>
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
                  <h4 className="text-sm font-medium text-gray-500">Bill Number</h4>
                  <p className="text-base">{selectedBill.billNumber}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Flat</h4>
                  <p className="text-base">
                    {flats.find(flat => flat.id === selectedBill.flatId)?.flatNumber || 'Unknown'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Amount</h4>
                  <p className="text-base font-semibold">₹{selectedBill.amount}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${selectedBill.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {selectedBill.paid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Bill Date</h4>
                  <p className="text-base">
                    {new Date(selectedBill.billDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Due Date</h4>
                  <p className="text-base">
                    {new Date(selectedBill.dueDate).toLocaleDateString()}
                  </p>
                </div>
                {selectedBill.paid && (
                  <>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Payment Date</h4>
                      <p className="text-base">
                        {selectedBill.paymentDate ? new Date(selectedBill.paymentDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Payment Reference</h4>
                      <p className="text-base">{selectedBill.paymentReference || 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="text-base">{selectedBill.description || 'No description provided'}</p>
              </div>
              
              {!selectedBill.paid && (
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => handleMarkAsPaid(selectedBill.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Mark as Paid
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

export default AdminMaintenance;