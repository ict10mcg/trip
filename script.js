const { jsPDF } = window.jspdf;


const teachers = {
  "Bus 01": { name: "Mrs. Amali Udayangi, Mrs. U.G.R. Dilrukshi, Mr. M.A.S.C. Munasinghe" },
  "Bus 02": { name: "Mr. Harshana Nallaperuma, Mr. N.G. Greshan, Mrs. N. Preethi Kumari" },
  "Bus 03": { name: "Mr. U. Godagama, Mrs. Thushari Wewalwala" },
  "Bus 04": { name: "Mr. Amila Chathurika, Mrs. Bimba Lamahewa, Mrs. S.T. Indrani" }
};

const teacherPhotos = {
    "11A": "https://i.ibb.co/t3CJSq0/10A.jpg",
    "11B": "https://i.ibb.co/L8LKZs3/10B.jpg",
    "11C": "https://i.ibb.co/1mkrZtL/10C.jpg",
    "11D": "https://i.ibb.co/NrFccJ8/10D.png",
    "11E": "https://i.ibb.co/7pQF1fK/10E.png",
    "11F": "https://i.ibb.co/TWLNS/10F.jpg"
};

const classTeachers = {
  "11A": { name: "Mrs. N. Preethi Kumari", phone: "071 225 9163", photoUrl: "https://i.ibb.co/t3CJSq0/10A.jpg" },
  "11B": { name: "Mrs. S.T. Indrani", phone: "077 603 6947", photoUrl: "https://i.ibb.co/L8LKZs3/10B.jpg" },
  "11C": { name: "Mrs. Bimba Lamahewa", phone: "077 198 6515", photoUrl: "https://i.ibb.co/1mkrZtL/10C.jpg" },
  "11D": { name: "Mrs. Amali Udayangi", phone: "077 558 3733", photoUrl: "https://i.ibb.co/NrFccJ8/10D.png" },
  "11E": { name: "Mr. Uditha Godagama", phone: "077 722 9242", photoUrl: "https://i.ibb.co/7pQF1fK/10E.png" },
  "11F": { name: "Mrs. U.G.R. Dilrukshi", phone: "077 358 5", photoUrl: "https://i.ibb.c/TWLNS/10F.jpg" },
};

const classSelect = document.getElementById('class-select');
const attendanceTable = document.getElementById('attendance-table').getElementsByTagName('tbody')[0];
const currentDateElement = document.getElementById('current-date-time');
const teacherNameElement = document.getElementById('teacher-name');
const absentReportButton = document.getElementById('get-report');
const classSelection = document.getElementById('classSelection');
const generateSummaryButton = document.getElementById('generate-summary');
const addMarksButton = document.getElementById('add-marks');
const subjectContainer = document.getElementById('subject-container');
const subjectSelect = document.getElementById('subject-select');
const marksColumn = document.getElementById('marks-column');
const summaryElement = document.getElementById('summary');
const summaryBelowElement = document.getElementById('summary-below');
let addingMarks = false;

function updateDateTime() {
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    const formattedTime = now.toLocaleTimeString();
    currentDateElement.innerText = `Date: ${formattedDate} Time: ${formattedTime}`;
}
setInterval(updateDateTime, 1000);

function getGrade(score) {
  if (score >= 75) return 'A';
  if (score >= 65) return 'B';
  if (score >= 55) return 'C';
  if (score >= 35) return 'S';
  return 'W';
}

function updateSummary() {
  const selectedClass = classSelect.value;
  const totalStudents = students[selectedClass].length;
  let presentCount = 0;
  students[selectedClass].forEach(student => {
    if (localStorage.getItem(`${selectedClass}-${student.register}`)) {
      presentCount++;
    }
  });
  const absentCount = totalStudents - presentCount;
  const summaryText = `Total Students: ${totalStudents} | Present: ${presentCount} | Absent: ${absentCount}`;
  summaryElement.textContent = summaryText;
  summaryBelowElement.textContent = summaryText;
  teacherNameElement.textContent = `Class Teacher: ${teachers[selectedClass].name}`;
  const teacherPhoto = document.getElementById("teacher-photo");
  teacherPhoto.src = teacherPhotos[selectedClass];
  teacherPhoto.style.display = "block";
}

