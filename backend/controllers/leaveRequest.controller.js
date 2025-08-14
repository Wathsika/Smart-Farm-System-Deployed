import LeaveRequest from "../models/LeaveRequest.js";

// @desc    Employee creates a new leave request
// @route   POST /api/leave-requests
// @access  Private (Employee, Admin)
export const createLeaveRequest = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;
        const userId = req.user.id; // Token එකෙන් userව ගන්නවා

        if (!leaveType || !startDate || !endDate || !reason) {
            return res.status(400).json({ message: "Please fill all required fields." });
        }

        const newRequest = await LeaveRequest.create({
            user: userId,
            leaveType,
            startDate,
            endDate,
            reason,
            status: "Pending", // අලුත් request හැමවිටම Pending
        });

        res.status(201).json({ message: "Leave request submitted successfully.", request: newRequest });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get all leave requests (Admin) or own requests (Employee)
// @route   GET /api/leave-requests
// @access  Private (Employee, Admin)
export const getLeaveRequests = async (req, res) => {
    try {
        const filter = {};
        
        // Login වෙලා ඉන්නෙ Employee කෙනෙක් නම්, එයාගෙ requests විතරක් පෙන්නන්න
        if (req.user.role === 'Employee') {
            filter.user = req.user.id;
        }

        const requests = await LeaveRequest.find(filter)
            .populate('user', 'fullName email jobTitle') // User table එකෙන් මේ details ටිකත් ගන්න
            .sort({ createdAt: -1 }); // අලුත්ම ඒවා උඩට එන්න

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


// @desc    Admin updates the status of a leave request (Approve/Reject)
// @route   PATCH /api/leave-requests/:id/status
// @access  Private (Admin)
export const updateLeaveRequestStatus = async (req, res) => {
    try {
        const { status, adminRemarks } = req.body;
        const requestId = req.params.id;

        if (!status || !['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: "Valid status ('Approved' or 'Rejected') is required." });
        }

        const request = await LeaveRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Leave request not found." });
        }
        
        // Adminට Pending request විතරයි update කරන්න දෙන්නෙ
        if (request.status !== 'Pending') {
            return res.status(400).json({ message: `This request has already been ${request.status}.`});
        }

        request.status = status;
        if (adminRemarks) {
            request.adminRemarks = adminRemarks;
        }
        
        const updatedRequest = await request.save();
        res.status(200).json({ message: `Request has been ${status}.`, request: updatedRequest });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


// @desc    Delete a leave request
// @route   DELETE /api/leave-requests/:id
// @access  Private (Admin)
export const deleteLeaveRequest = async (req, res) => {
    try {
        const request = await LeaveRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // TODO: Security check - Only the user who created it (if pending) or an admin can delete
        
        await LeaveRequest.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Leave request deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};