// Initial Seed Data (Matching user screenshot)
const SEED_STUDENTS = [
  { id: '1', name: 'Jake', attendance: 'Absent', g1: 85, g2: 88, g3: 90 },
  { id: '2', name: 'Gerald', attendance: 'Present', g1: 70, g2: 75, g3: 72 },
  { id: '3', name: 'John Dexter', attendance: 'Present', g1: 95, g2: 92, g3: 94 },
  { id: '4', name: 'Jamaica', attendance: 'Absent', g1: 89, g2: 90, g3: 79 },
  { id: '5', name: 'Jolina', attendance: 'Present', g1: 88, g2: 85, g3: 90 },
  { id: '6', name: 'Sarah', attendance: 'Present', g1: 78, g2: 80, g3: 82 },
  { id: '7', name: 'Czeahamford', attendance: 'Present', g1: 92, g2: 89, g3: 94 },
  { id: '8', name: 'Mc Kenneth', attendance: 'Present', g1: 73, g2: 70, g3: 68 }
];

// App State
let students = [];
let currentFilter = 'all';
let searchQuery = '';

// DOM Elements
const tableBody = document.getElementById('table-body');
const emptyState = document.getElementById('empty-state');
const themeToggleBtn = document.getElementById('theme-toggle');
const searchInput = document.getElementById('search-input');
const filterPills = document.querySelectorAll('.filter-pill');
const addStudentBtn = document.getElementById('add-student-btn');
const studentModal = document.getElementById('student-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelBtn = document.getElementById('cancel-btn');
const studentForm = document.getElementById('student-form');
const modalTitle = document.getElementById('modal-title');

// Form Input Elements
const studentIdInput = document.getElementById('student-id');
const studentNameInput = document.getElementById('student-name');
const studentAttendanceSelect = document.getElementById('student-attendance');
const gradeG1Input = document.getElementById('grade-g1');
const gradeG2Input = document.getElementById('grade-g2');
const gradeG3Input = document.getElementById('grade-g3');

// Metric Elements
const statTotalStudents = document.getElementById('stat-total-students');
const statClassAverage = document.getElementById('stat-class-average');
const statPassingRate = document.getElementById('stat-passing-rate');
const statAttendanceRate = document.getElementById('stat-attendance-rate');

// Initialize App
function init() {
  loadTheme();
  loadStudents();
  setupEventListeners();
  render();
}

// Load Students from LocalStorage or seed data
function loadStudents() {
  const storedStudents = localStorage.getItem('gradeinfo_students');
  if (storedStudents) {
    students = JSON.parse(storedStudents);
  } else {
    students = SEED_STUDENTS;
    saveStudents();
  }
}

// Save Students to LocalStorage
function saveStudents() {
  localStorage.setItem('gradeinfo_students', JSON.stringify(students));
}

// Set up UI Event Listeners
function setupEventListeners() {
  // Theme Toggle
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Search Input
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    render();
  });

  // Filter Pills
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.getAttribute('data-filter');
      render();
    });
  });

  // Modal Open/Close
  addStudentBtn.addEventListener('click', () => openModal());
  closeModalBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  
  // Close modal when clicking outside the card
  studentModal.addEventListener('click', (e) => {
    if (e.target === studentModal) closeModal();
  });

  // Form Submit
  studentForm.addEventListener('submit', handleFormSubmit);
}

// Toggle light/dark theme
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('gradeinfo_theme', newTheme);
}

