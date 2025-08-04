import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaMoneyBillWave, FaCalendarAlt, FaHome } from 'react-icons/fa';

const MaintenanceBillSchema = Yup.object().shape({
  flatId: Yup.number()
    .required('Flat is required'),
  amount: Yup.number()
    .min(1, 'Amount must be greater than 0')
    .required('Amount is required'),
  billDate: Yup.date()
    .required('Bill date is required'),
  dueDate: Yup.date()
    .min(
      Yup.ref('billDate'),
      'Due date must be after bill date'
    )
    .required('Due date is required'),
  description: Yup.string()
    .max(500, 'Description is too long')
});

const MaintenanceBillForm = ({ initialValues = {}, flats = [], onSubmit, onCancel }) => {
  // Generate a unique bill number if not provided
  const generateBillNumber = () => {
    const prefix = 'BILL';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  };

  // Format date for form input
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const defaultValues = {
    flatId: flats.length > 0 ? flats[0].id : '',
    billNumber: generateBillNumber(),
    amount: 0,
    billDate: formatDate(new Date()),
    dueDate: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days from now
    description: '',
    ...initialValues,
    billDate: formatDate(initialValues.billDate || new Date()),
    dueDate: formatDate(initialValues.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
  };

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={MaintenanceBillSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Flat Selection */}
            <div>
              <label htmlFor="flatId" className="block text-sm font-medium text-gray-700">
                Flat
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
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  disabled={initialValues.id} // Disable if editing existing bill
                >
                  <option value="">Select Flat</option>
                  {flats.map(flat => (
                    <option key={flat.id} value={flat.id}>
                      {flat.flatNumber} - {flat.buildingName || 'Building'} 
                    </option>
                  ))}
                </Field>
              </div>
              <ErrorMessage name="flatId" component="p" className="mt-1 text-sm text-red-600" />
            </div>
            
            {/* Bill Number */}
            <div>
              <label htmlFor="billNumber" className="block text-sm font-medium text-gray-700">
                Bill Number
              </label>
              <Field
                id="billNumber"
                name="billNumber"
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                readOnly
              />
              <p className="mt-1 text-xs text-gray-500">Auto-generated bill number</p>
            </div>
            
            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount (₹)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMoneyBillWave className="text-gray-400" />
                </div>
                <Field
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.amount && touched.amount ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
              </div>
              <ErrorMessage name="amount" component="p" className="mt-1 text-sm text-red-600" />
            </div>
            
            {/* Bill Date */}
            <div>
              <label htmlFor="billDate" className="block text-sm font-medium text-gray-700">
                Bill Date
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="text-gray-400" />
                </div>
                <Field
                  id="billDate"
                  name="billDate"
                  type="date"
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.billDate && touched.billDate ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
              </div>
              <ErrorMessage name="billDate" component="p" className="mt-1 text-sm text-red-600" />
            </div>
            
            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="text-gray-400" />
                </div>
                <Field
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.dueDate && touched.dueDate ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
              </div>
              <ErrorMessage name="dueDate" component="p" className="mt-1 text-sm text-red-600" />
            </div>
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <Field
              as="textarea"
              id="description"
              name="description"
              rows={3}
              className={`mt-1 block w-full border ${
                errors.description && touched.description ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="Enter bill description (e.g., Monthly maintenance for July 2025)"
            />
            <ErrorMessage name="description" component="p" className="mt-1 text-sm text-red-600" />
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
              {isSubmitting ? 'Saving...' : initialValues.id ? 'Update Bill' : 'Generate Bill'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default MaintenanceBillForm;