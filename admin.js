            document.addEventListener('DOMContentLoaded', function() {
            const adminLoginForm = document.getElementById('adminLoginForm');
            const loginSection = document.getElementById('loginSection');
            const adminPanel = document.getElementById('adminPanel');
            const saveStudentBtn = document.getElementById('saveStudent');
            const studentsTableBody = document.getElementById('studentsTableBody');
            const attendanceTableBody = document.getElementById('attendanceTableBody');
            const excelFileInput = document.getElementById('excelFile');
            const importExcelBtn = document.getElementById('importExcel');
            const importTypeSelect = document.getElementById('importType');
            const dailyVerificationsElement = document.getElementById('dailyVerifications');

            // Admin password
            const ADMIN_PASSWORD = 'KANDARA_1990TVC';

            // Excel operation buttons
            document.getElementById('exportStudents').addEventListener('click', exportStudents);
            document.getElementById('importStudents').addEventListener('click', () => {
                importTypeSelect.value = 'students';
                new bootstrap.Modal(document.getElementById('excelImportModal')).show();
            });
            document.getElementById('exportAttendance').addEventListener('click', exportAttendance);
            document.getElementById('importAttendance').addEventListener('click', () => {
                importTypeSelect.value = 'attendance';
                new bootstrap.Modal(document.getElementById('excelImportModal')).show();
            });

            // Check if already logged in
            if (localStorage.getItem('adminLoggedIn') === 'true') {
                showAdminPanel();
            }

            adminLoginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const password = document.getElementById('adminPassword').value;
                
                if (password === ADMIN_PASSWORD) {
                    localStorage.setItem('adminLoggedIn', 'true');
                    showAdminPanel();
                } else {
                    alert('Invalid password!');
                }
            });

            function showAdminPanel() {
                loginSection.classList.add('d-none');
                adminPanel.classList.remove('d-none');
                loadStudents();
            }

            saveStudentBtn.addEventListener('click', function() {
                const name = document.getElementById('studentName').value;
                const admissionNumber = document.getElementById('newAdmissionNumber').value;
                const course = document.getElementById('newCourse').value;
                const feeAmount = parseFloat(document.getElementById('feeAmount').value);
                const validUntil = document.getElementById('validUntil').value;

                if (!name || !admissionNumber || !course || !feeAmount || !validUntil) {
                    alert('Please fill in all fields');
                    return;
                }

                const students = JSON.parse(localStorage.getItem('students')) || [];
                
                // Check if student already exists
                const existingStudent = students.find(s => s.admissionNumber === admissionNumber);
                if (existingStudent) {
                    alert('Student with this admission number already exists');
                    return;
                }

                // Add new student
                students.push({
                    name,
                    admissionNumber,
                    course,
                    feeAmount,
                    validUntil
                });

                localStorage.setItem('students', JSON.stringify(students));
                loadStudents();
                
                // Close modal and reset form
                bootstrap.Modal.getInstance(document.getElementById('addStudentModal')).hide();
                document.getElementById('addStudentForm').reset();
            });

            function loadStudents() {
                const students = JSON.parse(localStorage.getItem('students')) || [];
                studentsTableBody.innerHTML = '';

                students.forEach(student => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${student.name}</td>
                        <td>${student.admissionNumber}</td>
                        <td>${student.course}</td>
                        <td>${student.feeAmount}</td>
                        <td>${student.validUntil}</td>
                        <td>
                            <button class="btn btn-danger btn-sm" onclick="deleteStudent('${student.admissionNumber}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    studentsTableBody.appendChild(row);
                });
            }

            function loadAttendance() {
                const attendance = JSON.parse(localStorage.getItem('attendance')) || [];
                attendanceTableBody.innerHTML = '';

                attendance.forEach(record => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${record.date}</td>
                        <td>${record.time}</td>
                        <td>${record.name}</td>
                        <td>${record.admissionNumber}</td>
                        <td>${record.course}</td>
                        <td>${record.status}</td>
                    `;
                    attendanceTableBody.appendChild(row);
                });
            }

            // Excel Export Functions
            function exportStudents() {
                const students = JSON.parse(localStorage.getItem('students')) || [];
                const ws = XLSX.utils.json_to_sheet(students.map(student => ({
                    'Name': student.name,
                    'Admission Number': student.admissionNumber,
                    'Course': student.course,
                    'Fee Amount': student.feeAmount,
                    'Valid Until': student.validUntil
                })));
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Students");
                XLSX.writeFile(wb, "students.xlsx");
            }

            function exportAttendance() {
                const attendance = JSON.parse(localStorage.getItem('attendance')) || [];
                const ws = XLSX.utils.json_to_sheet(attendance.map(record => ({
                    'Date': record.date,
                    'Time': record.time,
                    'Name': record.name,
                    'Admission Number': record.admissionNumber,
                    'Course': record.course,
                    'Status': record.status
                })));
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Attendance");
                XLSX.writeFile(wb, "attendance.xlsx");
            }

            // Excel Import Function
            importExcelBtn.addEventListener('click', function() {
                const file = excelFileInput.files[0];
                const importType = importTypeSelect.value;

                if (!file) {
                    alert('Please select a file');
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                    if (importType === 'students') {
                        const students = jsonData.map(row => ({
                            name: row['Name'],
                            admissionNumber: row['Admission Number'],
                            course: row['Course'],
                            feeAmount: row['Fee Amount'],
                            validUntil: row['Valid Until']
                        }));
                        localStorage.setItem('students', JSON.stringify(students));
                        loadStudents();
                    } else if (importType === 'attendance') {
                        const attendance = jsonData.map(row => ({
                            date: row['Date'],
                            time: row['Time'],
                            name: row['Name'],
                            admissionNumber: row['Admission Number'],
                            course: row['Course'],
                            status: row['Status']
                        }));
                        localStorage.setItem('attendance', JSON.stringify(attendance));
                        loadAttendance();
                    }

                    bootstrap.Modal.getInstance(document.getElementById('excelImportModal')).hide();
                    alert('Data imported successfully!');
                };
                reader.readAsArrayBuffer(file);
            });

            // Make deleteStudent function available globally
            window.deleteStudent = function(admissionNumber) {
                if (confirm('Are you sure you want to delete this student?')) {
                    const students = JSON.parse(localStorage.getItem('students')) || [];
                    const updatedStudents = students.filter(s => s.admissionNumber !== admissionNumber);
                    localStorage.setItem('students', JSON.stringify(updatedStudents));
                    loadStudents();
                }
            };

            // Load attendance when attendance modal is shown
            document.getElementById('viewAttendanceModal').addEventListener('show.bs.modal', function() {
                loadAttendance();
            });

            // Function to update daily verification count
            function updateDailyVerifications() {
                const attendance = JSON.parse(localStorage.getItem('attendance')) || [];
                const today = new Date().toLocaleDateString();
                
                // Filter today's verifications
                const todayVerifications = attendance.filter(record => record.date === today);
                
                // Update the counter
                dailyVerificationsElement.textContent = todayVerifications.length;

                // Check if it's 5:00 PM and reset if needed
                const now = new Date();
                if (now.getHours() === 17 && now.getMinutes() === 0) {
                    // Reset counter for the next day
                    setTimeout(updateDailyVerifications, 60000); // Check again in 1 minute
                }
            }

            // Update counter every minute
            setInterval(updateDailyVerifications, 60000);
            
            // Initial update
            updateDailyVerifications();
            
            // Reset Attendance at Midnight
            setInterval(() => {
                const now = new Date();
                if (now.getHours() === 0 && now.getMinutes() === 0) {
                    localStorage.setItem('attendance', JSON.stringify([]));
                    loadAttendance();
                }
            }, 60000);

            // Initial Load
            loadStudents();
            loadAttendance();
        });
    </script>
</body>
</html>