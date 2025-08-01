import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaHome, FaUsers, FaBriefcase, FaPhone } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { flatService, buildingService } from '../../services/api';
import { useWebSocket } from '../../context/WebSocketContext';

const AllocationRequestSchema = Yup.object().shape({
  flatId: Yup.number()
    .required('Flat is required'),
  familyMembers: Yup.number()
    .min(1, 'Family members must be at least 1')
    .required('Number of family members is required'),
  occupation: Yup.string()
    .min(2, 'Occupation is too short')
    .max(100, 'Occupation is too long')
    .required('Occupation is required'),
  emergencyContact: Yup.string()
    .matches(/^[0-9]{10}$/, 'Emergency contact must be 10 digits')
    .required('Emergency contact is required'),
  residentType: Yup.string()
    .oneOf(['OWNER', 'TENANT'], 'Invalid resident type')
    .required('Resident type is required')
});

const FlatAllocationRequestForm = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { sendMessage } = useWebSocket();
  const [buildings, setBuildings] = useState([]);
  const [availableFlats, setAvailableFlats] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBuildings = async () => {
      if (!currentUser || !currentUser.societyId) return;
      
      try {
        setLoading(true);
        const response = await buildingService.getAllBuildings(currentUser.societyId);
        setBuildings(response.data);
      } catch (error) {
        console.error('Failed to fetch buildings:', error);
        toast.error('Failed to load buildings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBuildings();
  }, [currentUser]);

  useEffect(() => {
    const fetchAvailableFlats = async () => {
      if (!selectedBuilding) {
        setAvailableFlats([]);
        return;
      }
      
      try {
        setLoading(true);
        const response = await flatService.getAllFlats(selectedBuilding);
        // Filter only available flats
        const available = response.data.filter(flat => flat.occupiedStatus === 'VACANT');
        setAvailableFlats(available);
      } catch (error) {
        console.error('Failed to fetch flats:', error);
        toast.error('Failed to load available flats. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableFlats();
  }, [selectedBuilding]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Add user information
      const requestData = {
        ...values,
        userName: currentUser.name,
        userEmail: currentUser.email
      };
      
      const response = await flatService.requestFlatAllocation(requestData);
      
      // Send WebSocket notification to admin
      sendMessage('/app/flat-allocation-requests', {
        requestId: response.data.id,
        flatId: values.flatId,
        userName: currentUser.name,
        userEmail: currentUser.email
      });
      
      toast.success('Flat allocation request submitted successfully. Waiting for admin approval.');
      navigate('/resident/dashboard');
    } catch (error) {
      console.error('Error submitting flat allocation request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Request Flat Allocation</h1>
        <p className="text-gray-600">Submit your request for flat allocation in the society</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <label htmlFor="building" className="block text-sm font-medium text-gray-700">
            Select Building
          </label>
          <select
            id="building"
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Select Building</option>
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
        </div>
        
        {selectedBuilding && (
          <Formik
            initialValues={{
              flatId: '',
              familyMembers: 1,
              occupation: '',
              emergencyContact: '',
              residentType: ''
            }}
            validationSchema={AllocationRequestSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-6">
                {/* Flat Selection */}
                <div>
                  <label htmlFor="flatId" className="block text-sm font-medium text-gray-700">
                    Select Flat
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaHome className="text-gray-400" />
                    </div>
                    <Field
                      as="select"
                      id="flatId"
                      name="flatId"
                      className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                        errors.flatId && touched.flatId ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    >
                      <option value="">Select Flat</option>
                      {availableFlats.map((flat) => (
                        <option key={flat.id} value={flat.id}>
                          {flat.flatNumber} - {flat.type} ({flat.area} sq.ft)
                        </option>
                      ))}
                    </Field>
                  </div>
                  <ErrorMessage name="flatId" component="p" className="mt-1 text-sm text-red-600" />
                  {availableFlats.length === 0 && selectedBuilding && (
                    <p className="mt-2 text-sm text-yellow-600">
                      No available flats in this building. Please select another building.
                    </p>
                  )}
                </div>
                
                {/* Resident Type */}
                <div>
                  <label htmlFor="residentType" className="block text-sm font-medium text-gray-700">
                    Resident Type
                  </label>
                  <div className="mt-1">
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <Field
                          type="radio"
                          name="residentType"
                          value="OWNER"
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <span className="ml-2 text-gray-700">Owner</span>
                      </label>
                      <label className="inline-flex items-center">
                        <Field
                          type="radio"
                          name="residentType"
                          value="TENANT"
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <span className="ml-2 text-gray-700">Tenant</span>
                      </label>
                    </div>
                  </div>
                  <ErrorMessage name="residentType" component="p" className="mt-1 text-sm text-red-600" />
                </div>
                
                {/* Family Members */}
                <div>
                  <label htmlFor="familyMembers" className="block text-sm font-medium text-gray-700">
                    Number of Family Members
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUsers className="text-gray-400" />
                    </div>
                    <Field
                      id="familyMembers"
                      name="familyMembers"
                      type="number"
                      min="1"
                      className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                        errors.familyMembers && touched.familyMembers ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                  </div>
                  <ErrorMessage name="familyMembers" component="p" className="mt-1 text-sm text-red-600" />
                </div>
                
                {/* Occupation */}
                <div>
                  <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">
                    Occupation
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaBriefcase className="text-gray-400" />
                    </div>
                    <Field
                      id="occupation"
                      name="occupation"
                      type="text"
                      className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                        errors.occupation && touched.occupation ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      placeholder="Your occupation"
                    />
                  </div>
                  <ErrorMessage name="occupation" component="p" className="mt-1 text-sm text-red-600" />
                </div>
                
                {/* Emergency Contact */}
                <div>
                  <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">
                    Emergency Contact
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="text-gray-400" />
                    </div>
                    <Field
                      id="emergencyContact"
                      name="emergencyContact"
                      type="text"
                      className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                        errors.emergencyContact && touched.emergencyContact ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      placeholder="10-digit emergency contact number"
                    />
                  </div>
                  <ErrorMessage name="emergencyContact" component="p" className="mt-1 text-sm text-red-600" />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate('/resident/dashboard')}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || availableFlats.length === 0}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default FlatAllocationRequestForm;