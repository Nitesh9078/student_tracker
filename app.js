// Global variables and data
let currentClass = '';
let currentStudent = null;
let currentAction = '';

// NEW: Global variables for date/class selection in attendance tab
let selectedAttendanceDate = ''; // YYYY-MM-DD format
let selectedAttendanceClassId = '';

// Nepali calendar data
const nepaliMonths = [
    {"en": "Baishakh", "np": "बैशाख", "days": 31},
    {"en": "Jestha", "np": "जेष्ठ", "days": 31},
    {"en": "Ashadh", "np": "आषाढ", "days": 32},
    {"en": "Shrawan", "np": "श्रावण", "days": 32},
    {"en": "Bhadau", "np": "भाद्र", "days": 32},
    {"en": "Asoj", "np": "आश्विन", "days": 31},
    {"en": "Kartik", "np": "कार्तिक", "days": 30},
    {"en": "Mangsir", "np": "मार्गशीर्ष", "days": 30},
    {"en": "Poush", "np": "पौष", "days": 30},
    {"en": "Magh", "np": "माघ", "days": 30},
    {"en": "Falgun", "np": "फाल्गुण", "days": 30},
    {"en": "Chaitra", "np": "चैत्र", "days": 31}
];

const nepaliNumbers = {
    "0": "०", "1": "१", "2": "२", "3": "३", "4": "४",
    "5": "५", "6": "६", "7": "७", "8": "८", "9": "९"
};


// Utility Functions
function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

function convertToNepaliNumbers(num) {
    return num.toString().split('').map(digit => nepaliNumbers[digit] || digit).join('');
}

// MODIFIED: getNepaliDate to return full date string and formatted string
function getNepaliDate(date = new Date()) {
    // Simplified BS conversion - adding approximately 56 years and 8 months
    // This is a rough conversion for display. For accurate date calculations,
    // you would need a full Nepali calendar library.
    const bsYear = date.getFullYear() + 57;
    const bsMonth = (date.getMonth() + 4) % 12; // Rough conversion
    const bsDay = date.getDate();

    const monthName = nepaliMonths[bsMonth].np;
    
    // Return an object with both the formatted string and a date key (YYYY-MM-DD for uniqueness)
    return {
        formatted: `${convertToNepaliNumbers(bsYear)} साल, ${monthName} ${convertToNepaliNumbers(bsDay)} गते`,
        dateKey: `${bsYear}-${String(bsMonth + 1).padStart(2, '0')}-${String(bsDay).padStart(2, '0')}`
    };
}

// NEW: Helper to get YYYY-MM-DD from a Date object
function getFormattedGregorianDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


function formatEnglishDate(date = new Date()) {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showMessage(message, type = 'success') {
    // Remove any existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageEl = document.createElement('div');
    messageEl.className = `message message--${type}`;
    messageEl.textContent = message;

    const mainEl = document.querySelector('main');
    if (mainEl) {
        mainEl.insertBefore(messageEl, mainEl.firstChild);

        setTimeout(() => {
            if (messageEl && messageEl.parentNode) {
                messageEl.remove();
            }
        }, 3000);
    }
}


// Local Storage Functions
function getFromStorage(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('Error reading from localStorage:', e);
        return defaultValue;
    }
}

function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Error saving to localStorage:', e);
        return false;
    }
}

function initializeData() {
    const existingClasses = getFromStorage('classes', []);
    if (existingClasses.length === 0) {
        // Initialize with sample data
        const sampleData = [
            {
                "id": "class1",
                "name": "Class 5A",
                "students": [
                    {
                        "id": "student1",
                        "name": "Ram Sharma",
                        "phone": "+977-9841234567",
                        "parentName": "Shyam Sharma", 
                        "parentPhone": "+977-9841234568",
                        "address": "Kathmandu, Nepal",
                        "dateOfBirth": "2010-05-15"
                    },
                    {
                        "id": "student2", 
                        "name": "Sita Poudel",
                        "phone": "+977-9841234569",
                        "parentName": "Gita Poudel",
                        "parentPhone": "+977-9841234570", 
                        "address": "Lalitpur, Nepal",
                        "dateOfBirth": "2010-08-22"
                    }
                ]
            },
            {
                "id": "class2",
                "name": "Class 6B", 
                "students": [
                    {
                        "id": "student3",
                        "name": "Hari Thapa",
                        "phone": "+977-9841234571",
                        "parentName": "Maya Thapa",
                        "parentPhone": "+977-9841234572",
                        "address": "Bhaktapur, Nepal", 
                        "dateOfBirth": "2009-12-10"
                    }
                ]
            }
        ];
        
        console.log('Initializing with sample data:', sampleData);
        saveToStorage('classes', sampleData);
    } else {
        console.log('Existing classes found:', existingClasses);
    }
}


