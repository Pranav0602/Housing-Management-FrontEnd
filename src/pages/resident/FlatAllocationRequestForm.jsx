import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaHome, FaUsers, FaBriefcase, FaPhone, FaInfoCircle } from 'react-icons/fa';
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
  const { currentUser, checkFlatAllocation } = useAuth();
  const navigate = useNavigate();
  const { sendMessage } = useWebSocket();
  const [buildings, setBuildings] = useState([]);
  const [availableFlats, setAvailableFlats] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [loading, setLoading] = useState(true); // Set initial loading to true
  const [allocationStatus, setAllocationStatus] = useState(null);

  useEffect(() => {
    const checkExistingAllocation = async () => {
      try {
        const hasFlat = await checkFlatAllocation();
        if (hasFlat) {
          toast.info('You already have an allocated flat.');
          navigate('/resident/dashboard');
          return;
        }

        // CORRECTED: Use the right function to get all flats for the society
        const response = await flatService.getFlatsBySociety(currentUser.societyId);
        const allFlats = response.data;
        
        const pendingAllocation = allFlats.find(
          flat => flat.allocationRequests && flat.allocationRequests.some(
            req => req.userId === currentUser.id && req.status === 'PENDING'
          )
        );
        
        if (pendingAllocation) {
          setAllocationStatus('PENDING');
        } else {
          setAllocationStatus('NOT_REQUESTED');
        }
        
        // This will now run correctly
        await fetchBuildings();

      } catch (error) {
        console.error('Error checking allocation status:', error);
        toast.error('Could not load allocation details.');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      checkExistingAllocation();
    }
  }, [currentUser, navigate, checkFlatAllocation]);

  const fetchBuildings = async () => {
    if (!currentUser || !currentUser.societyId) return;
    try {
      const response = await buildingService.getAllBuildings(currentUser.societyId);
      setBuildings(response.data);
    } catch (error) {
      console.error('Failed to fetch buildings:', error);
      toast.error('Failed to load buildings. Please try again.');
    }
  };

  useEffect(() => {
    const fetchAvailableFlats = async () => {
      if (!selectedBuilding) {
        setAvailableFlats([]);
        return;
      }
      
      try {
        setLoading(true);
        // CORRECTED: Use the renamed, specific function
        const response = await flatService.getFlatsByBuilding(selectedBuilding);
        console.log('Available flats:', response.data);
        const available = response.data.filter(flat => flat.occupiedStatus == 'VACANT' || flat.occupiedStatus == undefined);
        console.log('Filtered available flats:', available);
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

  // ... (the rest of your component remains the same)
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const requestData = {
        ...values,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email
      };
      
      const response = await flatService.requestFlatAllocation(requestData);
      
      sendMessage('/app/flat-allocation-requests', {
        requestId: response.data.id,
        flatId: values.flatId,
        userName: currentUser.name,
        userEmail: currentUser.email,
        societyId: currentUser.societyId
      });
      
      toast.success('Flat allocation request submitted successfully. Waiting for admin approval.');
      setAllocationStatus('PENDING');
    } catch (error) {
      console.error('Error submitting flat allocation request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // The rest of the component remains the same...

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (allocationStatus === 'PENDING') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flat Allocation Request</h1>
          <p className="text-gray-600">Your request status</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaInfoCircle className="text-yellow-500 text-2xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Request Pending Approval</h2>
          <p className="text-gray-600 mb-6">
            Your flat allocation request is currently under review by the society administrator.
            You will be notified once your request is approved or rejected.
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full">
            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            Pending Approval
          </div>
          <div className="mt-6">
            <button
              onClick={() => navigate('/resident/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (allocationStatus === 'REJECTED') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flat Allocation Request</h1>
          <p className="text-gray-600">Your request status</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaInfoCircle className="text-red-500 text-2xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Previous Request Rejected</h2>
          <p className="text-gray-600 mb-6">
            Your previous flat allocation request was rejected by the administrator.
            You can submit a new request or contact the society office for more information.
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full mb-6">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            Request Rejected
          </div>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => setAllocationStatus('NOT_REQUESTED')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Submit New Request
            </button>
            <button
              onClick={() => navigate('/resident/dashboard')}
              className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Request Flat Allocation</h1>
        <p className="text-gray-600">Submit your request for flat allocation in the society</p>
      </div>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaInfoCircle className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              You need to request a flat allocation before you can access the resident dashboard.
              This request will be reviewed by the society administrator.
            </p>
          </div>
        </div>
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