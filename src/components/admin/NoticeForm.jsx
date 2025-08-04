import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaBell, FaHeading, FaCalendarAlt } from 'react-icons/fa';

const NoticeSchema = Yup.object().shape({
  title: Yup.string()
    .min(5, 'Title is too short')
    .max(100, 'Title is too long')
    .required('Title is required'),
  content: Yup.string()
    .min(10, 'Content is too short')
    .max(2000, 'Content is too long')
    .required('Content is required'),
  priority: Yup.string()
    .oneOf(['LOW', 'MEDIUM', 'HIGH'], 'Invalid priority')
    .required('Priority is required'),
  expiryDate: Yup.date()
    .min(new Date(), 'Expiry date must be in the future')
    .nullable()
});

const NoticeForm = ({ initialValues = {}, onSubmit, onCancel }) => {
  const defaultValues = {
    title: '',
    content: '',
    priority: 'MEDIUM',
    expiryDate: '',
    ...initialValues
  };

  // Format date for form input
  if (defaultValues.expiryDate) {
    const date = new Date(defaultValues.expiryDate);
    defaultValues.expiryDate = date.toISOString().split('T')[0];
  }

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={NoticeSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form className="space-y-6">
          {/* Notice Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Notice Title
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
                placeholder="Notice Title"
              />
            </div>
            <ErrorMessage name="title" component="p" className="mt-1 text-sm text-red-600" />
          </div>
          
          {/* Notice Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Notice Content
            </label>
            <Field
              as="textarea"
              id="content"
              name="content"
              rows={5}
              className={`mt-1 block w-full border ${
                errors.content && touched.content ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="Enter the notice content here..."
            />
            <ErrorMessage name="content" component="p" className="mt-1 text-sm text-red-600" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaBell className="text-gray-400" />
                </div>
                <Field
                  as="select"
                  id="priority"
                  name="priority"
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.priority && touched.priority ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </Field>
              </div>
              <ErrorMessage name="priority" component="p" className="mt-1 text-sm text-red-600" />
            </div>
            
            {/* Expiry Date */}
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                Expiry Date (Optional)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="text-gray-400" />
                </div>
                <Field
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.expiryDate && touched.expiryDate ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
              </div>
              <ErrorMessage name="expiryDate" component="p" className="mt-1 text-sm text-red-600" />
              <p className="mt-1 text-xs text-gray-500">Leave blank if the notice doesn't expire</p>
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
              {isSubmitting ? 'Saving...' : initialValues.id ? 'Update Notice' : 'Publish Notice'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default NoticeForm;