-- Enable foreign key support in SQLite
PRAGMA foreign_keys = ON;

-- Drop existing tables if they exist to allow clean re-runs
DROP TABLE IF EXISTS enrolments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;

-- Create tables
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE
);

CREATE TABLE enrolments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    -- Rule preventing the same student enrolling on the same course twice
    UNIQUE (student_id, course_id)
);

-- Insert sample data (at least 3 students, 3 courses, and 5 enrolments)
INSERT INTO students (name, email) VALUES 
('Alice Smith', 'alice@example.com'),
('Bob Jones', 'bob@example.com'),
('Charlie Brown', 'charlie@example.com'),
('Diana Prince', 'diana@example.com'); -- Extra student with no enrolments to test LEFT JOIN

INSERT INTO courses (title, code) VALUES 
('Mathematics 101', 'MATH101'),
('Physics 101', 'PHYS101'),
('Chemistry 101', 'CHEM101');

INSERT INTO enrolments (student_id, course_id, grade) VALUES 
(1, 1, 'B'),
(1, 2, 'A'),
(2, 1, 'C'),
(2, 3, 'B'),
(3, 2, 'A');

---------------------------------------------------------
-- Queries & Update Operations
---------------------------------------------------------

-- 1. All courses for one student (by name, e.g., 'Alice Smith')
SELECT c.title, c.code, e.grade 
FROM courses c
JOIN enrolments e ON c.id = e.course_id
JOIN students s ON s.id = e.student_id
WHERE s.name = 'Alice Smith';

-- 2. All students on one course (e.g., 'Mathematics 101')
SELECT s.name, s.email, e.grade 
FROM students s
JOIN enrolments e ON s.id = e.student_id
JOIN courses c ON c.id = e.course_id
WHERE c.title = 'Mathematics 101';

-- 3. The number of students per course (using GROUP BY)
SELECT c.title, COUNT(e.student_id) AS student_count
FROM courses c
LEFT JOIN enrolments e ON c.id = e.course_id
GROUP BY c.id, c.title;

-- 4. Students who have no enrolments (using LEFT JOIN)
SELECT s.name, s.email
FROM students s
LEFT JOIN enrolments e ON s.id = e.student_id
WHERE e.id IS NULL;

-- 5. An update of one enrolment's grade
UPDATE enrolments
SET grade = 'A+'
WHERE student_id = 1 AND course_id = 1;