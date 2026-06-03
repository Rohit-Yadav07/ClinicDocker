import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Typography, Box, Button, Grid, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import './Home.css';
import BackButton from '../components/BackButton';

const features = [
	{
		title: 'My Profile',
		description: 'View and update your profile information.',
		to: '/profile',
		color: '#1976d2',
	},
	{
		title: 'My Appointments',
		description: 'See all your upcoming and past appointments.',
		to: '/appointments',
		color: '#43cea2',
	},
	{
		title: 'Book Appointment',
		description: 'Book a new appointment with a doctor.',
		to: '/book-appointment',
		color: '#f5576c',
	},
	{
		title: 'Doctors Directory',
		description: 'Browse and search for doctors by specialty.',
		to: '/doctors',
		color: '#f093fb',
	},
	{
		title: 'Medical History',
		description: 'View and add your medical history.',
		to: '/medical-history',
		color: '#ffb347',
	},
	{
		title: 'Emergency Contact',
		description: 'Update your emergency contact details.',
		to: '/emergency-contact',
		color: '#00c6ff',
	},
	{
		title: 'Patient Summaries',
		description: 'Doctors: View summaries for your patients.',
		to: '/getallpatients',
		color: '#8fd3f4',
	},
];

const Home = () => {
	const [role, setRole] = useState(null);

	useEffect(() => {
		// Try to get user role from localStorage or JWT (adjust as needed)
		const user = JSON.parse(localStorage.getItem('user'));
		setRole(user?.role || null);
	}, []);

	const filteredFeatures = features.filter((f) =>
		f.title !== 'Patient Summaries' || role === 'doctor'
	);

	return (
		<Box
			sx={{
				minHeight: '100vh',
				backgroundImage: 'url(/clinicbg.jpg)',
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				py: 6,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<motion.div
				initial={{ scale: 0.95, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ duration: 0.7 }}
			>
				<Box
					className="home-content"
					sx={{
						textAlign: 'center',
						background: 'rgba(217, 235, 241, 0.97)',
						borderRadius: '2rem',
						boxShadow: 8,
						p: { xs: 2, sm: 4 },
						maxWidth: 900,
						mx: 'auto',
					}}
				>
					<Box sx={{ textAlign: 'left', mb: 2 }}>
						<BackButton />
					</Box>
					<Typography
						variant="h2"
						className="home-title"
						sx={{
							fontWeight: 900,
							letterSpacing: 1,
							color: 'primary.main',
							textAlign: 'center',
						}}
					>
						Welcome
					</Typography>
					<Typography
						variant="h5"
						className="home-subtitle"
						sx={{
							color: '#555',
							mb: 4,
							textAlign: 'center',
						}}
					>
						Manage your clinic with ease and style!
					</Typography>
					<Grid
						container
						spacing={3}
						justifyContent="center"
						className="home-features"
					>
						{filteredFeatures.map((feature, idx) => (
							<Grid item xs={12} sm={6} md={4} key={feature.title}>
								<motion.div
									whileHover={{
										scale: 1.07,
										boxShadow:
											'0 8px 32px 0 rgba(31,38,135,0.18)',
									}}
									whileTap={{ scale: 0.97 }}
								>
									<Card
										className="feature-card"
										style={{
											background: feature.color,
											color: '#fff',
											borderRadius: '1.5rem',
											boxShadow:
												'0 4px 24px 0 rgba(31,38,135,0.15)',
											minHeight: 180,
										}}
									>
										<CardContent>
											<Typography
												variant="h6"
												style={{ fontWeight: 700 }}
											>
												{feature.title}
											</Typography>
											<Typography
												variant="body2"
												style={{
													margin: '0.5rem 0 1rem 0',
												}}
											>
												{feature.description}
											</Typography>
											<Button
												component={Link}
												to={feature.to}
												variant="contained"
												style={{
													background: '#fff',
													color: feature.color,
													fontWeight: 600,
													borderRadius: '2rem',
													boxShadow:
														'0 2px 8px 0 rgba(31,38,135,0.10)',
												}}
											>
												Go
											</Button>
										</CardContent>
									</Card>
								</motion.div>
							</Grid>
						))}
					</Grid>
				</Box>
			</motion.div>
		</Box>
	);
};

export default Home;