function loadStudents() {
  const selectedClass = classSelect.value;
  const teacher = teachers[selectedClass];
  if (teacher) {
    teacherNameElement.innerHTML = ''; // Clear existing content
    const names = teacher.name.split(',');
    names.forEach((name, index) => {
      teacherNameElement.appendChild(document.createTextNode(name.trim()));
      if (index < names.length - 1) {
        teacherNameElement.appendChild(document.createElement('br'));
      }
    });
  }
  attendanceTable.innerHTML = '';
  students[selectedClass].forEach(student => {
    const row = attendanceTable.insertRow();
    const markCell = row.insertCell(0);
    const registerCell = row.insertCell(1);
    const nameCell = row.insertCell(2);
    const timeCell = row.insertCell(3);
    const marksCell = row.insertCell(4);
    const checkbox = document.createElement('div');
    checkbox.className = 'custom-checkbox';
    const isChecked = localStorage.getItem(`${selectedClass}-${student.register}`);
    if (isChecked) {
      checkbox.classList.add('checked');
      timeCell.textContent = isChecked;
    }
    checkbox.addEventListener('click', function () {
      checkbox.classList.toggle('checked');
      const isChecked = checkbox.classList.contains('checked');
      if (isChecked) {
        const time = new Date().toLocaleTimeString();
        timeCell.textContent = time;
        localStorage.setItem(`${selectedClass}-${student.register}`, time);
      } else {
        timeCell.textContent = '';
        localStorage.removeItem(`${selectedClass}-${student.register}`);
      }
      updateSummary();
    });
    markCell.appendChild(checkbox);
    registerCell.textContent = student.register;
    nameCell.textContent = student.name;
    const marksInput = document.createElement('input');
    marksInput.type = 'number';
    marksInput.style.display = 'none';
    marksInput.dataset.register = student.register;
    marksInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        const nextInput = marksInput.parentElement.parentElement.nextElementSibling?.querySelector('input[type="number"]');
        if (nextInput) {
          nextInput.focus();
        }
      }
    });
    marksCell.appendChild(marksInput);
  });
  updateSummary();
}

document.getElementById('clear-data').addEventListener('click', () => {
  const selectedClass = classSelect.value;
  students[selectedClass].forEach(student => {
    localStorage.removeItem(`${selectedClass}-${student.register}`);
  });
  loadStudents();
});

document.getElementById('get-report').addEventListener('click', () => {
  const selectedClass = classSelect.value;
  const teacher = teachers[selectedClass];
  const doc = new jsPDF();

  const generateReportContent = () => {
    doc.setFontSize(18);
    doc.text(`Attendance Report -  ${selectedClass}`, 105, 15, null, null, 'center');
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 25);
    if (teacher) {
      const teacherNames = teacher.name.split(', ');
      doc.text(teacherNames, 195.5, 25, { align: 'right' });
    }

    const tableData = [];
    const studentList = students[selectedClass];
    if (!studentList) {
      console.error(`No students found for class ${selectedClass}`);
      return;
    }
    const totalStudents = studentList.length;
    let presentCount = 0;

    studentList.forEach(student => {
      const isPresent = localStorage.getItem(`${selectedClass}-${student.register}`);
      const status = isPresent ? 'Present' : 'Absent';
      if (isPresent) {
        presentCount++;
      }
      tableData.push([student.register, student.name, status]);
    });

    const absentCount = totalStudents - presentCount;
    doc.text(`Total Students: ${totalStudents}   Present: ${presentCount}   Absent: ${absentCount}`, 15, 35);

    doc.autoTable({
      head: [['Register Number', 'Name', 'Status']],
      body: tableData,
      startY: 44,
      theme: 'grid',
      margin: { top: 30 },
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [255, 230, 66],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      didParseCell: function (data) {
        if (data.section === 'body') {
          const status = data.row.raw[2];
          if (status === 'Present') {
            data.cell.styles.fillColor = [204, 255, 204];
          } else if (status === 'Absent') {
            data.cell.styles.fillColor = [255, 204, 204];
          }
        }
      },
      didDrawPage: (data) => {
        doc.setFontSize(10);
        doc.text(`Page ${data.pageCount}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 10);
      }
    });
  }; 

  const savePdf = () => {
    doc.save(`Attendance_Report_${selectedClass}_${new Date().toLocaleDateString()}.pdf`);
  }

  if (teacher && teacher.photoUrl) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = teacher.photoUrl;
    img.onload = () => {
      doc.addImage(img, 'JPEG', 160, 4, 28, 31);
      generateReportContent();
      savePdf();
    };
    img.onerror = () => {
      console.error("Failed to load teacher image.");
      generateReportContent();
      savePdf();
    };
  } else {
    generateReportContent();
    savePdf();
  }
});

addMarksButton.addEventListener('click', () => {
  if (!addingMarks) {
    addingMarks = true;
    addMarksButton.textContent = 'Get Marks';
    marksColumn.style.display = 'table-cell';
    subjectContainer.style.display = 'block';
    document.querySelectorAll('input[type="number"]').forEach(input => {
      input.style.display = 'block';
    });
  } else {
    addingMarks = false;
    const selectedClass = classSelect.value;
    const doc = new jsPDF();
    doc.setFontSize(12);
    const selectedSubject = subjectSelect.value;
    doc.text(`Marks Report for ${selectedSubject} - Class ${selectedClass}`, 10, 10);
    const teacher = teachers[selectedClass];
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, 20);
    doc.text(`Teacher: ${teacher.name}`, 200, 20, null, null, 'right');
    let tableData = [];
    let totalStudents = students[selectedClass].length;
    let presentCount = 0;
    students[selectedClass].forEach(student => {
      const isPresent = localStorage.getItem(`${selectedClass}-${student.register}`);
      const status = isPresent ? isPresent : 'Absent';
      const marksInput = document.querySelector(`input[data-register="${student.register}"]`);
      const marks = marksInput.value || 'N/A';
      const grade = getGrade(parseInt(marks, 10));
      tableData.push([student.register, student.name, status, marks, grade]);
      if (isPresent) {
        presentCount++;
      }
    });
    const absentCount = totalStudents - presentCount;
    doc.text(`Total Students: ${totalStudents} Present: ${presentCount} Absent: ${absentCount}`, 10, 30);
    doc.autoTable({
      head: [['Register Number', 'Name', 'Attendance Status', 'Marks', 'Grade']],
      body: tableData,
      startY: 35,
      theme: 'grid',
      margin: { top: 30 },
      didDrawPage: (data) => {
        doc.setFontSize(10);
        doc.text(`Page ${data.pageCount}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 10);
      }
    });
    doc.save(`Marks_${selectedClass}_${new Date().toLocaleDateString()}.pdf`);
    addMarksButton.textContent = 'Add Marks';
    marksColumn.style.display = 'none';
    subjectContainer.style.display = 'none';
    document.querySelectorAll('input[type="number"]').forEach(input => {
      input.style.display = 'none';
    });
  }
});

