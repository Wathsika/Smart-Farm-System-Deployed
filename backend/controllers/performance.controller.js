// controllers/performance.controller.js
export const getMyPerformance = async (req, res) => {
  try {
    const userId = req.user._id;

    // 🔹 TODO: Replace with real calculations
    // Example: calculate from tasks and attendance
    res.json({
      overallScore: 87,
      metrics: [
        { id: 1, name: "Task Completion", value: 92, target: 90, unit: "%", trend: "up" },
        { id: 2, name: "Punctuality", value: 85, target: 90, unit: "%", trend: "down" },
        { id: 3, name: "Collaboration", value: 80, target: 85, unit: "%", trend: "neutral" },
      ],
      achievements: [
        "Completed all sprint tasks on time",
        "Helped team reduce bug backlog by 20%",
      ],
      feedback: "Great performance overall! Focus on punctuality this month.",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
