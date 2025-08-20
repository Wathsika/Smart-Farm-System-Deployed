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

export default function MyLeaveRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
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
    try {
      await api.post("/leave-requests", formState);
      setShowForm(false);
      setFormState({ leaveType: "Casual", startDate: "", endDate: "", reason: "" });
      fetchRequests();
    } catch {
      alert("Failed to submit leave request.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Leave Overview + Add Request */}
      <Card className="border-green-100 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              My Leave Requests
            </CardTitle>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" /> New Request
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-green-800">Submit Leave Request</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Leave Type</Label>
                    <Select value={formState.leaveType} onValueChange={(v) => setFormState({ ...formState, leaveType: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Casual">Casual</SelectItem>
                        <SelectItem value="Sick">Sick</SelectItem>
                        <SelectItem value="Annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input type="date" value={formState.startDate} onChange={(e) => setFormState({ ...formState, startDate: e.target.value })} required />
                    <Input type="date" value={formState.endDate} onChange={(e) => setFormState({ ...formState, endDate: e.target.value })} required />
                  </div>
                  <Textarea placeholder="Reason" value={formState.reason} onChange={(e) => setFormState({ ...formState, reason: e.target.value })} required />
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Submit</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <p>Loading...</p> : (
            <div className="space-y-3">
              {requests.map((req) => (
                <motion.div key={req._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 border rounded-lg bg-white/50">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-sm">
                      {new Date(req.startDate).toLocaleDateString()} → {new Date(req.endDate).toLocaleDateString()}
                    </p>
                    <Badge className={
                      req.status === "Approved" ? "bg-green-100 text-green-800" :
                      req.status === "Rejected" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }>
                      {req.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-green-700 mt-1">{req.reason}</p>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
