import axios from 'axios';

const API_BASE = 'http://localhost:8080';

export const getProfile = async () => axios.get(`${API_BASE}/api/users/me`);
export const getAppointments = async () => axios.get(`${API_BASE}/api/appointments/me`);
export const getDoctors = async () => axios.get(`${API_BASE}/api/doctors`);
export const getDoctorBySpecialty = async (specialty) => axios.get(`${API_BASE}/api/doctors/specialty/${specialty}`);
export const getMedicalHistory = async () => axios.get(`${API_BASE}/api/patients/me/medical-history`);
export const addMedicalHistory = async (description) => axios.post(`${API_BASE}/api/patients/me/medical-history`, null, { params: { description } });
export const getEmergencyContact = async () => axios.get(`${API_BASE}/api/patients/me`);
export const updateEmergencyContact = async (name, number) => axios.post(`${API_BASE}/api/patients/me/emergency-contact`, null, { params: { name, number } });
export const getPatientSummaries = async () => axios.get(`${API_BASE}/api/patients/me/summary`);
export const bookAppointment = async (appointment) => axios.post(`${API_BASE}/api/appointments`, appointment);
export const getAllPatients = async (config) => axios.get(`http://localhost:8082/api/patients/me/patients`, config);