classSelect.addEventListener('change', () => {
  loadStudents();
});

loadStudents();

summaryReportButton.addEventListener('click', () => {
    classSelection.style.display = 'block';
});

generateSummaryButton.addEventListener('click', () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Grade 11 Summary Report', 10, 10);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, 20);
    doc.text('Section Head - Mr. K.H. Nallaperuma', 10, 30);

    const classTeachers = {
        "11A": { name: "Mrs. N. Preethi Kumari" },
        "11B": { name: "Mrs. S.T. Indrani" },
        "11C": { name: "Mrs. Bimba Lamahewa" },
        "11D": { name: "Mrs. Amali Udayangi" },
        "11E": { name: "Mr. Uditha Godagama" },
        "11F": { name: "Mr. Yasas Darshana" }
    };

    let summaryData = [];
    let overallTotal = 0;
    let overallPresent = 0;
    let overallAbsent = 0;

    document.querySelectorAll('#classSelection input[type="checkbox"]:checked').forEach(checkbox => {
        const className = checkbox.value;
        const classTeacher = classTeachers[className]?.name || "Unknown";
        const classStudents = students[className] || [];
        const totalStudents = classStudents.length;
        let presentCount = 0;

        classStudents.forEach(student => {
            if (localStorage.getItem(`${className}-${student.register}`)) {
                presentCount++;
            }
        });

        const absentCount = totalStudents - presentCount;
        summaryData.push([className, classTeacher, totalStudents, presentCount, absentCount]);

        overallTotal += totalStudents;
        overallPresent += presentCount;
        overallAbsent += absentCount;
    });

    doc.autoTable({
        head: [['Class', 'Class Teacher', 'Total Students', 'Present', 'Absent']],
        body: summaryData,
        startY: 40,
        styles: { fillColor: [221, 235, 247], textColor: [0, 0, 0] },
        headStyles: { fillColor: [36, 180, 171], textColor: [255, 255, 255] },
    });

    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 10,
        body: [
            [{ content: 'Overall Summary', styles: { fontStyle: 'bold', textDecoration: 'underline' } }],
            [`Total Students: ${overallTotal}`],
            [`Total Present: ${overallPresent}`],
            [`Total Absent: ${overallAbsent}`]
        ],
        theme: 'plain',
        styles: {
            fillColor: [253, 226, 191],
            textColor: [0, 0, 0],
            fontSize: 12,
            fontStyle: 'bold',
            halign: 'center'
        },
        tableLineColor: [0, 0, 0],
        tableLineWidth: 0.5
    });

    doc.save(`Grade_11_Summary_Report_${new Date().toLocaleDateString()}.pdf`);

    classSelection.style.display = 'none';
});

classSelect.addEventListener('change', loadStudents);
loadStudents();