// Data Management Functions
function getClasses() {
    return getFromStorage('classes', []);
}

function saveClasses(classes) {
    return saveToStorage('classes', classes);
}

// MODIFIED: getAttendanceRecords now returns an object for nested structure
function getAttendanceRecords() {
    return getFromStorage('attendanceRecords', {}); // Default is now an empty object
}

// MODIFIED: saveAttendanceRecords now saves the object
function saveAttendanceRecords(records) {
    return saveToStorage('attendanceRecords', records);
}

function addClass(name) {
    const classes = getClasses();
    const newClass = {
        id: generateId(),
        name: name,
        students: []
    };
    classes.push(newClass);
    saveClasses(classes);
    return newClass;
}

function updateClass(classId, updates) {
    const classes = getClasses();
    const classIndex = classes.findIndex(c => c.id === classId);
    if (classIndex !== -1) {
        classes[classIndex] = { ...classes[classIndex], ...updates };
        saveClasses(classes);
        return classes[classIndex];
    }
    return null;
}

function deleteClass(classId) {
    let classes = getClasses();
    classes = classes.filter(c => c.id !== classId);
    saveClasses(classes);
    
    // MODIFIED: Also remove attendance records for this class
    let records = getAttendanceRecords();
    for (const dateKey in records) {
        if (records[dateKey][classId]) {
            delete records[dateKey][classId];
        }
    }
    saveAttendanceRecords(records);
}

function addStudent(classId, studentData) {
    const classes = getClasses();
    const classIndex = classes.findIndex(c => c.id === classId);
    if (classIndex !== -1) {
        const newStudent = {
            id: generateId(),
            ...studentData
        };
        classes[classIndex].students.push(newStudent);
        saveClasses(classes);
        return newStudent;
    }
    return null;
}

function updateStudent(classId, studentId, updates) {
    const classes = getClasses();
    const classIndex = classes.findIndex(c => c.id === classId);
    if (classIndex !== -1) {
        const studentIndex = classes[classIndex].students.findIndex(s => s.id === studentId);
        if (studentIndex !== -1) {
            classes[classIndex].students[studentIndex] = { ...classes[classIndex].students[studentIndex], ...updates };
            saveClasses(classes);
            return classes[classIndex].students[studentIndex];
        }
    }
    return null;
}

function deleteStudent(classId, studentId) {
    const classes = getClasses();
    const classIndex = classes.findIndex(c => c.id === classId);
    if (classIndex !== -1) {
        classes[classIndex].students = classes[classIndex].students.filter(s => s.id !== studentId);
        saveClasses(classes);
        
        // MODIFIED: Also remove attendance records for this student
        let records = getAttendanceRecords();
        for (const dateKey in records) {
            if (records[dateKey][classId] && records[dateKey][classId].records) {
                records[dateKey][classId].records = records[dateKey][classId].records.filter(r => r.studentId !== studentId);
            }
        }
        saveAttendanceRecords(records);
    }
}

// MODIFIED: saveAttendance to use nested structure and respect locked status
function saveAttendance(classId, studentId, status, dateStr) { // dateStr is now passed directly
    const records = getAttendanceRecords();

    // Ensure structures exist
    if (!records[dateStr]) {
        records[dateStr] = {};
    }
    if (!records[dateStr][classId]) {
        records[dateStr][classId] = { locked: false, records: [] };
    }

    const classAttendance = records[dateStr][classId];

    // Check if the attendance for this day/class is locked
    if (classAttendance.locked) {
        showMessage('Attendance for this day and class is LOCKED. Cannot make changes.', 'error');
        return false; // Indicate that save was blocked
    }
    
    // Remove existing record for this student on this day
    classAttendance.records = classAttendance.records.filter(r => r.studentId !== studentId);
    
    // Add new record
    classAttendance.records.push({
        id: generateId(),
        studentId: studentId,
        status: status
    });
    
    saveAttendanceRecords(records);
    showMessage(`Attendance for ${studentId} marked: ${status}`, 'success');
    return true; // Indicate that save was successful
}

// MODIFIED: getAttendanceForDate now expects a date string and returns flat records for display
function getAttendanceForDateAndClass(dateStr, classId) {
    const records = getAttendanceRecords();
    if (records[dateStr] && records[dateStr][classId]) {
        return records[dateStr][classId].records;
    }
    return [];
}

// NEW: Function to check if a day/class is locked
function isAttendanceLocked(dateStr, classId) {
    const records = getAttendanceRecords();
    return records[dateStr] && records[dateStr][classId] && records[dateStr][classId].locked;
}

