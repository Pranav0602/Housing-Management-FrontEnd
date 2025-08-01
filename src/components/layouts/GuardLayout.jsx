import { Outlet } from 'react-router-dom';
import GuardSidebar from '../guard/GuardSidebar';
import GuardHeader from '../guard/GuardHeader';

const GuardLayout = () => {
  return (
    <div className="flex h-screen">
      <GuardSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <GuardHeader />
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default GuardLayout;