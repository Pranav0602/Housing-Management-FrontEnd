import { Link } from 'react-router-dom';
import { FaBuilding, FaUsers, FaShieldAlt, FaBell, FaClipboardList, FaMoneyBillWave } from 'react-icons/fa';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Modern Housing Society Management
              </h1>
              <p className="text-xl mb-8">
                Simplify community living with our comprehensive housing society management system.
                Connect residents, administrators, and security personnel on a single platform.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link 
                  to="/register" 
                  className="bg-white text-blue-600 px-6 py-3 rounded-md font-medium text-center hover:bg-gray-100 transition"
                >
                  Register Now
                </Link>
                <Link 
                  to="/login" 
                  className="bg-transparent border border-white px-6 py-3 rounded-md font-medium text-center hover:bg-blue-700 transition"
                >
                  Login
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80" 
                alt="Modern Housing Society" 
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FaBuilding className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Society Management</h3>
              <p className="text-gray-600">
                Efficiently manage buildings, flats, and residents. Keep track of all society assets and infrastructure.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Resident Portal</h3>
              <p className="text-gray-600">
                Dedicated portal for residents to manage their flat details, family members, and interact with society administration.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FaShieldAlt className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Security Management</h3>
              <p className="text-gray-600">
                Comprehensive visitor management system with approval workflows and complete visitor logs.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FaBell className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Notice Board</h3>
              <p className="text-gray-600">
                Digital notice board for important announcements and communications from the administration.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FaClipboardList className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Complaint Management</h3>
              <p className="text-gray-600">
                Streamlined system for residents to register and track complaints and maintenance requests.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FaMoneyBillWave className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Maintenance Billing</h3>
              <p className="text-gray-600">
                Simplified maintenance bill generation and payment tracking for society finances.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to simplify your society management?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of housing societies that have transformed their community management with our platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              to="/register" 
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition"
            >
              Get Started Today
            </Link>
            <Link 
              to="/contact" 
              className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;