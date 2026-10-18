# School Database Design

## Table Explanations
- **`students`**: Stores core personal information for each student, including their unique identifier, full name, and email address (enforced as unique).
- **`courses`**: Stores available school subjects and academic classes, identified by a unique ID, title, and course code.
- **`enrolments`**: Acts as a junction table connecting students to courses. It tracks which student takes which course, records their academic grade, and uses a composite unique constraint to prevent duplicate enrolments.

## Relationships
- **Students and Courses (Many-to-Many):** A single student can enrol in multiple courses, and a single course can have multiple students. 
- **Why a join table is needed:** Relational databases cannot directly represent many-to-many relationships in a single table without data duplication. The `enrolments` join table bridges `students` and `courses`, allowing us to cleanly model this relationship while storing attributes specific to the enrolment itself (such as the `grade`).

## Indexing Strategy
- **Index to Add:** An index on `enrolments(student_id)` and `enrolments(course_id)`.
- **Reason:** Foreign key columns are frequently used in `JOIN` operations and `WHERE` clauses when querying student schedules or course rosters. Adding an index speeds up these relational lookups significantly as the database grows.

## SQL vs NoSQL Choice
For a school management system containing structured entities like students, courses, and grades, a relational SQL database is the ideal choice. SQL guarantees ACID compliance, ensuring that transactions such as grade updates and student enrolments are handled reliably without data inconsistency. Furthermore, the rigid tabular structure and clear relationships between students and courses map naturally onto relational tables with foreign key constraints, making data integrity much easier to maintain than in a document-based NoSQL store.