import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path'; // Import the 'path' module
import { fileURLToPath } from 'url'; // Import 'fileURLToPath'

// --- THIS IS THE FIX ---
// 1. Get the directory name of the current file (__dirname).
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Explicitly tell dotenv where to find the .env file.
// We go up one level from '/config' to the '/backend' root directory.
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 3. The rest of the file remains the same.
// Now, the error check will run AFTER the .env file has been loaded from the specified path.
if (!process.env.STRIPE_SECRET_KEY) {
  // If you still get this error, it means the .env file is physically missing or has a typo in its name.
  throw new Error('FATAL ERROR: STRIPE_SECRET_KEY could not be loaded. Check your .env file.');
}

// Ensure the Stripe webhook signing secret is present.
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('FATAL ERROR: STRIPE_WEBHOOK_SECRET could not be loaded. Check your .env file.');
}

// Initialize Stripe with the secret key.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Export the fully configured instance.
export default stripe;