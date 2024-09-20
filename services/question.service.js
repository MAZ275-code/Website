const db = require("../db");

async function postAnswerForQuestionHandler(req, res) {
  const questionId = req.params.questionId;

  const { answer } = req.body;

  if (!req.role === "student") {
    res.status(500).json({ message: "You are not a student." });
    return;
  }

  const questionResponse = await db.dbAsync(
    `SELECT * FROM questions
    WHERE id = ?`,
    [questionId]
  );

  if (!questionResponse || questionResponse.length == 0) {
    res.status(500).json({ message: "Question not found." });
    return;
  }

  await db.dbAsync(
    `INSERT INTO answers (question_id, student_id, text) VALUES (?, ?, ?);`,
    [questionId, req.userId, answer]
  );

  res.status(200).json({ message: "Answer submitted successfully." });

  return;
}

module.exports = { postAnswerForQuestionHandler };
