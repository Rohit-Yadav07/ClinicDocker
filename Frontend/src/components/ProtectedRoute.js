// import React from 'react';
// import { Navigate } from 'react-router-dom';

// // Usage: <ProtectedRoute role="doctor"> <DoctorDashboard /> </ProtectedRoute>
// //        <ProtectedRoute role="patient"> <PatientDashboard /> </ProtectedRoute>

// const ProtectedRoute = ({ role, children }) => {
//   const user = JSON.parse(localStorage.getItem('user'));
//   const userRole = user?.role?.toUpperCase();
//   if (!user || !userRole || userRole !== role.toUpperCase()) {
//     return <Navigate to="/login" replace />;
//   }
//   return children;
// };

// export default ProtectedRoute;
