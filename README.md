# Doctor Appointment Booking System

A full-stack web application for booking and managing doctor appointments. Built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features

- User authentication (Patient and Doctor roles)
- Patient dashboard:
  - Book appointments with doctors
  - View past and upcoming appointments
- Doctor dashboard:
  - View appointment requests
  - Accept or reject appointments
- Real-time status updates
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Modern web browser

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd doctor-appointment-booking
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/doctor-appointment
JWT_SECRET=your-secret-key
```

4. Make sure MongoDB is running on your system.

## Running the Application

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

1. Register as either a patient or doctor
2. Log in with your credentials
3. For patients:
   - Select a doctor from the list
   - Choose date and time slot
   - Enter reason for appointment
   - Submit booking request
4. For doctors:
   - View incoming appointment requests
   - Accept or reject appointments
   - View appointment history

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/doctors` - Get list of doctors

### Appointments
- POST `/api/appointments` - Create new appointment
- GET `/api/appointments` - Get user's appointments
- PATCH `/api/appointments/:id` - Update appointment status

## Technologies Used

- Backend:
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - JSON Web Tokens (JWT)
  - bcryptjs for password hashing

- Frontend:
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Bootstrap 5
  - Fetch API

## Security Features

- Password hashing
- JWT authentication
- Protected routes
- Input validation
- XSS protection
- CORS enabled

## License

MIT License 