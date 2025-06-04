import React from 'react';
import PatientsChart from './PatientsChart';
import ConsultationsChart from './ConsultationsChart';
import UpcomingPatients from './UpcomingPatients';
import ConsultationsTable from './ConsultationsTable';
import './Dashboard.css'; // Import the dashboard-specific CSS

const Dashboard = () => {
  React.useEffect(() => {
    document.title = "Dashboard - DocSoft";
  }, []);

  return (
    <div className="container-fluid mt-0 pt-0">
      <div className="dashboard-grid">
        <div className="left-column">
          <PatientsChart />
          <div className="mt-4">
            <ConsultationsChart />
          </div>
        </div>
        <div className="right-column">
          <UpcomingPatients />
        </div>
      </div>
      <div className="mt-4">
        <ConsultationsTable />
      </div>
    </div>
  );
};
export default Dashboard;