// NEW: Function to lock attendance for a specific day/class
function lockAttendance(dateStr, classId) {
    const records = getAttendanceRecords();
    if (!records[dateStr]) {
        records[dateStr] = {};
    }
    if (!records[dateStr][classId]) {
        records[dateStr][classId] = { locked: false, records: [] };
    }
    records[dateStr][classId].locked = true;
    saveAttendanceRecords(records);
    showMessage(`Attendance for ${dateStr} in class ${classId} has been LOCKED!`, 'success');
}


// UI Functions
function updateDateDisplay() {
    const now = new Date();
    const nepaliDateEl = document.getElementById('nepaliDate');
    const englishDateEl = document.getElementById('englishDate');
    
    const nepaliInfo = getNepaliDate(now); // Get the object from getNepaliDate
    
    if (nepaliDateEl) {
        nepaliDateEl.textContent = nepaliInfo.formatted;
    }
    if (englishDateEl) {
        englishDateEl.textContent = formatEnglishDate(now);
    }
}

// MODIFIED: populateClassSelectors is now used by populateAttendanceControls too
function populateClassSelectors() {
    const classes = getClasses();
    console.log('Populating class selectors with:', classes);
    
    const selectors = [
        { id: 'classSelect', defaultOption: 'Choose a class...' }, // Main attendance class selector
        { id: 'attendanceClass', defaultOption: 'Choose a class...' }, // NEW: Attendance date/class selector
        { id: 'exportClass', defaultOption: 'All Classes' },
        { id: 'studentClass', defaultOption: 'Select Class' }
    ];
    
    selectors.forEach(selector => {
        const selectEl = document.getElementById(selector.id);
        if (selectEl) {
            const currentValue = selectEl.value;
            
            // Clear and add default option
            selectEl.innerHTML = `<option value="">${selector.defaultOption}</option>`;
            
            // Add class options
            classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.id;
                option.textContent = cls.name;
                selectEl.appendChild(option);
            });
            
            // Restore previous selection if still valid
            if (currentValue && classes.find(c => c.id === currentValue)) {
                selectEl.value = currentValue;
            } else if (selector.id === 'attendanceClass' && classes.length > 0) {
                // For attendance class selector, default to the first class if available
                selectEl.value = classes[0].id;
                selectedAttendanceClassId = classes[0].id;
            }
            
            console.log(`Populated ${selector.id} with ${classes.length} classes`);
        } else {
            console.warn(`Element ${selector.id} not found`);
        }
    });
}

// NEW: Function to populate date selector
function populateDateSelector() {
    const dateSelector = document.getElementById('attendanceDate');
    if (!dateSelector) {
        console.warn('attendanceDate element not found');
        return;
    }

    const today = new Date();
    // Clear and add options for past 30 days and future 7 days (or adjust range as needed)
    dateSelector.innerHTML = '';
    
    // Add future days (e.g., next 7 days)
    for (let i = -7; i <= 0; i++) { // From 7 days in the past up to today
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const gregorianDateStr = getFormattedGregorianDate(d);
        const nepaliInfo = getNepaliDate(d);
        
        const option = document.createElement('option');
        option.value = gregorianDateStr;
        option.textContent = `${nepaliInfo.formatted} (${formatEnglishDate(d)})`;
        dateSelector.appendChild(option);
    }

    // Set initial selection to today
    selectedAttendanceDate = getFormattedGregorianDate(today);
    dateSelector.value = selectedAttendanceDate;
}


