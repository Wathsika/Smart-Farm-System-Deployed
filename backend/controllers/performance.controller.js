
import Task from "../models/Task.js"; // Task model එක import කිරීම
import Attendance from "../models/Attendance.js"; // Attendance model එක import කිරීම
import { openai, CHAT_MODEL } from "../utils/openaiClient.js"; // OpenAI client එක import කිරීම (ඔබගේ openaiClient.js ගොනුව controller ගොනුවට සාපේක්ෂව root path එකේ හෝ වෙනත් path එකක ඇත්නම්, මෙම path එක වෙනස් කිරීමට අවශ්‍ය විය හැක.)

// ලබා දී ඇති මාසයේ ආරම්භය සහ අවසානය ලබා ගැනීමට helper function එකක්
const getMonthDateRange = (year, month) => {
  const startDate = new Date(year, month - 1, 1); // month-1, මන්ද JavaScript හි මාස 0-index වේ (January is 0)
  startDate.setHours(0, 0, 0, 0); // දිනයේ ආරම්භය තහවුරු කරයි
  const endDate = new Date(year, month, 0, 23, 59, 59, 999); // මාසයේ අවසාන දිනය, දිනය අවසානය දක්වා
  return { startDate, endDate };
};

export const getMyPerformance = async (req, res) => {
  try {
    const userId = req.user._id;

    // query parameters වලින් month සහ year ලබා ගැනීම, නොමැතිනම් වත්මන් මාසය/වසර භාවිතා කිරීම
    const queryMonth = parseInt(req.query.month);
    const queryYear = parseInt(req.query.year);

    const now = new Date();
    const currentMonth = now.getMonth() + 1; // getMonth() is 0-indexed
    const currentYear = now.getFullYear();

    const month = !isNaN(queryMonth) && queryMonth >= 1 && queryMonth <= 12 ? queryMonth : currentMonth;
    const year = !isNaN(queryYear) && queryYear >= 1900 && queryYear <= 2100 ? queryYear : currentYear; // සාධාරණ වසර පරාසයක්

    const { startDate, endDate } = getMonthDateRange(year, month);

    // 1. අදාළ මාසය තුළ සේවකයාගේ Tasks ලබා ගැනීම
    const tasks = await Task.find({
      user: userId,
      dueDate: { $gte: startDate, $lte: endDate },
    });

    // 2. අදාළ මාසය තුළ සේවකයාගේ Attendance Records ලබා ගැනීම
    const attendanceRecords = await Attendance.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    });

    // 3. Metrics ගණනය කිරීම
    let overallScore = 0;
    const metrics = [];
    const achievements = [];
    let feedback = "No feedback available at this time.";

    // --- Task Completion Metric ---
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "Completed").length;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    metrics.push({
      id: 1,
      name: "Task Completion Rate",
      value: parseFloat(taskCompletionRate.toFixed(2)),
      target: 90, // උදාහරණ ඉලක්කය
      unit: "%",
      trend: taskCompletionRate >= 90 ? "up" : taskCompletionRate >= 70 ? "neutral" : "down",
    });

    // --- Punctuality (Attendance) Metric ---
    const presentDaysWithCheckIn = attendanceRecords.filter(a => a.checkIn).length;
    // Punctuality සඳහා 'target check-in time' එකක් සලකමු, උදා: පෙරවරු 9:00
    const targetCheckInHour = 9;

    const punctualCheckInsCount = attendanceRecords.filter(a => {
        if (!a.checkIn) return false;
        const checkInDate = new Date(a.checkIn);
        // check-in වේලාව ඉලක්කගත වේලාව සමඟ සසඳයි
        return checkInDate.getHours() < targetCheckInHour || (checkInDate.getHours() === targetCheckInHour && checkInDate.getMinutes() === 0);
    }).length;

    const punctualityRate = presentDaysWithCheckIn > 0 ? (punctualCheckInsCount / presentDaysWithCheckIn) * 100 : 0;

    metrics.push({
      id: 2,
      name: "Punctuality",
      value: parseFloat(punctualityRate.toFixed(2)),
      target: 90, // උදාහරණ ඉලක්කය
      unit: "%",
      trend: punctualityRate >= 90 ? "up" : punctualityRate >= 70 ? "neutral" : "down",
    });

    // --- Total Hours Worked (කාර්යශූරත්වය සඳහා metric එකක් ලෙස) ---
    let totalHoursWorked = 0;
    attendanceRecords.forEach(record => {
      if (record.checkIn && record.checkOut) {
        const diffMs = new Date(record.checkOut) - new Date(record.checkIn);
        totalHoursWorked += diffMs / (1000 * 60 * 60); // milliseconds සිට පැය දක්වා
      }
    });
    // පැය ගණන metric එකක් සඳහා පරිමාණය කිරීම (උදා: මාසික ඉලක්කය 160 පැය)
    const targetMonthlyHours = 160; // උදාහරණ: දිනකට පැය 8 * වැඩ කරන දින 20
    const hoursWorkedScore = Math.min((totalHoursWorked / targetMonthlyHours) * 100, 100); // 100% ට සීමා කිරීම
    metrics.push({
      id: 3,
      name: "Hours Worked",
      value: parseFloat(totalHoursWorked.toFixed(2)),
      target: targetMonthlyHours,
      unit: " hrs",
      trend: totalHoursWorked >= targetMonthlyHours * 0.9 ? "up" : totalHoursWorked >= targetMonthlyHours * 0.7 ? "neutral" : "down",
    });


    // --- Overall Score ගණනය කිරීම (weighted average) ---
    // බර (Weights): Task Completion 50%, Punctuality 25%, Hours Worked (engagement) 25%
    overallScore = (
      (taskCompletionRate * 0.5) +
      (punctualityRate * 0.25) +
      (hoursWorkedScore * 0.25)
    );
    overallScore = parseFloat(overallScore.toFixed(2));

    // --- Achievements ජනනය කිරීම ---
    if (taskCompletionRate >= 95) {
      achievements.push("Outstanding Task Completion for the month!");
    }
    if (punctualityRate >= 95) {
      achievements.push("Excellent Punctuality!");
    }
    if (totalHoursWorked >= targetMonthlyHours) {
      achievements.push("Achieved or exceeded monthly working hours target!");
    }
    if (overallScore >= 90) {
      achievements.push("Exceptional Overall Performance!");
    } else if (overallScore >= 80) {
      achievements.push("Great performance this month!");
    }
    if (achievements.length === 0) {
        achievements.push("No specific achievements recorded this month, keep up the good work!");
    }


    // --- AI Feedback ජනනය කිරීම ---
    const prompt = `Generate a concise, encouraging, and constructive performance feedback message for an employee based on the following metrics for ${new Date(year, month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric'})}:
    - Overall Score: ${overallScore}%
    - Task Completion Rate: ${taskCompletionRate}% (Target: 90%)
    - Punctuality: ${punctualityRate}% (Target: 90%)
    - Total Hours Worked: ${totalHoursWorked.toFixed(2)} hours (Target: ${targetMonthlyHours} hours)
    - Achievements: ${achievements.join(', ')}.

    The feedback should be about 1-3 sentences, highlighting strengths and suggesting areas for improvement if any metrics are below target.`;

    try {
      const completion = await openai.chat.completions.create({
        model: CHAT_MODEL,
        messages: [{ role: "user", content: prompt }],
      });
      feedback = completion.choices[0].message.content.trim();
    } catch (aiError) {
      console.error("Failed to generate AI feedback:", aiError);
      // AI ජනනය අසාර්ථක වුවහොත් පෙන්වන පණිවිඩය
      feedback = "Could not generate AI feedback at this time. Please check your OpenAI API key, network connection, or API limits.";
    }

    res.json({
      overallScore: overallScore,
      metrics: metrics,
      achievements: achievements,
      feedback: feedback,
    });
  } catch (err) {
    console.error("Failed to fetch performance:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
