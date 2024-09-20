const API_BASE_URL = "/api";
const AUTH_DATA_STORAGE_KEY = "AUTH_DATA";

let token = null;
let user = null;
let role = null;

async function apiCall(url, options = { headers: {} }) {
  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: token ? `Bearer ${token}` : null,
    },
  }).then((res) => res.json());
}

function changeDisplay(id, display) {
  document.getElementById(id).style.display = display;
}

async function handleSignupSubmit(e) {
  e.preventDefault();

  function setError(errorMsg) {
    document.getElementById("signup-error").innerText = errorMsg;
  }

  setError("");

  const name = e.target.name.value;
  const username = e.target.username.value;
  const password = e.target.password.value;
  const role = e.target.role.value;

  const signupRes = await apiCall("/v1/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      username,
      password,
      role,
    }),
  });

  if (!signupRes.success) {
    setError(signupRes?.message ?? "An error occurred.");
    return;
  }

  return doLogin({ username, password });
}

async function handleLoginSubmit(e) {
  e.preventDefault();

  function setError(errorMsg) {
    document.getElementById("login-error").innerText = errorMsg;
  }

  setError("");

  const username = e.target.username.value;
  const password = e.target.password.value;

  const loginSuccess = await doLogin({ username, password });
  if (!loginSuccess) {
    setError("Invalid username or password");
  }
}

async function doLogin({ username, password }) {
  try{
  const res = await apiCall("/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!res.success) {
    setError(res.message);
    return;
  }

  token = res.token;
  user = res.user;
  role = res.role;

  localStorage.setItem(
    AUTH_DATA_STORAGE_KEY,
    JSON.stringify({
      token,
      user,
      role,
    })
  );

  onLoginChanged();
  return true;
  } catch (err) {
    console.error("Login error: ", err);
    //setError("An error occurred.");
    return false;
  }
}

function checkIfLoggedIn() {
  const authData = localStorage.getItem(AUTH_DATA_STORAGE_KEY);
  if (!authData) return;

  const parsed = JSON.parse(authData);
  if (parsed.token && parsed.user && parsed.role) {
    token = parsed.token;
    user = parsed.user;
    role = parsed.role;
  }
}

function hideAllContainers() {
  changeDisplay("login-container", "none");
  changeDisplay("signup-container", "none");
  changeDisplay("admin-container", "none");
  changeDisplay("teacher-container", "none");
  changeDisplay("student-container", "none");
  changeDisplay("logout-button", "none");
}

function updateAllByClassName(clazz, cb) {
  const elements = document.getElementsByClassName(clazz);
  for (let i = 0; i < elements.length; i++) {
    cb(elements[i]);
  }
}

async function onAdminLoggedIn() {
  changeDisplay("admin-container", "block");

  const teachers = await apiCall("/v1/teachers");

  {
    const tableBody = document
      .getElementById("teachers-table")
      .getElementsByTagName("tbody")[0];
    const teacherSelect = document.getElementById("assignCourse-teacherId");

    tableBody.innerHTML = teachers
      .map(
        (teacher) => `
    <tr class="bg-white border-b">
      <td class="px-6 py-4">${teacher.id}</td>
      <td class="px-6 py-4">${teacher.name}</td>
    </tr>
  `
      )
      .join("");

    teacherSelect.innerHTML = teachers
      .map(
        (teacher) => `
        <option value="${teacher.id}">${teacher.name}</option>
      `
      )
      .join("");
  }

  const courses = await apiCall("/v1/courses");

  {
    const tableBody = document
      .getElementById("admin-courses-table")
      .getElementsByTagName("tbody")[0];

    tableBody.innerHTML = courses
      .map(
        (course) => `
      <tr class="bg-white border-b">
        <td class="px-6 py-4">${course.id}</td>
        <td class="px-6 py-4">${course.name}</td>
      </tr>
    `
      )
      .join("");

    const courseSelect = document.getElementById("assignCourse-courseId");
    courseSelect.innerHTML = courses
      .map(
        (course) => `
          <option value="${course.id}">${course.name}</option>
        `
      )
      .join("");
  }
}

async function toggleAnswerCorrect(answerId) {
  const res = await apiCall(
    `/v1/teachers/${user.id}/answers/${answerId}/toggle`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (res.message) {
    alert(res.message);
  } else if (res.id) {
    alert("Answer evaluated successfully.");
  }
}

async function onTeacherLoggedIn() {
  changeDisplay("teacher-container", "block");

  const assignments = await apiCall(`/v1/teachers/${user.id}/courses`);

  {
    const tableBody = document
      .getElementById("teacher-courses-table")
      .getElementsByTagName("tbody")[0];

    tableBody.innerHTML = assignments
      .map(
        (course) => `
      <tr class="bg-white border-b">
        <td class="px-6 py-4">${course.id}</td>
        <td class="px-6 py-4">${course.name}</td>
      </tr>
    `
      )
      .join("");

    const courseSelect = document.getElementById("postQuestion-courseId");
    courseSelect.innerHTML = assignments
      .map(
        (course) => `
          <option value="${course.id}">${course.name}</option>
        `
      )
      .join("");
  }

  const answers = await apiCall(`/v1/teachers/${user.id}/answers`);
  {
    const tableBody = document
      .getElementById("teacher-answers-table")
      .getElementsByTagName("tbody")[0];

    tableBody.innerHTML = answers
      .map(
        (answer) => `
      <tr class="bg-white border-b">
        <td class="px-6 py-4">${answer.question_text}</td>
        <td class="px-6 py-4">${answer.text}</td>
        <td class="px-6 py-4">${answer.student_name}</td>
        <td class="px-6 py-4"><input type="checkbox" ${
          answer.is_correct ? "checked" : ""
        } onclick="toggleAnswerCorrect(${answer.id})"></td>
        <td class="px-6 py-4">${answer.is_correct == null ? "No" : "Yes"}</td>
      </tr>
    `
      )
      .join("");
  }
}

async function handleAssignCourseFormSubmit(e) {
  e.preventDefault();

  const teacherId = e.target.teacherId.value;
  const courseId = e.target.courseId.value;

  const res = await apiCall(`/v1/teachers/${teacherId}/assign-course`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      courseId,
    }),
  });

  if (res.message) {
    alert(res.message);
  } else if (res.id) {
    alert("Course assigned successfully.");
  }
}

