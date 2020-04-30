var areGraphsDrawn = false;
var courseAverageChart;
var gradeDistributions;

// checks if the fields are empty, if so, throws an error, else, a
function validate() {
    const subject = document.getElementById("subject").value;
    const courseNo = document.getElementById("courseNo").value;
    const courseSection = document.getElementById("courseSection").value;
    let isWinter = "false";
    if (document.getElementById("isWinter").checked) {
        isWinter = "true";
    }
    if (subject.trim() == "" || courseNo.trim() == "" || courseSection.trim() == "")  {
        alert("Please fill all of the fields!");
    } else {
        const analyzeBtn = document.getElementById("analyzeBtn");
        analyzeBtn.innerText = "Loading...";
        analyze(subject, courseNo, courseSection, isWinter);
    }

}
// displays the data from the api, and creates the charts
async function analyze(subject, courseNo, courseSection, isWinter) {
    const courseData = await getData(subject, courseNo, courseSection, isWinter);
    analyzeBtn.innerText = "Analyze!";
    if (courseData == false) {
        return;
    }
    if (areGraphsDrawn) {
        courseAverageChart.destroy();
        gradeDistributions.destroy();
    }
    areGraphsDrawn = true;
    document.getElementById("details").textContent = subject + " " + courseNo + " " + courseSection + " by " + courseData.profName;
    document.getElementById("average").textContent = "Average: " + courseData.average + "%";
    const averagesCtx = document.getElementById('avgGraph').getContext('2d');
    const gradeData = courseData.averageData
    courseAverageChart = new Chart(averagesCtx, {
      type: 'line',
      data: {
            labels: Array.from(Array(gradeData.length).keys()),
            datasets: [{
                label: 'nth Section Since 2014',
                data: gradeData,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.2)',
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                ],
                borderWidth: 1
            }]
        },
      options: {
        responsive: false,
        title: {
            display: true,
            text: 'Class Average Over the Years'
        }
      }
      });
    const gradeDistCtx = document.getElementById('gradeDist').getContext('2d');
    const distributions = courseData.gradeDistribution
    const totalStudents = distributions.reduce((a,b) => a + b, 0);
    const passRate = Math.round(100 - ((distributions[0] / totalStudents) * 100));
    document.getElementById("pass-rate").textContent = "Pass Rate: " + passRate + "%";

    gradeDistributions = new Chart(gradeDistCtx, {
        type: 'bar',
        data: {
            labels: ['<50%', '50-54%', '55-59%', '60-63%', '64-67%', '68-71%', '72-75%', '76-79%', '80-84%', '85-89%','90-100%'],
            datasets: [{
                label: 'Number of Students',
                data: distributions,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(75, 192, 192, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            title: {
                display: true,
                text: 'Grade Distribution for Five Years'
            }
        }
    });
}

// gets the course data from the api, fetches the data and returns it
async function getData(id, no, section, isWinter) {
    const api_url = "https://ubc-course-analyzer.herokuapp.com/analyze?courseID="+id+"&courseNumber="+no+"&courseSection="+section+"&isWinter="+isWinter;
    const response = await fetch(api_url);
    const courseData = await response.json();
    if (response.status == 404) {
        alert(courseData.message);
        return false;
    }
    const averageData = courseData.courseAveragesForYears;
    const gradeDistribution = courseData.gradeDistribution;
    const average = courseData.courseFiveYearAverage;
    const profName = courseData.profName;
    return {averageData, gradeDistribution,average, profName};
}