// src/pages/employee/MyLeaveRequests.jsx
import React, { useState, useEffect, useCallback } from "react";
import { api } from "../../lib/api";
import { motion } from "framer-motion";
import { FileText, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader } from 'lucide-react'; // Import loader icon

// Helper for status badge styling based on the TaskManagement example
const LeaveStatusBadge = ({ status }) => {
  let backgroundColorClass, textColorClass;
  let IconComponent;

  switch (status) {
    case 'Approved':
      backgroundColorClass = 'bg-green-100';
      textColorClass = 'text-green-800';
      IconComponent = CheckCircle;
      break;
    case 'Rejected':
      backgroundColorClass = 'bg-red-100';
      textColorClass = 'text-red-800';
      IconComponent = XCircle;
      break;
    case 'Pending':
    default: // Default to pending if status is not recognized
      backgroundColorClass = 'bg-yellow-100';
      textColorClass = 'text-yellow-800';
      IconComponent = Clock;
      break;
  }

  return (
    <Badge className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${backgroundColorClass} ${textColorClass}`}>
      <IconComponent className="w-3 h-3" />
      {status}
    </Badge>
  );
};


export default function MyLeaveRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for form submission loading
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState({ leaveType: "Casual", startDate: "", endDate: "", reason: "" });

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/leave-requests");
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch leave requests", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/leave-requests", formState);
      setShowForm(false);
      setFormState({ leaveType: "Casual", startDate: "", endDate: "", reason: "" });
      fetchRequests();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to submit leave request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      {/* Leave Overview + Add Request */}
      <Card className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"> {/* Refined card styling */}
        <CardHeader className="p-0 pb-4 mb-4 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3"> {/* Title styling */}
              <FileText className="h-6 w-6 text-green-500" />
              My Leave Requests
            </CardTitle>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button className="flex items-center px-5 py-2.5 font-medium text-white bg-green-500 rounded-lg shadow-sm hover:bg-green-600 transition-colors"> {/* Button styling */}
                  <Plus className="h-4 w-4 mr-2" /> New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 border border-gray-100"> {/* Modal styling */}
                <DialogHeader className="p-0 pb-4 mb-4 border-b border-gray-100">
                  <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div> Submit Leave Request
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-2">Leave Type</Label>
                    <Select value={formState.leaveType} onValueChange={(v) => setFormState({ ...formState, leaveType: v })}>
                      <SelectTrigger className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-gray-800">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                        <SelectItem value="Casual">Casual</SelectItem>
                        <SelectItem value="Sick">Sick</SelectItem>
                        <SelectItem value="Annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</Label>
                      <Input type="date" value={formState.startDate} onChange={(e) => setFormState({ ...formState, startDate: e.target.value })} required
                        className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-gray-800"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-semibold text-gray-700 mb-2">End Date</Label>
                      <Input type="date" value={formState.endDate} onChange={(e) => setFormState({ ...formState, endDate: e.target.value })} required
                        className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-gray-800"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-2">Reason</Label>
                    <Textarea placeholder="Reason for leave" value={formState.reason} onChange={(e) => setFormState({ ...formState, reason: e.target.value })} required
                      className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors resize-none bg-white text-gray-800"
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting}
                    className="w-full flex items-center justify-center px-4 py-2.5 font-medium text-white bg-green-500 rounded-md shadow-sm hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <><Loader className="w-4 h-4 animate-spin mr-2" /> Submitting...</>
                    ) : "Submit"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader className="w-6 h-6 animate-spin text-green-500" />
              <span className="ml-2 text-gray-600">Loading leave requests...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">
              <FileText className="w-10 h-10 mx-auto text-gray-400 mb-3" />
              <p className="font-medium">No leave requests found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200" // Individual item styling
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-gray-800 text-sm">
                      {new Date(req.startDate).toLocaleDateString()} &mdash; {new Date(req.endDate).toLocaleDateString()}
                    </p>
                    <LeaveStatusBadge status={req.status} /> {/* Re-using badge styling */}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{req.reason}</p>
                  {req.notes && <p className="text-xs text-gray-500 mt-1 italic">Notes: {req.notes}</p>}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}