async function handlePostQuestionFormSubmit(e) {
  e.preventDefault();

  const courseId = e.target.courseId.value;
  const question = e.target.question.value;

  const res = await apiCall(
    `/v1/teachers/${user.id}/courses/${courseId}/question`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: question,
      }),
    }
  );

  if (res.message) {
    alert(res.message);
  } else if (res.id) {
    alert("Question posted successfully.");
  }
}

async function onStudentLoggedIn() {
  changeDisplay("student-container", "block");
  const courses = await apiCall("/v1/courses");

  {
    const courseSelect = document.getElementById("viewQuestions-courseId");
    courseSelect.innerHTML = courses
      .map(
        (course) => `
            <option value="${course.id}">${course.name}</option>
          `
      )
      .join("");
  }
}

async function handleAnswerFormSubmit(e) {
  e.preventDefault();

  const answer = e.target.answer.value;
  const questionId = e.target.questionId.value;
  const teacherId = e.target.teacherId.value;

  const res = await apiCall(`/v1/questions/${questionId}/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      teacherId,
      answer,
    }),
  });

  if (res.message) {
    alert(res.message);
  } else if (res.id) {
    alert("Answer submitted successfully.");
  }
}

async function handleSelectCourseFormSubmit(e) {
  e.preventDefault();

  const courseId = e.target.courseId.value;

  try {
    const questions = await apiCall(`/v1/courses/${courseId}/questions`);

    const questionsContainer = document.getElementById(
      "student-view-questions"
    );

    if (questions.length > 0) {
      questionsContainer.innerHTML = questions
        .map(
          (q) => `
        <form id="answer-question-${q.id}-form"
          class="space-y-4 mt-4 bg-white rounded-xl p-4">
            <p class="text-lg"><span class="font-semibold">Question:</span> ${
              q.text
            }</p>
            <div class="space-y-2 flex items-center">
                <input type="hidden" name="questionId" value="${q.id}" />
                <input type="hidden" name="teacherId" value="${q.teacher_id}" />
                <label class="font-semibold mr-2" for="answer">Answer</label>
                <input name="answer" required class="px-2 py-1.5 flex-1 border border-gray-200 rounded" ${
                  q.answer_text != null ? `value='${q.answer_text}'` : ""
                } ${q.answer_text == null ? "" : "disabled"} />
            </div>
            ${
              q.answer_text == null
                ? `<button type="submit" class="rounded-lg bg-zinc-800 text-white py-1.5 px-3">
              Submit
            </button>`
                : ""
            }
            ${
              q.is_correct != null
                ? `${
                    !!q.is_correct
                      ? "<p class='text-green-500 font-semibold'>Marked as correct</p>"
                      : "<p class='text-red-500 font-semibold'>Marked as incorrect</p>"
                  }`
                : ""
            }
        </form>
      `
        )
        .join("");

      // form submit listener
      questions.map((q) => {
        document
          .getElementById(`answer-question-${q.id}-form`)
          .addEventListener("submit", handleAnswerFormSubmit);
      });
    } else {
      questionsContainer.innerHTML =
        "<p>No questions available for this course.</p>";
    }
  } catch (error) {
    console.error("Error fetching questions:", error);
    const questionsContainer = document.getElementById(
      "student-view-questions"
    );
    questionsContainer.innerHTML =
      "<p class='text-red-500 text-lg'>Failed to load question. Please try again later.</p>";
  }
}

function onLoginChanged() {
  hideAllContainers();

  if (!user) {
    changeDisplay("login-container", "flex");
    return;
  }

  changeDisplay("login-container", "none");
  changeDisplay("logout-button", "block");

  updateAllByClassName("user-display-name", (e) => (e.innerText = user.name));

  if (role === "admin") {
    onAdminLoggedIn();
  } else if (role === "teacher") {
    onTeacherLoggedIn();
  } else if (role === "student") {
    onStudentLoggedIn();
  }
}

function handleLogout() {
  localStorage.removeItem(AUTH_DATA_STORAGE_KEY);
  token = null;
  user = null;
  role = null;

  onLoginChanged();
}

document.addEventListener("DOMContentLoaded", function () {
  hideAllContainers();
  checkIfLoggedIn();
  onLoginChanged();

  document
    .getElementById("login-form")
    .addEventListener("submit", handleLoginSubmit);
  document
    .getElementById("signup-form")
    .addEventListener("submit", handleSignupSubmit);

  document.getElementById("show-signup-form").addEventListener("click", () => {
    hideAllContainers();
    changeDisplay("signup-container", "flex");
  });

  document.getElementById("show-login-form").addEventListener("click", () => {
    hideAllContainers();
    changeDisplay("login-container", "flex");
  });

  document
    .getElementById("assign-course-form")
    .addEventListener("submit", handleAssignCourseFormSubmit);
  document
    .getElementById("post-question-form")
    .addEventListener("submit", handlePostQuestionFormSubmit);
  document
    .getElementById("select-course-form")
    .addEventListener("submit", handleSelectCourseFormSubmit);
  document
    .getElementById("logout-button")
    .addEventListener("click", handleLogout);
});
