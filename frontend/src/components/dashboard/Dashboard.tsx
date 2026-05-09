import React from 'react';

interface DashboardProps {
  userId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userId }) => (
  <main className="dashboard" aria-label="대시보드">
    <p className="dashboard__placeholder">대시보드 — userId: {userId}</p>
  </main>
);

export default Dashboard;
