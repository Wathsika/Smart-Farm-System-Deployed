// models/User.js (formerly Staff.js)

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['Customer', 'Employee', 'Admin'], 
        required: true,
        default: 'Customer'
    },
    // This field is for Employees only
    jobTitle: {
        type: String,
        trim: true,
        // Make this field required only IF the role is 'Employee'
        required: function() {
            return this.role === 'Employee';
        }
    }
}, { 
    timestamps: true 
});

const User = mongoose.model('User', userSchema);

export default User;