// MODIFIED: renderStudentList now takes date and classId as arguments
function renderStudentList(dateStr, classId, searchTerm = '') { // MODIFIED: dateStr and classId are now mandatory for attendance
    const classes = getClasses();
    const selectedClass = classes.find(c => c.id === classId);
    const studentListEl = document.getElementById('studentList');
    
    if (!studentListEl) {
        console.warn('studentList element not found');
        return;
    }
    
    if (!classId || !selectedClass) {
        studentListEl.innerHTML = '<div class="empty-state"><p>Select a class to view students</p></div>';
        updateAttendanceSummary([], []); // Reset summary
        return;
    }

    // NEW: Determine if this specific date and class combination is locked
    const isLocked = isAttendanceLocked(dateStr, classId);
    const lockDayBtn = document.getElementById('lockDayBtn');
    if (lockDayBtn) {
        if (isLocked) {
            lockDayBtn.textContent = 'Day Locked';
            lockDayBtn.disabled = true;
            lockDayBtn.classList.add('locked');
            showMessage(`Attendance for ${getNepaliDate(new Date(dateStr)).formatted} in ${selectedClass.name} is LOCKED. No changes allowed.`, 'warning', 5000); // Show for longer
        } else {
            lockDayBtn.textContent = 'Lock Day';
            lockDayBtn.disabled = false;
            lockDayBtn.classList.remove('locked');
        }
    }


    let students = selectedClass.students || [];
    console.log(`Rendering ${students.length} students for class ${selectedClass.name} on ${dateStr}`);
    
    // Filter by search term
    if (searchTerm) {
        students = students.filter(student => 
            student.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        console.log(`Filtered to ${students.length} students matching "${searchTerm}"`);
    }
    
    if (students.length === 0) {
        studentListEl.innerHTML = '<div class="empty-state"><p>No students found</p></div>';
        updateAttendanceSummary([], []); // Reset summary
        return;
    }
    
    // MODIFIED: Get attendance for the specific date and class
    const dailyClassAttendance = getAttendanceForDateAndClass(dateStr, classId);
    
    const studentsHTML = students.map(student => {
        const attendance = dailyClassAttendance.find(a => a.studentId === student.id);
        const status = attendance ? attendance.status : ''; // Default to empty if no record
        
        return `
            <div class="student-item">
                <div class="student-info">
                    <a href="#" class="student-name" data-student-id="${student.id}" data-class-id="${classId}">${student.name}</a>
                    <div class="student-details">
                        ${student.phone || 'No phone'} • ${student.address || 'No address'}
                    </div>
                </div>
                <div class="attendance-controls">
                    <label class="attendance-checkbox attendance-checkbox--present">
                        <input type="radio" name="attendance_${student.id}" value="present" ${status === 'present' ? 'checked' : ''} ${isLocked ? 'disabled' : ''}>
                        Present
                    </label>
                    <label class="attendance-checkbox attendance-checkbox--absent">
                        <input type="radio" name="attendance_${student.id}" value="absent" ${status === 'absent' ? 'checked' : ''} ${isLocked ? 'disabled' : ''}>
                        Absent
                    </label>
                </div>
            </div>
        `;
    }).join('');
    
    studentListEl.innerHTML = studentsHTML;
    updateAttendanceSummary(students, dailyClassAttendance); // MODIFIED: Pass dailyClassAttendance
}


function updateAttendanceSummary(studentsInClass, attendanceRecordsForDateClass = []) { // MODIFIED: Renamed parameter
    const total = studentsInClass.length;
    const present = attendanceRecordsForDateClass.filter(a => a.status === 'present').length;
    const absent = attendanceRecordsForDateClass.filter(a => a.status === 'absent').length;
    
    const totalEl = document.getElementById('totalStudents');
    const presentEl = document.getElementById('presentCount');
    const absentEl = document.getElementById('absentCount');
    
    if (totalEl) totalEl.textContent = total;
    if (presentEl) presentEl.textContent = present;
    if (absentEl) absentEl.textContent = absent;
}


function renderStudentsTab() {
    const classes = getClasses();
    const studentsGridEl = document.getElementById('studentsGrid');
    
    if (!studentsGridEl) return;
    
    const allStudents = [];
    classes.forEach(cls => {
        (cls.students || []).forEach(student => {
            allStudents.push({ ...student, className: cls.name, classId: cls.id });
        });
    });
    
    if (allStudents.length === 0) {
        studentsGridEl.innerHTML = '<div class="empty-state"><p>No students found. Add some students to get started.</p></div>';
        return;
    }
    
    const studentsHTML = allStudents.map(student => `
        <div class="student-card">
            <div class="student-card-header">
                <h4 class="student-card-name">${student.name}</h4>
                <div class="student-card-actions">
                    <button class="btn-icon" onclick="editStudent('${student.classId}', '${student.id}')" title="Edit">✏️</button>
                    <button class="btn-icon" onclick="deleteStudentConfirm('${student.classId}', '${student.id}')" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="student-card-info">
                <div class="info-item">
                    <span class="info-label">Class:</span>
                    <span class="info-value">${student.className}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">
                        ${student.phone ? `<a href="tel:${student.phone}" class="phone-link">${student.phone}</a>` : 'Not provided'}
                    </span>
                </div>
                <div class="info-item">
                    <span class="info-label">Parent:</span>
                    <span class="info-value">${student.parentName || 'Not provided'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Address:</span>
                    <span class="info-value">${student.address || 'Not provided'}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    studentsGridEl.innerHTML = studentsHTML;
}


function renderClassesTab() {
    const classes = getClasses();
    const classesGridEl = document.getElementById('classesGrid');
    
    if (!classesGridEl) return;
    
    if (classes.length === 0) {
        classesGridEl.innerHTML = '<div class="empty-state"><p>No classes found. Add a class to get started.</p></div>';
        return;
    }
    
    const classesHTML = classes.map(cls => `
        <div class="class-card">
            <div class="class-card-header">
                <h4 class="class-card-name">${cls.name}</h4>
                <div class="class-card-count">${(cls.students || []).length} students</div>
            </div>
            <div class="class-card-actions">
                <button class="btn btn--outline btn--sm" onclick="editClass('${cls.id}')">Edit</button>
                <button class="btn btn--outline btn--sm" onclick="deleteClassConfirm('${cls.id}')">Delete</button>
            </div>
        </div>
    `).join('');
    
    classesGridEl.innerHTML = classesHTML;
}


// Tab switching function
function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Update active tab button
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('tab--active'));
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('tab--active');
    }
    
    // Update active content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('tab-content--active');
    });
    
    const targetContent = document.getElementById(tabName + 'Tab');
    if (targetContent) {
        targetContent.classList.add('tab-content--active');
        console.log('Activated content for:', tabName);
    }
    
    // Refresh content based on tab
    if (tabName === 'students') {
        renderStudentsTab();
    } else if (tabName === 'classes') {
        renderClassesTab();
    }
    // MODIFIED: For attendance tab, re-render based on current selections
    else if (tabName === 'attendance') {
        // Ensure selectors are populated and then render student list
        populateDateSelector();
        populateClassSelectors(); // This also populates the attendanceClass selector
        if (selectedAttendanceDate && selectedAttendanceClassId) {
             renderStudentList(selectedAttendanceDate, selectedAttendanceClassId);
        } else {
             // If no class selected yet (e.g. first run), still show empty state
             document.getElementById('studentList').innerHTML = '<div class="empty-state"><p>Select a class to view students</p></div>';
             updateAttendanceSummary([], []);
        }
    }
    // MODIFIED: For reports tab, ensure class selector for export is updated
    else if (tabName === 'reports') {
        populateClassSelectors();
    }
}


// Modal Functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

function showStudentModal(classId = '', studentId = '') {
    const modal = document.getElementById('studentModal');
    const form = document.getElementById('studentForm');
    const title = document.getElementById('modalTitle');
    
    if (!modal || !form || !title) {
        console.warn('Student modal elements not found');
        return;
    }
    
    currentClass = classId;
    currentStudent = studentId;
    
    if (studentId && classId) {
        // Edit mode
        const classes = getClasses();
        const cls = classes.find(c => c.id === classId);
        const student = cls ? cls.students.find(s => s.id === studentId) : null;
        
        if (student) {
            title.textContent = 'Edit Student';
            form.studentName.value = student.name || '';
            form.studentPhone.value = student.phone || '';
            form.parentName.value = student.parentName || '';
            form.parentPhone.value = student.parentPhone || '';
            form.studentAddress.value = student.address || '';
            form.dateOfBirth.value = student.dateOfBirth || '';
            form.studentClass.value = classId;
        }
    } else {
        // Add mode
        title.textContent = 'Add Student';
        form.reset();
        if (classId) {
            form.studentClass.value = classId;
        }
    }
    
    showModal('studentModal');
}


function showConfirmDialog(message, onConfirm) {
    const messageEl = document.getElementById('confirmMessage');
    if (messageEl) {
        messageEl.textContent = message;
    }
    
    showModal('confirmModal');
    
    const confirmBtn = document.getElementById('confirmOk');
    const cancelBtn = document.getElementById('confirmCancel');
    
    // Remove any existing event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    const newCancelBtn = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    
    newConfirmBtn.addEventListener('click', () => {
        onConfirm();
        hideModal('confirmModal');
    });
    
    newCancelBtn.addEventListener('click', () => {
        hideModal('confirmModal');
    });
}

// Global functions for onclick handlers
window.editStudent = function(classId, studentId) {
    showStudentModal(classId, studentId);
};


window.deleteStudentConfirm = function(classId, studentId) {
    const classes = getClasses();
    const cls = classes.find(c => c.id === classId);
    const student = cls ? cls.students.find(s => s.id === studentId) : null;
    
    if (student) {
        showConfirmDialog(`Are you sure you want to delete ${student.name}?`, () => {
            deleteStudent(classId, studentId);
            renderStudentsTab();
            // MODIFIED: Re-render attendance list with selected date and class
            if (currentClass === classId && selectedAttendanceDate && selectedAttendanceClassId) {
                renderStudentList(selectedAttendanceDate, selectedAttendanceClassId);
            }
            showMessage('Student deleted successfully');
        });
    }
};


window.editClass = function(classId) {
    const classes = getClasses();
    const cls = classes.find(c => c.id === classId);
    
    if (cls) {
        const titleEl = document.getElementById('classModalTitle');
        const nameEl = document.getElementById('className');
        
        if (titleEl) titleEl.textContent = 'Edit Class';
        if (nameEl) nameEl.value = cls.name;
        
        currentClass = classId;
        currentAction = 'edit';
        showModal('classModal');
    }
};


window.deleteClassConfirm = function(classId) {
    const classes = getClasses();
    const cls = classes.find(c => c.id === classId);
    
    if (cls) {
        showConfirmDialog(`Are you sure you want to delete ${cls.name}? This will also delete all students and attendance records for this class.`, () => {
            deleteClass(classId);
            renderClassesTab();
            populateClassSelectors(); // MODIFIED: Call populateClassSelectors instead of specific ones

            // MODIFIED: Clear attendance view if this was the selected class or update if it's the class being viewed
            const classSelect = document.getElementById('classSelect'); // Main attendance tab selector
            if (classSelect && classSelect.value === classId) {
                classSelect.value = '';
                // Since selectedAttendanceClassId might be this class, reset it
                selectedAttendanceClassId = ''; 
                renderStudentList('', ''); // Pass empty to clear the list
            }
            
            showMessage('Class deleted successfully');
        });
    }
};


// Theme Functions
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-color-scheme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-color-scheme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = newTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    }
    
    console.log('Theme switched to:', newTheme);
}


function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-color-scheme', theme);
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    }
    
    console.log('Theme initialized to:', theme);
}


// Export Functions
function exportToCSV() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const classId = document.getElementById('exportClass').value;
    
    if (!startDate || !endDate) {
        showMessage('Please select start and end dates', 'error');
        return;
    }
    
    const allRecords = getAttendanceRecords(); // MODIFIED: Get the new nested structure
    const classes = getClasses();
    
    let filteredRecords = [];

    // MODIFIED: Iterate through the new attendance structure
    for (const dateKey in allRecords) {
        const recordDate = new Date(dateKey);
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (recordDate >= start && recordDate <= end) {
            for (const clsId in allRecords[dateKey]) {
                if (!classId || clsId === classId) { // Filter by class if selected
                    const classData = allRecords[dateKey][clsId];
                    if (classData && classData.records) {
                        classData.records.forEach(rec => {
                            filteredRecords.push({
                                date: dateKey,
                                classId: clsId,
                                studentId: rec.studentId,
                                status: rec.status,
                                // Add locked status to CSV if needed
                                locked: classData.locked ? 'Locked' : 'Unlocked'
                            });
                        });
                    }
                }
            }
        }
    }
    
    if (filteredRecords.length === 0) {
        showMessage('No attendance records found for the selected criteria', 'error');
        return;
    }
    
    // Create CSV content
    const headers = ['Date', 'Nepali Date', 'Class Name', 'Student Name', 'Status']; // MODIFIED: Headers
    const csvContent = [headers];
    
    filteredRecords.forEach(record => {
        const cls = classes.find(c => c.id === record.classId);
        // Find student directly from the class object, not from 'classes' global
        const student = cls ? cls.students.find(s => s.id === record.studentId) : null;
        const nepaliDateInfo = getNepaliDate(new Date(record.date)); // Convert back to Nepali for display

        if (cls && student) {
            csvContent.push([
                record.date,
                nepaliDateInfo.formatted, // Use the formatted Nepali date
                cls.name,
                student.name,
                record.status
            ]);
        }
    });
    
    const csv = csvContent.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n'); // MODIFIED: Handle commas in data
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${startDate}_to_${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showMessage('Attendance report exported successfully');
}


function backupData() {
    const data = {
        classes: getClasses(),
        attendanceRecords: getAttendanceRecords(), // MODIFIED: Get the new nested structure
        exportDate: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showMessage('Data backup created successfully');
}


function restoreData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!data.classes || !Array.isArray(data.classes)) {
                throw new Error('Invalid backup file: classes missing or malformed');
            }
            
            // MODIFIED: Check for attendanceRecords format, allow empty or correct object
            if (data.attendanceRecords && typeof data.attendanceRecords !== 'object') {
                 throw new Error('Invalid backup file: attendanceRecords malformed');
            }

            saveClasses(data.classes);
            saveAttendanceRecords(data.attendanceRecords || {}); // MODIFIED: Save empty object if null
            
            // Refresh all displays
            populateClassSelectors();
            populateDateSelector(); // NEW: Refresh date selector
            renderClassesTab();
            renderStudentsTab();
            // MODIFIED: Re-render attendance list based on current selection or default
            if (selectedAttendanceDate && selectedAttendanceClassId) {
                renderStudentList(selectedAttendanceDate, selectedAttendanceClassId);
            } else {
                // If no class was previously selected, show empty state
                document.getElementById('studentList').innerHTML = '<div class="empty-state"><p>Select a class to view students</p></div>';
                updateAttendanceSummary([], []);
            }
            
            showMessage('Data restored successfully', 'success');
        } catch (error) {
            console.error('Error restoring data:', error);
            showMessage(`Error restoring data: ${error.message || 'Invalid file format'}`, 'error');
        }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}


// Event Listeners
function initializeEventListeners() {
    console.log('Initializing event listeners...');
    
    // Tab navigation
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = e.target.getAttribute('data-tab');
            if (targetTab) {
                switchTab(targetTab);
            }
        });
    });
    
    // MODIFIED: Attendance date/class selectors and Load button
    const attendanceDateSelect = document.getElementById('attendanceDate');
    const attendanceClassSelect = document.getElementById('classSelect'); // This is already the attendance class selector in your HTML
    const loadAttendanceBtn = document.getElementById('loadAttendanceBtn');
    const lockDayBtn = document.getElementById('lockDayBtn'); // NEW: Lock Day Button

    if (attendanceDateSelect) {
        attendanceDateSelect.addEventListener('change', (e) => {
            selectedAttendanceDate = e.target.value;
            console.log('Attendance Date selected:', selectedAttendanceDate);
        });
    }
    
    if (attendanceClassSelect) {
        attendanceClassSelect.addEventListener('change', (e) => { // Using existing classSelect for attendance class
            selectedAttendanceClassId = e.target.value;
            console.log('Attendance Class selected:', selectedAttendanceClassId);
        });
    }

    if (loadAttendanceBtn) {
        loadAttendanceBtn.addEventListener('click', () => {
            if (selectedAttendanceDate && selectedAttendanceClassId) {
                renderStudentList(selectedAttendanceDate, selectedAttendanceClassId);
            } else {
                showMessage('Please select both a date and a class to load attendance.', 'error');
            }
        });
    }

    // NEW: Lock Day Button Listener
    if (lockDayBtn) {
        lockDayBtn.addEventListener('click', () => {
            if (!selectedAttendanceDate || !selectedAttendanceClassId) {
                showMessage('Please select a date and a class first.', 'error');
                return;
            }

            // Confirm with user before locking
            showConfirmDialog(`Are you sure you want to LOCK attendance for ${getNepaliDate(new Date(selectedAttendanceDate)).formatted} in class ${getClasses().find(c => c.id === selectedAttendanceClassId)?.name || 'Unknown Class'}? This action is irreversible!`, () => {
                lockAttendance(selectedAttendanceDate, selectedAttendanceClassId);
                // Re-render to show disabled checkboxes and locked button state
                renderStudentList(selectedAttendanceDate, selectedAttendanceClassId);
            });
        });
    }

    // Student search (remains the same)
    const studentSearch = document.getElementById('studentSearch');
    if (studentSearch) {
        studentSearch.addEventListener('input', (e) => {
            // MODIFIED: Pass selected date and class to search
            renderStudentList(selectedAttendanceDate, selectedAttendanceClassId, e.target.value);
        });
    }
    
    // Attendance marking and student profile clicks - use event delegation
    const studentList = document.getElementById('studentList');
    if (studentList) {
        studentList.addEventListener('change', (e) => {
            if (e.target.type === 'radio') {
                const studentId = e.target.name.replace('attendance_', '');
                const status = e.target.value;
                console.log('Attendance marked:', studentId, status);
                
                // MODIFIED: saveAttendance now returns a boolean indicating success (not locked)
                const saveSuccessful = saveAttendance(selectedAttendanceClassId, studentId, status, selectedAttendanceDate);
                
                if (saveSuccessful) {
                    // Update summary only if save was successful
                    const dailyClassAttendance = getAttendanceForDateAndClass(selectedAttendanceDate, selectedAttendanceClassId);
                    const classes = getClasses();
                    const selectedClass = classes.find(c => c.id === selectedAttendanceClassId);
                    if (selectedClass) {
                        updateAttendanceSummary(selectedClass.students, dailyClassAttendance);
                    }
                } else {
                    // If save was blocked, revert the checkbox state
                    // This is important to visually reflect the locked status
                    const currentStatus = getAttendanceForDateAndClass(selectedAttendanceDate, selectedAttendanceClassId)
                                          .find(r => r.studentId === studentId)?.status || '';
                    e.target.checked = (e.target.value === currentStatus); // Revert to old status
                }
            }
        });
        
        studentList.addEventListener('click', (e) => {
            if (e.target.classList.contains('student-name')) {
                e.preventDefault();
                const studentId = e.target.getAttribute('data-student-id');
                const classId = e.target.getAttribute('data-class-id');
                if (studentId && classId) {
                    showStudentModal(classId, studentId);
                }
            }
        });
    }
    
    // Modal controls (remain the same)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-close')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.add('hidden');
            }
        }
        
        // Click outside modal to close
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
        }
    });
    
    // Add student button (remains the same)
    const addStudentBtn = document.getElementById('addStudentBtn');
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', () => {
            showStudentModal();
        });
    }
    
    // Student form submission (remains the same)
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        studentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const studentData = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                parentName: formData.get('parentName'),
                parentPhone: formData.get('parentPhone'),
                address: formData.get('address'),
                dateOfBirth: formData.get('dateOfBirth')
            };
            
            const classId = formData.get('classId');
            
            if (!classId) {
                showMessage('Please select a class', 'error');
                return;
            }
            
            if (currentStudent && currentClass) {
                // Update existing student
                updateStudent(classId, currentStudent, studentData);
                showMessage('Student updated successfully', 'success');
            } else {
                // Add new student
                addStudent(classId, studentData);
                showMessage('Student added successfully', 'success');
            }
            
            hideModal('studentModal');
            populateClassSelectors();
            renderStudentsTab();
            
            // MODIFIED: Re-render attendance with current selected date/class if relevant
            if (selectedAttendanceDate && selectedAttendanceClassId) {
                renderStudentList(selectedAttendanceDate, selectedAttendanceClassId);
            }
            
            currentStudent = null;
            currentClass = '';
        });
    }
    
    // Add class button (remains the same)
    const addClassBtn = document.getElementById('addClassBtn');
    if (addClassBtn) {
        addClassBtn.addEventListener('click', () => {
            const titleEl = document.getElementById('classModalTitle');
            const nameEl = document.getElementById('className');
            
            if (titleEl) titleEl.textContent = 'Add Class';
            if (nameEl) nameEl.value = '';
            
            currentAction = 'add';
            currentClass = '';
            showModal('classModal');
        });
    }
    
    // Class form submission (remains the same)
    const classForm = document.getElementById('classForm');
    if (classForm) {
        classForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const className = document.getElementById('className').value.trim();
            
            if (!className) {
                showMessage('Please enter a class name', 'error');
                return;
            }
            
            if (currentAction === 'edit' && currentClass) {
                updateClass(currentClass, { name: className });
                showMessage('Class updated successfully', 'success');
            } else {
                addClass(className);
                showMessage('Class added successfully', 'success');
            }
            
            hideModal('classModal');
            populateClassSelectors();
            renderClassesTab();
            
            currentClass = '';
            currentAction = '';
        });
    }
    
    // Export and backup buttons (remain the same except for data structure)
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', exportToCSV);
    }
    
    const backupBtn = document.getElementById('backupBtn');
    if (backupBtn) {
        backupBtn.addEventListener('click', backupData);
    }
    
    const restoreBtn = document.getElementById('restoreBtn');
    const restoreFile = document.getElementById('restoreFile');
    if (restoreBtn && restoreFile) {
        restoreBtn.addEventListener('click', () => {
            restoreFile.click();
        });
        
        restoreFile.addEventListener('change', restoreData);
    }
    
    // Theme toggle (remains the same)
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Set default date range for export (remains the same)
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const startDateEl = document.getElementById('startDate');
    const endDateEl = document.getElementById('endDate');
    
    if (startDateEl) {
        startDateEl.value = firstDayOfMonth.toISOString().split('T')[0];
    }
    if (endDateEl) {
        endDateEl.value = today.toISOString().split('T')[0];
    }
    
    console.log('Event listeners initialized successfully');
}


// Initialize Application
function initializeApp() {
    console.log('Starting Student Attendance Tracker initialization...');
    
    try {
        // Initialize data first
        initializeData();
        
        // Initialize theme
        initializeTheme();
        
        // Update date display
        updateDateDisplay();
        
        // Populate dropdowns
        populateClassSelectors(); // This now also populates attendanceClass
        populateDateSelector(); // NEW: Populate date selector

        // Initialize event listeners
        initializeEventListeners();
        
        // Set up periodic date updates
        setInterval(updateDateDisplay, 60000);
        
        // Initial render of attendance tab - based on default selected values
        // MODIFIED: Initial render uses the newly set selectedAttendanceDate/ClassId
        if (selectedAttendanceDate && selectedAttendanceClassId) {
             renderStudentList(selectedAttendanceDate, selectedAttendanceClassId);
        } else {
             document.getElementById('studentList').innerHTML = '<div class="empty-state"><p>Select a class to view students</p></div>';
             updateAttendanceSummary([], []);
        }
        
        console.log('Student Attendance Tracker initialized successfully');
        
        // Add a small delay to ensure everything is ready
        setTimeout(() => {
            const classes = getClasses();
            console.log('Available classes after initialization:', classes);
        }, 100);
        
    } catch (error) {
        console.error('Error initializing app:', error);
        showMessage('Error initializing application', 'error');
    }
}


// Start the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
