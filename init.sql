CREATE DATABASE education_system;

USE education_system;

CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    pass VARCHAR(255) NOT NULL
);

CREATE TABLE teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    pass VARCHAR(255) NOT NULL
);

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    pass VARCHAR(255) NOT NULL
);

CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT,
    course_id INT,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT,
    teacher_id INT,
    text TEXT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
);

CREATE TABLE answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    question_id INT,
    text TEXT NOT NULL,
    is_correct BOOLEAN,
    FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- password is admin
INSERT INTO admins (name, username, pass) VALUES ('Admin1', 'admin1', '$2b$10$KagK2y.q6kG/KJCHneu/MuKVBMrRkbprg7nM7M9aOLpWcuAByxhsa'); --for testing
INSERT INTO admins (name, username, pass) VALUES ('Admin2', 'admin2', '$2b$10$KagK2y.q6kG/KJCHneu/MuKVBMrRkbprg7nM7M9aOLpWcuAByxhsa'); --for testing
INSERT INTO admins (name, username, pass) VALUES ('Admin3', 'admin3', '$2b$10$KagK2y.q6kG/KJCHneu/MuKVBMrRkbprg7nM7M9aOLpWcuAByxhsa'); --for testing

INSERT INTO teachers (name,username,pass) VALUES ('Teach1','teach1','$2b$10$KagK2y.q6kG/KJCHneu/MuKVBMrRkbprg7nM7M9aOLpWcuAByxhsa'); --for testing
INSERT INTO teachers (name,username,pass) VALUES ('Teach2','teach2','$2b$10$KagK2y.q6kG/KJCHneu/MuKVBMrRkbprg7nM7M9aOLpWcuAByxhsa'); --for testing
INSERT INTO teachers (name,username,pass) VALUES ('Teach3','teach3','$2b$10$KagK2y.q6kG/KJCHneu/MuKVBMrRkbprg7nM7M9aOLpWcuAByxhsa'); --for testing
INSERT INTO teachers (name,username,pass) VALUES ('Teach4','teach4','$2b$10$KagK2y.q6kG/KJCHneu/MuKVBMrRkbprg7nM7M9aOLpWcuAByxhsa'); --for testing
INSERT INTO teachers (name,username,pass) VALUES ('Teach5','teach5','$2b$10$KagK2y.q6kG/KJCHneu/MuKVBMrRkbprg7nM7M9aOLpWcuAByxhsa'); --for testing

INSERT INTO students (name,username,pass) VALUES ('Stud1','stud1','$2b$10$KagK2y.q6kG/KJCHneu/MuKVBMrRkbprg7nM7M9aOLpWcuAByxhsa'); --for testing
INSERT INTO students (name,username,pass) VALUES ('Stud2','stud2','$2b$10$KagK2y.q6kG/KJCHneu/MuKVBMrRkbprg7nM7M9aOLpWcuAByxhsa'); --for testing
INSERT INTO students (name,username,pass) VALUES ('Stud2','stud3','$2b$10$KagK2y.q6kG/KJCHneu/MuKVBMrRkbprg7nM7M9aOLpWcuAByxhsa'); --for testing
INSERT INTO students (name,username,pass) VALUES ('Stud3','stud4','$2b$10$KagK2y.q6kG/KJCHneu/MuKVBMrRkbprg7nM7M9aOLpWcuAByxhsa'); --for testing
INSERT INTO students (name,username,pass) VALUES ('Stud4','stud5','$2b$10$KagK2y.q6kG/KJCHneu/MuKVBMrRkbprg7nM7M9aOLpWcuAByxhsa'); --for testing

INSERT INTO courses (name) VALUES ('Maths');
INSERT INTO courses (name) VALUES ('Science');
INSERT INTO courses (name) VALUES ('Social Science');
INSERT INTO courses (name) VALUES ('Art');
INSERT INTO courses (name) VALUES ('Sports');

INSERT INTO assignments (teacher_id, course_id) VALUES (1, 1); --for testing
INSERT INTO assignments (teacher_id, course_id) VALUES (1, 4); --for testing
INSERT INTO assignments (teacher_id, course_id) VALUES (1, 4); --for testing

INSERT INTO assignments (teacher_id, course_id) VALUES (2, 1); --for testing
INSERT INTO assignments (teacher_id, course_id) VALUES (2, 3); --for testing


INSERT INTO questions (course_id, text) VALUES (1, 'What is 2+2?'); --for testing
INSERT INTO questions (course_id, text) VALUES (1, 'What is 9+11?'); --for testing
