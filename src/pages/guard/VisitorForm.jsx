import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaUserFriends, FaPhone, FaBuilding, FaClipboardList } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { visitorService, flatService } from '../../services/api';
import { useWebSocket } from '../../context/WebSocketContext';

const VisitorSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short')
    .max(100, 'Name is too long')
    .required('Name is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  purpose: Yup.string()
    .min(3, 'Purpose is too short')
    .max(200, 'Purpose is too long')
    .required('Purpose is required'),
  flatId: Yup.number()
    .required('Flat is required'),
  vehicleNumber: Yup.string()
    .nullable(),
  numberOfVisitors: Yup.number()
    .min(1, 'Number of visitors must be at least 1')
    .required('Number of visitors is required')
});

const VisitorForm = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { sendMessage } = useWebSocket();
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFlats = async () => {
      if (!currentUser || !currentUser.societyId) return;
      
      try {
        setLoading(true);
        const response = await flatService.getAllFlats();
        // Filter flats by society ID
        const societyFlats = response.data.filter(flat => flat.societyId === currentUser.societyId);
        setFlats(societyFlats);
      } catch (error) {
        console.error('Failed to fetch flats:', error);
        toast.error('Failed to load flats. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFlats();
  }, [currentUser]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Add logged by information
      const visitorData = {
        ...values,
        loggedById: currentUser.id,
        entryTime: new Date().toISOString()
      };
      
      const response = await visitorService.createVisitor(visitorData);
      const visitor = response.data;
      
      // Send WebSocket notification to flat owner
      const selectedFlat = flats.find(flat => flat.id === parseInt(values.flatId));
      if (selectedFlat && selectedFlat.ownerId) {
        sendMessage(`/app/user/${selectedFlat.ownerId}/visitor-requests`, {
          visitorId: visitor.id,
          visitorName: visitor.name,
          purpose: visitor.purpose,
          flatId: visitor.flatId,
          flatNumber: selectedFlat.flatNumber
        });
      }
      
      toast.success('Visitor logged successfully. Waiting for resident approval.');
      resetForm();
      navigate('/guard/visitors');
    } catch (error) {
      console.error('Error logging visitor:', error);
      toast.error('Failed to log visitor. Please try again.');
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
        <h1 className="text-2xl font-bold text-gray-900">Log New Visitor</h1>
        <p className="text-gray-600">Enter visitor details and request approval from resident</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <Formik
          initialValues={{
            name: '',
            phone: '',
            purpose: '',
            flatId: '',
            vehicleNumber: '',
            numberOfVisitors: 1
          }}
          validationSchema={VisitorSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="space-y-6">
              {/* Visitor Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Visitor Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUserFriends className="text-gray-400" />
                  </div>
                  <Field
                    id="name"
                    name="name"
                    type="text"
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                      errors.name && touched.name ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="Full Name"
                  />
                </div>
                <ErrorMessage name="name" component="p" className="mt-1 text-sm text-red-600" />
              </div>
              
              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <Field
                    id="phone"
                    name="phone"
                    type="text"
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                      errors.phone && touched.phone ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="10-digit phone number"
                  />
                </div>
                <ErrorMessage name="phone" component="p" className="mt-1 text-sm text-red-600" />
              </div>
              
              {/* Purpose */}
              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                  Purpose of Visit
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaClipboardList className="text-gray-400" />
                  </div>
                  <Field
                    id="purpose"
                    name="purpose"
                    type="text"
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                      errors.purpose && touched.purpose ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="Purpose of visit"
                  />
                </div>
                <ErrorMessage name="purpose" component="p" className="mt-1 text-sm text-red-600" />
              </div>
              
              {/* Flat Selection */}
              <div>
                <label htmlFor="flatId" className="block text-sm font-medium text-gray-700">
                  Visiting Flat
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBuilding className="text-gray-400" />
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
                    {flats.map((flat) => (
                      <option key={flat.id} value={flat.id}>
                        {flat.buildingName} - {flat.flatNumber}
                      </option>
                    ))}
                  </Field>
                </div>
                <ErrorMessage name="flatId" component="p" className="mt-1 text-sm text-red-600" />
              </div>
              
              {/* Vehicle Number (Optional) */}
              <div>
                <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700">
                  Vehicle Number (Optional)
                </label>
                <Field
                  id="vehicleNumber"
                  name="vehicleNumber"
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Vehicle number (if applicable)"
                />
                <ErrorMessage name="vehicleNumber" component="p" className="mt-1 text-sm text-red-600" />
              </div>
              
              {/* Number of Visitors */}
              <div>
                <label htmlFor="numberOfVisitors" className="block text-sm font-medium text-gray-700">
                  Number of Visitors
                </label>
                <Field
                  id="numberOfVisitors"
                  name="numberOfVisitors"
                  type="number"
                  min="1"
                  className={`mt-1 block w-full border ${
                    errors.numberOfVisitors && touched.numberOfVisitors ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
                <ErrorMessage name="numberOfVisitors" component="p" className="mt-1 text-sm text-red-600" />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/guard/visitors')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {isSubmitting ? 'Logging...' : 'Log Visitor'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default VisitorForm;