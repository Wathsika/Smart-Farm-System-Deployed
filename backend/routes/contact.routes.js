// backend/routes/contact.routes.js (UPDATED TO IMPORT CONTROLLER)
import express from 'express';
const router = express.Router();
// Import the named export from the ES Module controller file
import { submitContactForm } from '../controllers/contact.controller.js';

router.post('/', submitContactForm); // Use the imported controller function

export default router; // ES Module default export