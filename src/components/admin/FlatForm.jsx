import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaHome, FaBuilding, FaRulerCombined, FaLayerGroup } from 'react-icons/fa';

const FlatSchema = Yup.object().shape({
  flatNumber: Yup.string()
    .required('Flat number is required'),
  buildingId: Yup.number()
    .required('Building is required'),
  floor: Yup.number()
    .min(0, 'Floor cannot be negative')
    .required('Floor is required'),
  type: Yup.string()
    .required('Flat type is required'),
  area: Yup.number()
    .min(1, 'Area must be greater than 0')
    .required('Area is required'),
  bedrooms: Yup.number()
    .min(0, 'Bedrooms cannot be negative')
    .required('Number of bedrooms is required'),
  bathrooms: Yup.number()
    .min(0, 'Bathrooms cannot be negative')
    .required('Number of bathrooms is required'),
  occupiedStatus: Yup.string()
    .oneOf(['VACANT', 'OCCUPIED', 'MAINTENANCE'], 'Invalid status')
    .required('Status is required'),
  description: Yup.string()
    .max(500, 'Description is too long')
});

const FlatForm = ({ initialValues = {}, buildings = [], onSubmit, onCancel }) => {
  const defaultValues = {
    flatNumber: '',
    buildingId: buildings.length > 0 ? buildings[0].id : '',
    floor: 0,
    type: '1BHK',
    area: 500,
    bedrooms: 1,
    bathrooms: 1,
    occupiedStatus: 'VACANT',
    description: '',
    ...initialValues
  };

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={FlatSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Building Selection */}
            <div>
              <label htmlFor="buildingId" className="block text-sm font-medium text-gray-700">
                Building
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaBuilding className="text-gray-400" />
                </div>
                <Field
                  as="select"
                  id="buildingId"
                  name="buildingId"
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.buildingId && touched.buildingId ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                >
                  <option value="">Select Building</option>
                  {buildings.map(building => (
                    <option key={building.id} value={building.id}>
                      {building.name}
                    </option>
                  ))}
                </Field>
              </div>
              <ErrorMessage name="buildingId" component="p" className="mt-1 text-sm text-red-600" />
            </div>
            
            {/* Flat Number */}
            <div>
              <label htmlFor="flatNumber" className="block text-sm font-medium text-gray-700">
                Flat Number
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaHome className="text-gray-400" />
                </div>
                <Field
                  id="flatNumber"
                  name="flatNumber"
                  type="text"
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.flatNumber && touched.flatNumber ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Flat Number (e.g., A101, 202)"
                />
              </div>
              <ErrorMessage name="flatNumber" component="p" className="mt-1 text-sm text-red-600" />
            </div>
            
            {/* Floor */}
            <div>
              <label htmlFor="floor" className="block text-sm font-medium text-gray-700">
                Floor
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLayerGroup className="text-gray-400" />
                </div>
                <Field
                  id="floor"
                  name="floor"
                  type="number"
                  min="0"
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.floor && touched.floor ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
              </div>
              <ErrorMessage name="floor" component="p" className="mt-1 text-sm text-red-600" />
            </div>
            
            {/* Flat Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Flat Type
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaHome className="text-gray-400" />
                </div>
                <Field
                  as="select"
                  id="type"
                  name="type"
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.type && touched.type ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                >
                  <option value="1BHK">1 BHK</option>
                  <option value="2BHK">2 BHK</option>
                  <option value="3BHK">3 BHK</option>
                  <option value="4BHK">4 BHK</option>
                  <option value="PENTHOUSE">Penthouse</option>
                  <option value="STUDIO">Studio</option>
                  <option value="DUPLEX">Duplex</option>
                </Field>
              </div>
              <ErrorMessage name="type" component="p" className="mt-1 text-sm text-red-600" />
            </div>
            
            {/* Area */}
            <div>
              <label htmlFor="area" className="block text-sm font-medium text-gray-700">
                Area (sq.ft)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaRulerCombined className="text-gray-400" />
                </div>
                <Field
                  id="area"
                  name="area"
                  type="number"
                  min="1"
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.area && touched.area ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
              </div>
              <ErrorMessage name="area" component="p" className="mt-1 text-sm text-red-600" />
            </div>
            
            {/* Bedrooms */}
            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
                Bedrooms
              </label>
              <Field
                id="bedrooms"
                name="bedrooms"
                type="number"
                min="0"
                className={`mt-1 block w-full border ${
                  errors.bedrooms && touched.bedrooms ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              <ErrorMessage name="bedrooms" component="p" className="mt-1 text-sm text-red-600" />
            </div>
            
            {/* Bathrooms */}
            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
                Bathrooms
              </label>
              <Field
                id="bathrooms"
                name="bathrooms"
                type="number"
                min="0"
                className={`mt-1 block w-full border ${
                  errors.bathrooms && touched.bathrooms ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              <ErrorMessage name="bathrooms" component="p" className="mt-1 text-sm text-red-600" />
            </div>
            
            {/* Occupied Status */}
            <div>
              <label htmlFor="occupiedStatus" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <Field
                as="select"
                id="occupiedStatus"
                name="occupiedStatus"
                className={`mt-1 block w-full border ${
                  errors.occupiedStatus && touched.occupiedStatus ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              >
                <option value="VACANT">Vacant</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Under Maintenance</option>
              </Field>
              <ErrorMessage name="occupiedStatus" component="p" className="mt-1 text-sm text-red-600" />
            </div>
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
              placeholder="Additional information about the flat"
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
              {isSubmitting ? 'Saving...' : initialValues.id ? 'Update Flat' : 'Add Flat'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default FlatForm;