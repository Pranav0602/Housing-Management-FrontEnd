import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { societyService } from '../services/api';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaExclamationCircle, FaBuilding } from 'react-icons/fa';

const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short')
    .max(100, 'Name is too long')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  role: Yup.string()
    .oneOf(['ADMIN', 'RESIDENT', 'GUARD'], 'Invalid role')
    .required('Role is required'),
  
  // A new field to track the admin's choice
  adminSocietyOption: Yup.string().oneOf(['new', 'existing']),

  societyId: Yup.number()
    .when(['role', 'adminSocietyOption'], {
      // Require societyId if role is Resident/Guard OR if Admin chooses 'existing'
      is: (role, adminSocietyOption) => 
        role === 'RESIDENT' || 
        role === 'GUARD' || 
        (role === 'ADMIN' && adminSocietyOption === 'existing'),
      then: (schema) => schema.required('Society is required'),
      otherwise: (schema) => schema.nullable(),
    }),
    
  societyCreationRequest: Yup.object().when(['role', 'adminSocietyOption'], {
    // Require societyCreationRequest only if Admin chooses 'new'
    is: (role, adminSocietyOption) => role === 'ADMIN' && adminSocietyOption === 'new',
    then: (schema) => schema.shape({
      name: Yup.string()
        .min(2, 'Society name is too short')
        .max(100, 'Society name is too long')
        .required('Society name is required'),
      address: Yup.string()
        .min(5, 'Address is too short')
        .max(255, 'Address is too long')
        .required('Address is required'),
      city: Yup.string()
        .min(2, 'City is too short')
        .max(100, 'City is too long')
        .required('City is required'),
      state: Yup.string()
        .min(2, 'State is too short')
        .max(100, 'State is too long')
        .required('State is required'),
      pincode: Yup.string()
        .matches(/^[0-9]{6}$/, 'Pincode must be 6 digits')
        .required('Pincode is required'),
      numberOfBuildings: Yup.number()
        .min(1, 'Number of buildings must be at least 1')
        .required('Number of buildings is required')
    }),
    otherwise: (schema) => schema.nullable(),
  })
});

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [registerError, setRegisterError] = useState('');
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        setLoading(true);
        const response = await societyService.getAllSocieties();
        setSocieties(response.data);
      } catch (error) {
        console.error('Failed to fetch societies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSocieties();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setRegisterError('');

      const { 
        role, 
        societyId, 
        societyCreationRequest,  
        adminSocietyOption,
        ...userData 
      } = values;

      const payload = { ...userData, role };

      if (role === 'ADMIN') {
        if (adminSocietyOption === 'new') {
          payload.societyCreationRequest = societyCreationRequest;
        } else { // 'existing'
          payload.societyId = societyId;
        }
      } else if (role === 'RESIDENT' || role === 'GUARD') {
        payload.societyId = societyId;
      }
      
      await register(payload);
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error.response || error);
      setRegisterError(error.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <Formik
          initialValues={{
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            role: '',
            societyId: '',
            adminSocietyOption: 'new', // Default admin choice
            societyCreationRequest: {
              name: '',
              address: '',
              city: '',
              state: '',
              pincode: '',
              numberOfBuildings: 1
            }
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched, values, setFieldValue }) => (
            <Form className="mt-8 space-y-6">
              {registerError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <div className="flex items-center">
                    <FaExclamationCircle className="text-red-500 mr-2" />
                    <p className="text-sm text-red-700">{registerError}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {/* Name, Email, Phone, Password fields remain the same... */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400" />
                    </div>
                    <Field
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                        errors.name && touched.name ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      placeholder="Full Name"
                    />
                  </div>
                  <ErrorMessage name="name" component="p" className="mt-1 text-sm text-red-600" />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                        errors.email && touched.email ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      placeholder="Email address"
                    />
                  </div>
                  <ErrorMessage name="email" component="p" className="mt-1 text-sm text-red-600" />
                </div>
                
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
                      autoComplete="tel"
                      className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                        errors.phone && touched.phone ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      placeholder="Phone Number"
                    />
                  </div>
                  <ErrorMessage name="phone" component="p" className="mt-1 text-sm text-red-600" />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <Field
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                        errors.password && touched.password ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      placeholder="Password"
                    />
                  </div>
                  <ErrorMessage name="password" component="p" className="mt-1 text-sm text-red-600" />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <Field
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                        errors.confirmPassword && touched.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      placeholder="Confirm Password"
                    />
                  </div>
                  <ErrorMessage name="confirmPassword" component="p" className="mt-1 text-sm text-red-600" />
                </div>
                
                {/* Role Selection */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <Field
                    as="select"
                    id="role"
                    name="role"
                    className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${
                      errors.role && touched.role ? 'border-red-300' : 'border-gray-300'
                    } focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md`}
                  >
                    <option value="">Select Role</option>
                    <option value="ADMIN">Admin</option>
                    <option value="RESIDENT">Resident</option>
                    <option value="GUARD">Guard</option>
                  </Field>
                  <ErrorMessage name="role" component="p" className="mt-1 text-sm text-red-600" />
                </div>
                
                {/* Admin: Society Choice */}
                {values.role === 'ADMIN' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Society Setup</label>
                    <div role="group" aria-labelledby="admin-society-option-group" className="mt-2 flex space-x-4">
                      <label className="inline-flex items-center">
                        <Field type="radio" name="adminSocietyOption" value="new" className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                        <span className="ml-2 text-gray-700">Create New Society</span>
                      </label>
                      <label className="inline-flex items-center">
                        <Field type="radio" name="adminSocietyOption" value="existing" className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                        <span className="ml-2 text-gray-700">Join Existing Society</span>
                      </label>
                    </div>
                  </div>
                )}
                
                {/* Society Selection for Resident, Guard, or Admin choosing 'existing' */}
                {(values.role === 'RESIDENT' || values.role === 'GUARD' || (values.role === 'ADMIN' && values.adminSocietyOption === 'existing')) && (
                  <div>
                    <label htmlFor="societyId" className="block text-sm font-medium text-gray-700">
                      Select Society
                    </label>
                    <Field
                      as="select"
                      id="societyId"
                      name="societyId"
                      className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${
                        errors.societyId && touched.societyId ? 'border-red-300' : 'border-gray-300'
                      } focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md`}
                    >
                      <option value="">Select Society</option>
                      {societies.map((society) => (
                        <option key={society.id} value={society.id}>
                          {society.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="societyId" component="p" className="mt-1 text-sm text-red-600" />
                  </div>
                )}
                
                {/* Society Creation for Admin choosing 'new' */}
                {values.role === 'ADMIN' && values.adminSocietyOption === 'new' && (
                  <div className="space-y-4 mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-900">Create New Society</h3>
                    
                    {/* Society Name */}
                    <div>
                      <label htmlFor="societyCreationRequest.name" className="block text-sm font-medium text-gray-700">
                        Society Name
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaBuilding className="text-gray-400" />
                        </div>
                        <Field
                          id="societyCreationRequest.name"
                          name="societyCreationRequest.name"
                          type="text"
                          className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                            errors.societyCreationRequest?.name && touched.societyCreationRequest?.name ? 'border-red-300' : 'border-gray-300'
                          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                          placeholder="Society Name"
                        />
                      </div>
                      <ErrorMessage name="societyCreationRequest.name" component="p" className="mt-1 text-sm text-red-600" />
                    </div>
                    
                    {/* Society Address */}
                    <div>
                      <label htmlFor="societyCreationRequest.address" className="block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <Field
                        as="textarea"
                        id="societyCreationRequest.address"
                        name="societyCreationRequest.address"
                        rows={3}
                        className={`mt-1 block w-full border ${
                          errors.societyCreationRequest?.address && touched.societyCreationRequest?.address ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        placeholder="Society Address"
                      />
                      <ErrorMessage name="societyCreationRequest.address" component="p" className="mt-1 text-sm text-red-600" />
                    </div>
                    
                    {/* City */}
                    <div>
                      <label htmlFor="societyCreationRequest.city" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <Field
                        id="societyCreationRequest.city"
                        name="societyCreationRequest.city"
                        type="text"
                        className={`mt-1 block w-full border ${
                          errors.societyCreationRequest?.city && touched.societyCreationRequest?.city ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2`}
                        placeholder="City"
                      />
                      <ErrorMessage name="societyCreationRequest.city" component="p" className="mt-1 text-sm text-red-600" />
                    </div>
                    
                    {/* State */}
                    <div>
                      <label htmlFor="societyCreationRequest.state" className="block text-sm font-medium text-gray-700">
                        State
                      </label>
                      <Field
                        id="societyCreationRequest.state"
                        name="societyCreationRequest.state"
                        type="text"
                        className={`mt-1 block w-full border ${
                          errors.societyCreationRequest?.state && touched.societyCreationRequest?.state ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2`}
                        placeholder="State"
                      />
                      <ErrorMessage name="societyCreationRequest.state" component="p" className="mt-1 text-sm text-red-600" />
                    </div>
                    
                    {/* Pincode */}
                    <div>
                      <label htmlFor="societyCreationRequest.pincode" className="block text-sm font-medium text-gray-700">
                        Pincode
                      </label>
                      <Field
                        id="societyCreationRequest.pincode"
                        name="societyCreationRequest.pincode"
                        type="text"
                        className={`mt-1 block w-full border ${
                          errors.societyCreationRequest?.pincode && touched.societyCreationRequest?.pincode ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2`}
                        placeholder="Pincode"
                      />
                      <ErrorMessage name="societyCreationRequest.pincode" component="p" className="mt-1 text-sm text-red-600" />
                    </div>
                    
                    {/* Number of Buildings */}
                    <div>
                      <label htmlFor="societyCreationRequest.numberOfBuildings" className="block text-sm font-medium text-gray-700">
                        Number of Buildings
                      </label>
                      <Field
                        id="societyCreationRequest.numberOfBuildings"
                        name="societyCreationRequest.numberOfBuildings"
                        type="number"
                        min="1"
                        className={`mt-1 block w-full border ${
                          errors.societyCreationRequest?.numberOfBuildings && touched.societyCreationRequest?.numberOfBuildings ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2`}
                      />
                      <ErrorMessage name="societyCreationRequest.numberOfBuildings" component="p" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {isSubmitting ? 'Registering...' : 'Register'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default RegisterPage;
