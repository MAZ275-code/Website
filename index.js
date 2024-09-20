const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const {
  loginHandler,
  signupHandler,
  jwtMiddlewareHandler,
} = require("./services/auth.service");
const {
  getAllTeachersHandler,
  getCoursesForTeacherHandler,
  postQuestionForCourseHandler,
  getAllAnswersForTeacherHandler,
  toggleAnswerByTeacherHandler,
  assignCourseForTeacherHandler,
} = require("./services/teacher.service");
const {
  getAllCoursesHandler,
  getQuestionsForCourseHandler,
} = require("./services/course.service");
const { postAnswerForQuestionHandler } = require("./services/question.service");

// Create a new Express application
const app = express();
const port = process.env.PORT ?? 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname + "/public")));

app.post("/api/v1/auth/login", loginHandler);
app.post("/api/v1/auth/signup", signupHandler);

app.get("/api/v1/hello", (req, res) => {
  res.json({ message: "Hello, world!" });
});

app.use(jwtMiddlewareHandler);

app.get("/api/v1/protected", (req, res) => {
  res.json({ message: "You are logged in." });
});

app.get("/api/v1/teachers", getAllTeachersHandler);
app.post(
  "/api/v1/teachers/:teacherId/assign-course",
  assignCourseForTeacherHandler
);
app.get("/api/v1/teachers/:teacherId/courses", getCoursesForTeacherHandler);
app.post(
  "/api/v1/teachers/:teacherId/courses/:courseId/question",
  postQuestionForCourseHandler
);
app.get("/api/v1/teachers/:teacherId/answers", getAllAnswersForTeacherHandler);
app.post(
  "/api/v1/teachers/:teacherId/answers/:answerId/toggle",
  toggleAnswerByTeacherHandler
);

app.get("/api/v1/courses", getAllCoursesHandler);
app.get("/api/v1/courses/:courseId/questions", getQuestionsForCourseHandler);

app.post("/api/v1/questions/:questionId/answer", postAnswerForQuestionHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