// Load initial theme preference
function loadTheme() {
  const savedTheme = localStorage.getItem('gradeinfo_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// Calculate and render stats metrics
function updateMetrics() {
  const total = students.length;
  statTotalStudents.textContent = total;

  if (total === 0) {
    statClassAverage.textContent = '0.00';
    statPassingRate.textContent = '0.0%';
    statAttendanceRate.textContent = '0.0%';
    return;
  }

  // Averages calculations
  let sumAverages = 0;
  let passCount = 0;
  let presentCount = 0;

  students.forEach(student => {
    const avg = calculateAverage(student.g1, student.g2, student.g3);
    sumAverages += avg;
    if (avg >= 75) passCount++;
    if (student.attendance === 'Present') presentCount++;
  });

  const classAvg = sumAverages / total;
  const passRate = (passCount / total) * 100;
  const attendanceRate = (presentCount / total) * 100;

  statClassAverage.textContent = classAvg.toFixed(2);
  statPassingRate.textContent = `${passRate.toFixed(1)}%`;
  statAttendanceRate.textContent = `${attendanceRate.toFixed(1)}%`;
}

// Helper: Calculate average
function calculateAverage(g1, g2, g3) {
  return (Number(g1) + Number(g2) + Number(g3)) / 3;
}

// Render student list and update dashboard metrics
function render() {
  // Update overview widgets
  updateMetrics();

  // Filter students
  const filteredStudents = students.filter(student => {
    // Search query check
    const matchesSearch = student.name.toLowerCase().includes(searchQuery);
    
    // Pill filter check
    const studentAvg = calculateAverage(student.g1, student.g2, student.g3);
    const remarks = studentAvg >= 75 ? 'passed' : 'failed';
    
    let matchesFilter = true;
    if (currentFilter === 'present') {
      matchesFilter = student.attendance === 'Present';
    } else if (currentFilter === 'absent') {
      matchesFilter = student.attendance === 'Absent';
    } else if (currentFilter === 'passed') {
      matchesFilter = remarks === 'passed';
    } else if (currentFilter === 'failed') {
      matchesFilter = remarks === 'failed';
    }

    return matchesSearch && matchesFilter;
  });

  // Empty state handling
  if (filteredStudents.length === 0) {
    tableBody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');

  // Populate Table rows
  tableBody.innerHTML = filteredStudents.map(student => {
    const avg = calculateAverage(student.g1, student.g2, student.g3);
    const passed = avg >= 75;
    const remarkClass = passed ? 'passed' : 'failed';
    const remarkText = passed ? 'Passed' : 'Failed';
    const attendanceClass = student.attendance.toLowerCase();

    // Get initials for profile avatar
    const initials = student.name
      .split(' ')
      .map(part => part.charAt(0))
      .slice(0, 2)
      .join('');

    return `
      <tr>
        <td>
          <div class="student-profile">
            <div class="student-avatar">${initials}</div>
            <span class="student-name-text">${escapeHTML(student.name)}</span>
          </div>
        </td>
        <td>
          <span class="badge ${attendanceClass}">${student.attendance}</span>
        </td>
        <td class="text-center grade-val">${student.g1}</td>
        <td class="text-center grade-val">${student.g2}</td>
        <td class="text-center grade-val">${student.g3}</td>
        <td class="text-center grade-val bold">${avg.toFixed(2)}</td>
        <td>
          <span class="badge ${remarkClass}">${remarkText}</span>
        </td>
        <td>
          <div class="actions-cell">
            <button class="btn-action edit-btn" onclick="editStudent('${student.id}')" title="Edit Student">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
            </button>
            <button class="btn-action delete-btn" onclick="deleteStudent('${student.id}')" title="Delete Student">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Open modal for Adding / Editing
function openModal(student = null) {
  studentModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden'; // Disable background scroll

  if (student) {
    modalTitle.textContent = 'Edit Student Record';
    studentIdInput.value = student.id;
    studentNameInput.value = student.name;
    studentAttendanceSelect.value = student.attendance;
    gradeG1Input.value = student.g1;
    gradeG2Input.value = student.g2;
    gradeG3Input.value = student.g3;
  } else {
    modalTitle.textContent = 'Add Student Record';
    studentForm.reset();
    studentIdInput.value = '';
  }
}

// Close Modal
function closeModal() {
  studentModal.classList.add('hidden');
  document.body.style.overflow = ''; // Enable background scroll
}

// Form Submit Actions (Create & Update)
function handleFormSubmit(e) {
  e.preventDefault();

  const id = studentIdInput.value;
  const name = studentNameInput.value.trim();
  const attendance = studentAttendanceSelect.value;
  const g1 = Math.max(0, Math.min(100, Number(gradeG1Input.value)));
  const g2 = Math.max(0, Math.min(100, Number(gradeG2Input.value)));
  const g3 = Math.max(0, Math.min(100, Number(gradeG3Input.value)));

  if (id) {
    // Edit existing student
    students = students.map(s => s.id === id ? { ...s, name, attendance, g1, g2, g3 } : s);
  } else {
    // Add new student
    const newStudent = {
      id: Date.now().toString(),
      name,
      attendance,
      g1,
      g2,
      g3
    };
    students.push(newStudent);
  }

  saveStudents();
  closeModal();
  render();
}

// Global functions exposed to window for onclick handlers
window.editStudent = function(id) {
  const student = students.find(s => s.id === id);
  if (student) {
    openModal(student);
  }
};

window.deleteStudent = function(id) {
  const student = students.find(s => s.id === id);
  if (!student) return;

  const confirmed = confirm(`Are you sure you want to delete ${student.name}'s record?`);
  if (confirmed) {
    students = students.filter(s => s.id !== id);
    saveStudents();
    render();
  }
};

// Helper: Escape HTML strings for security
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Run application
document.addEventListener('DOMContentLoaded', init);
