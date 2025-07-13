const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Appointment = require('../models/Appointment');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to authenticate token
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

// Book appointment
router.post('/', auth, async (req, res) => {
    try {
        const { doctorId, date, timeSlot, reason } = req.body;
        
        // Check if time slot is available
        const existingAppointment = await Appointment.findOne({
            doctor: doctorId,
            date,
            timeSlot,
            status: { $ne: 'rejected' }
        });

        if (existingAppointment) {
            return res.status(400).json({ message: 'Time slot not available' });
        }

        const appointment = new Appointment({
            patient: req.user.userId,
            doctor: doctorId,
            date,
            timeSlot,
            reason
        });

        await appointment.save();
        
        await appointment.populate('doctor patient');
        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get appointments for a user (doctor or patient)
router.get('/', auth, async (req, res) => {
    try {
        const query = req.user.role === 'doctor' 
            ? { doctor: req.user.userId }
            : { patient: req.user.userId };

        const appointments = await Appointment.find(query)
            .populate('doctor patient')
            .sort({ date: 1 });

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update appointment status (for doctors)
router.patch('/:id', auth, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ message: 'Only doctors can update appointment status' });
        }

        const appointment = await Appointment.findOne({
            _id: req.params.id,
            doctor: req.user.userId
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        appointment.status = status;
        await appointment.save();
        
        await appointment.populate('doctor patient');
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router; 