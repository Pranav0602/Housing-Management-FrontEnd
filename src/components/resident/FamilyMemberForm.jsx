import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaUser, FaPhone, FaIdCard } from 'react-icons/fa';

const FamilyMemberSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short')
    .max(100, 'Name is too long')
    .required('Name is required'),
  relationship: Yup.string()
    .min(2, 'Relationship is too short')
    .max(50, 'Relationship is too long')
    .required('Relationship is required'),
  contactNumber: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Contact number is required'),
  age: Yup.number()
    .min(0, 'Age cannot be negative')
    .max(120, 'Age cannot be more than 120')
    .required('Age is required'),
  idProofType: Yup.string()
    .max(50, 'ID proof type is too long'),
  idProofNumber: Yup.string()
    .max(50, 'ID proof number is too long')
});

const FamilyMemberForm = ({ initialValues = {}, onSubmit, onCancel }) => {
  const defaultValues = {
    name: '',
    relationship: '',
    contactNumber: '',
    age: '',
    idProofType: '',
    idProofNumber: '',
    ...initialValues
  };

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={FamilyMemberSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
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
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.name && touched.name ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Full Name"
                />
              </div>
              <ErrorMessage name="name" component="p" className="mt-1 text-sm text-red-600" />
            </div>
            
            {/* Relationship */}
            <div>
              <label htmlFor="relationship" className="block text-sm font-medium text-gray-700">
                Relationship
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <Field
                  as="select"
                  id="relationship"
                  name="relationship"
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.relationship && touched.relationship ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                >
                  <option value="">Select Relationship</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Grandparent">Grandparent</option>
                  <option value="Other">Other</option>
                </Field>
              </div>
              <ErrorMessage name="relationship" component="p" className="mt-1 text-sm text-red-600" />
            </div>
            
            {/* Contact Number */}
            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                Contact Number
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="text-gray-400" />
                </div>
                <Field
                  id="contactNumber"
                  name="contactNumber"
                  type="text"
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.contactNumber && touched.contactNumber ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="10-digit phone number"
                />
              </div>
              <ErrorMessage name="contactNumber" component="p" className="mt-1 text-sm text-red-600" />
            </div>
            
            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <Field
                id="age"
                name="age"
                type="number"
                min="0"
                max="120"
                className={`mt-1 block w-full border ${
                  errors.age && touched.age ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              <ErrorMessage name="age" component="p" className="mt-1 text-sm text-red-600" />
            </div>
            
            {/* ID Proof Type */}
            <div>
              <label htmlFor="idProofType" className="block text-sm font-medium text-gray-700">
                ID Proof Type (Optional)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaIdCard className="text-gray-400" />
                </div>
                <Field
                  as="select"
                  id="idProofType"
                  name="idProofType"
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.idProofType && touched.idProofType ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                >
                  <option value="">Select ID Type</option>
                  <option value="Aadhar">Aadhar Card</option>
                  <option value="PAN">PAN Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="Other">Other</option>
                </Field>
              </div>
              <ErrorMessage name="idProofType" component="p" className="mt-1 text-sm text-red-600" />
            </div>
            
            {/* ID Proof Number */}
            <div>
              <label htmlFor="idProofNumber" className="block text-sm font-medium text-gray-700">
                ID Proof Number (Optional)
              </label>
              <Field
                id="idProofNumber"
                name="idProofNumber"
                type="text"
                className={`mt-1 block w-full border ${
                  errors.idProofNumber && touched.idProofNumber ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="ID Number"
              />
              <ErrorMessage name="idProofNumber" component="p" className="mt-1 text-sm text-red-600" />
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isSubmitting ? 'Saving...' : initialValues.id ? 'Update Member' : 'Add Member'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default FamilyMemberForm;