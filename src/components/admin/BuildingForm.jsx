import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaBuilding, FaMapMarkerAlt, FaLayerGroup } from 'react-icons/fa';

const BuildingSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short')
    .max(100, 'Name is too long')
    .required('Building name is required'),
  address: Yup.string()
    .min(5, 'Address is too short')
    .max(255, 'Address is too long')
    .required('Address is required'),
  totalFloors: Yup.number()
    .min(1, 'Building must have at least 1 floor')
    .required('Total floors is required'),
  flatsPerFloor: Yup.number()
    .min(1, 'Each floor must have at least 1 flat')
    .required('Flats per floor is required'),
  description: Yup.string()
    .max(500, 'Description is too long')
});

const BuildingForm = ({ initialValues = {}, onSubmit, onCancel }) => {
  const defaultValues = {
    name: '',
    address: '',
    totalFloors: 1,
    flatsPerFloor: 2,
    description: '',
    ...initialValues
  };

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={BuildingSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form className="space-y-6">
          {/* Building Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Building Name
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaBuilding className="text-gray-400" />
              </div>
              <Field
                id="name"
                name="name"
                type="text"
                className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                  errors.name && touched.name ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Building Name (e.g., A Wing, Tower 1)"
              />
            </div>
            <ErrorMessage name="name" component="p" className="mt-1 text-sm text-red-600" />
          </div>
          
          {/* Building Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="text-gray-400" />
              </div>
              <Field
                id="address"
                name="address"
                type="text"
                className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                  errors.address && touched.address ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Building Address"
              />
            </div>
            <ErrorMessage name="address" component="p" className="mt-1 text-sm text-red-600" />
          </div>
          
          {/* Total Floors */}
          <div>
            <label htmlFor="totalFloors" className="block text-sm font-medium text-gray-700">
              Total Floors
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLayerGroup className="text-gray-400" />
              </div>
              <Field
                id="totalFloors"
                name="totalFloors"
                type="number"
                min="1"
                className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                  errors.totalFloors && touched.totalFloors ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
            </div>
            <ErrorMessage name="totalFloors" component="p" className="mt-1 text-sm text-red-600" />
          </div>
          
          {/* Flats Per Floor */}
          <div>
            <label htmlFor="flatsPerFloor" className="block text-sm font-medium text-gray-700">
              Flats Per Floor
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaBuilding className="text-gray-400" />
              </div>
              <Field
                id="flatsPerFloor"
                name="flatsPerFloor"
                type="number"
                min="1"
                className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                  errors.flatsPerFloor && touched.flatsPerFloor ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
            </div>
            <ErrorMessage name="flatsPerFloor" component="p" className="mt-1 text-sm text-red-600" />
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <Field
              as="textarea"
              id="description"
              name="description"
              rows={3}
              className={`mt-1 block w-full border ${
                errors.description && touched.description ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="Additional information about the building"
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
              {isSubmitting ? 'Saving...' : initialValues.id ? 'Update Building' : 'Add Building'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default BuildingForm;