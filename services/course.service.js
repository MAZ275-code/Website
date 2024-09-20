const db = require("../db");

async function getAllCoursesHandler(req, res) {
  const courses = await db.dbAsync(`SELECT * FROM courses`);
  res.json(courses);
  return;
}

async function getQuestionsForCourseHandler(req, res) {
  if (req.role != "student") {
    res.status(500).json({ message: "Invalid student." });
    return;
  }

  const studentId = req.userId;
  const courseId = req.params.courseId;

  const questions = await db.dbAsync(
    `SELECT q.id, q.text, q.teacher_id, a.text as answer_text, a.is_correct
    FROM questions q
    LEFT JOIN answers a
    ON a.question_id = q.id AND a.student_id = ? 
    WHERE q.course_id = ?`,
    [studentId, courseId]
  );

  res.json(questions);

  return;
}

module.exports = { getAllCoursesHandler, getQuestionsForCourseHandler };
