const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const authMiddleware = require('../middleware/auth');
const InterviewSession = require('../models/InterviewSession');

router.post('/upload', authMiddleware, async (req, res) => {
  try {
    const { question, videoType, videoBase64 } = req.body;

    if (!question || !videoType || !videoBase64) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const buffer = Buffer.from(videoBase64, 'base64');

    const interview = new Interview({
      userId: req.user.id,
      question,
      video: buffer,
      videoType
    });

    await interview.save();
    res.json({ success: true, message: 'Interview video saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// 📥 Save interview session questions
router.post('/session', authMiddleware, async (req, res) => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length !== 10) {
      return res.status(400).json({ success: false, message: '10 questions required' });
    }

    // Remove previous session if it exists for the same user
    await InterviewSession.deleteMany({ userId: req.user.id });

    // Save new session
    const session = new InterviewSession({
      userId: req.user.id,
      questions
    });

    await session.save();
    res.json({ success: true, message: 'Interview session saved' });
  } catch (err) {
    console.error('Session save error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});
// 📤 Get AI feedback
router.get('/ai-feedback', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const interviews = await Interview.find({ userId });

    if (!interviews || interviews.length === 0) {
      return res.status(404).json({ success: false, message: 'No interview responses found.' });
    }

    // 🧠 Simulated AI feedback logic (replace with your real logic later)
    const results = interviews.map((item, idx) => ({
      question: item.question,
      transcript: "Simulated transcript",
      matchedKeywords: ["example", "keywords"],
      score: 1 // Assuming 1 per question
    }));

    const totalScore = results.reduce((acc, r) => acc + r.score, 0);

    res.json({
      success: true,
      results,
      totalScore,
      summary: `Great job! You scored ${totalScore} out of ${results.length}.`
    });

  } catch (err) {
    console.error('AI feedback error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
