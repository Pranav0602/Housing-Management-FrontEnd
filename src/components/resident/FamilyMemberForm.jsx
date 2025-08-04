import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaExclamationTriangle, FaHeading, FaList } from 'react-icons/fa';

const ComplaintSchema = Yup.object().shape({
  title: Yup.string()
    .min(5, 'Title is too short')
    .max(100, 'Title is too long')
    .required('Title is required'),
  description: Yup.string()
    .min(10, 'Description is too short')
    .max(1000, 'Description is too long')
    .required('Description is required'),
  category: Yup.string()
    .required('Category is required')
});

const ComplaintForm = ({ initialValues = {}, onSubmit, onCancel }) => {
  const defaultValues = {
    title: '',
    description: '',
    category: '',
    ...initialValues
  };

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={ComplaintSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form className="space-y-6">
          {/* Complaint Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Complaint Title
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaHeading className="text-gray-400" />
              </div>
              <Field
                id="title"
                name="title"
                type="text"
                className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                  errors.title && touched.title ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Brief title for your complaint"
              />
            </div>
            <ErrorMessage name="title" component="p" className="mt-1 text-sm text-red-600" />
          </div>
          
          {/* Complaint Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaList className="text-gray-400" />
              </div>
              <Field
                as="select"
                id="category"
                name="category"
                className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                  errors.category && touched.category ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              >
                <option value="">Select Category</option>
                <option value="PLUMBING">Plumbing</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="STRUCTURAL">Structural</option>
                <option value="CLEANLINESS">Cleanliness</option>
                <option value="SECURITY">Security</option>
                <option value="NOISE">Noise</option>
                <option value="PARKING">Parking</option>
                <option value="COMMON_AREA">Common Area</option>
                <option value="OTHER">Other</option>
              </Field>
            </div>
            <ErrorMessage name="category" component="p" className="mt-1 text-sm text-red-600" />
          </div>
          
          {/* Complaint Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <div className="mt-1 relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FaExclamationTriangle className="text-gray-400" />
              </div>
              <Field
                as="textarea"
                id="description"
                name="description"
                rows={5}
                className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                  errors.description && touched.description ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Detailed description of your complaint"
              />
            </div>
            <ErrorMessage name="description" component="p" className="mt-1 text-sm text-red-600" />
            <p className="mt-2 text-sm text-gray-500">
              Please provide as much detail as possible to help us address your complaint effectively.
            </p>
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
              {isSubmitting ? 'Submitting...' : initialValues.id ? 'Update Complaint' : 'Submit Complaint'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ComplaintForm;