// backend/controllers/contact.controller.js (UPDATED TO ES MODULES)
import Contact from '../models/contact.model.js'; // ES Module import, with .js extension

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
// Export as a named export
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    const newContact = new Contact({ name, email, phone, subject, message });
    const savedContact = await newContact.save();

    res.status(201).json({ message: 'Contact form submitted successfully!', data: savedContact });

  } catch (error) {
    console.error('❌ Error submitting contact form:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server Error: Could not submit form.' });
  }
};