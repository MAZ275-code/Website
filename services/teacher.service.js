const db = require("../db");

async function getAllTeachersHandler(req, res) {
  const teachers = await db.dbAsync(`SELECT * FROM teachers`);
  res.json(db.hidePass(teachers));
  return;
}

async function assignCourseForTeacherHandler(req, res) {
  const { teacherId } = req.params;
  const { courseId } = req.body;

  if (req.role != "admin") {
    res
      .status(403)
      .json({ success: false, message: "Only admins can assign courses." });
    return;
  }

  const assignments = await db.dbAsync(
    `SELECT * FROM assignments WHERE teacher_id = ? AND course_id = ?`,
    [teacherId, courseId]
  );

  if (assignments.length > 0) {
    res
      .status(403)
      .json({ success: false, message: "Course already assigned." });
    return;
  }

  const insertResults = await db.dbAsync(
    `INSERT INTO assignments (teacher_id, course_id) VALUES (?, ?)`,
    [teacherId, courseId]
  );

  res.json({ id: insertResults.insertId });

  return;
}

async function getCoursesForTeacherHandler(req, res) {
  const { teacherId } = req.params;

  const courses = await db.dbAsync(
    `SELECT courses.* FROM courses
     JOIN assignments ON courses.id = assignments.course_id
     WHERE assignments.teacher_id = ?`,
    [teacherId]
  );

  res.json(courses);
  return;
}

async function postQuestionForCourseHandler(req, res) {
  const { teacherId, courseId } = req.params;
  const { text } = req.body;

  if (teacherId != req.userId) {
    res.status(403).json({ message: "Invalid teacher." });
    return;
  }

  const assignments = await db.dbAsync(
    `SELECT * FROM assignments WHERE teacher_id = ? AND course_id = ?`,
    [teacherId, courseId]
  );

  if (assignments.length == 0) {
    res.status(403).json({ message: "You are not assigned to this course." });
    return;
  }

  const insertResults = await db.dbAsync(
    `INSERT INTO questions (text, course_id, teacher_id) VALUES (?, ?, ?)`,
    [text, courseId, teacherId]
  );

  res.status(201).json({ id: insertResults.insertId });
  return;
}

async function getAllAnswersForTeacherHandler(req, res) {
  const { teacherId } = req.params;

  if (teacherId != req.userId) {
    res.status(403).json({ message: "Invalid teacher." });
    return;
  }

  const answers = await db.dbAsync(
    `SELECT answers.id, answers.text, answers.is_correct, students.name AS student_name, questions.text AS question_text
     FROM answers
     JOIN students ON answers.student_id = students.id
     JOIN questions ON answers.question_id = questions.id
     JOIN courses ON questions.course_id = courses.id
     JOIN assignments ON courses.id = assignments.course_id
     WHERE assignments.teacher_id = ?`,
    [teacherId]
  );

  res.json(answers);
  return;
}

async function toggleAnswerByTeacherHandler(req, res) {
  const { teacherId, answerId } = req.params;

  if (teacherId != req.userId) {
    res.status(403).json({ message: "Invalid teacher." });
    return;
  }

  const isCorrectRes = await db.dbAsync(
    `SELECT id,is_correct FROM answers WHERE id = ?`,
    [answerId]
  );

  if (!isCorrectRes || isCorrectRes.length === 0) {
    res.status(404).json({ message: "Answer not found." });
    return;
  }

  const newValue = !isCorrectRes[0].is_correct;

  const query = `
    UPDATE answers
    JOIN questions ON answers.question_id = questions.id
    JOIN assignments ON questions.course_id = assignments.course_id
    SET answers.is_correct = ?
    WHERE answers.id = ? AND assignments.teacher_id = ?
  `;

  const results = await db.dbAsync(query, [newValue, answerId, teacherId]);

  if (results.affectedRows === 0) {
    res.status(404).json({ message: "Answer not found or not authorized." });
    return;
  }

  res.json({ message: "Answer marked successfully." });
  return;
}

module.exports = {
  getAllTeachersHandler,
  assignCourseForTeacherHandler,
  getCoursesForTeacherHandler,
  postQuestionForCourseHandler,
  getAllAnswersForTeacherHandler,
  toggleAnswerByTeacherHandler,
};
