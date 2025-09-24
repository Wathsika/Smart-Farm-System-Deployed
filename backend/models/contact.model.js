// backend/models/contact.model.js
import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Standard email regex
      'Please fill a valid email address'
    ],
    lowercase: true,
    trim: true,
    unique: false // Allows multiple submissions from the same email
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot be more than 20 characters']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [150, 'Subject cannot be more than 150 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true // Adds `createdAt` and `updatedAt` fields automatically
});

const Contact = mongoose.model('Contact', contactSchema);

// Export as a default export
export default Contact;