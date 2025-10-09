const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const studentsFile = path.join(__dirname, "data", "students.json");
const teachersFile = path.join(__dirname, "data", "teachers.json");

// Helper functions
const readJSONFile = (filePath) => {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, "utf-8");
  return data ? JSON.parse(data) : [];
};

const writeJSONFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// ------------------- Student Login -------------------
app.post("/api/student/login", (req, res) => {
  const { email, password } = req.body;
  const students = readJSONFile(studentsFile);

  const student = students.find(
    (s) => s.email.toLowerCase().trim() === email.toLowerCase().trim() && s.password === password
  );

  if (student) res.status(200).json({ success: true, student });
  else res.status(401).json({ success: false, message: "Invalid student credentials" });
});

// ------------------- Teacher Login -------------------
app.post("/api/teacher/login", (req, res) => {
  const { email, password } = req.body;
  const teachers = readJSONFile(teachersFile);

  const teacher = teachers.find(
    (t) => t.email.toLowerCase().trim() === email.toLowerCase().trim() && t.password === password
  );

  if (teacher) res.status(200).json({ success: true, teacher });
  else res.status(401).json({ success: false, message: "Invalid teacher credentials" });
});

// ---------------- GET ALL STUDENTS ----------------
app.get("/api/students", (req, res) => {
  const students = readJSONFile(studentsFile);
  res.json({ success: true, students });
});

// ---------------- ADD STUDENT ----------------
app.post("/api/teacher/add-student", (req, res) => {
  const students = readJSONFile(studentsFile);
  const newStudent = { ...req.body, id: uuidv4() };
  students.push(newStudent);
  writeJSONFile(studentsFile, students);
  res.json({ success: true, students });
});

// ---------------- UPDATE STUDENT INFO ----------------
app.put("/api/teacher/update-student", (req, res) => {
  const students = readJSONFile(studentsFile);
  const index = students.findIndex((s) => s.id === req.body.id);
  if (index === -1) return res.status(404).json({ success: false, message: "Student not found" });

  students[index] = { ...req.body };
  writeJSONFile(studentsFile, students);
  res.json({ success: true, students });
});

// ---------------- DELETE STUDENT ----------------
app.delete("/api/teacher/delete-student/:id", (req, res) => {
  const students = readJSONFile(studentsFile);
  const index = students.findIndex((s) => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: "Student not found" });

  students.splice(index, 1);
  writeJSONFile(studentsFile, students);
  res.json({ success: true, students });
});

// ---------------- ADD MARKS / ATTENDANCE ----------------
app.post("/api/teacher/add-student-data", (req, res) => {
  const { studentId, marks } = req.body; // marks = array of month objects
  const students = readJSONFile(studentsFile);

  const student = students.find((s) => s.id === studentId);
  if (!student) return res.status(404).json({ success: false, message: "Student not found" });

  if (!student.marks) student.marks = {};
  marks.forEach((monthData) => {
    const monthName = Object.keys(monthData)[0];
    student.marks[monthName] = monthData[monthName];
  });

  writeJSONFile(studentsFile, students);
  res.json({ success: true, student, students });
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
