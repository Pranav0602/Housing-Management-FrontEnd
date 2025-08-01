import { Outlet } from 'react-router-dom';
import ResidentSidebar from '../resident/ResidentSidebar';
import ResidentHeader from '../resident/ResidentHeader';

const ResidentLayout = () => {
  return (
    <div className="flex h-screen">
      <ResidentSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <ResidentHeader />
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ResidentLayout;