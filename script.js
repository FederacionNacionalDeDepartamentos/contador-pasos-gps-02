let stepCount = 0;
let lastAcc = 0;
let lastRot = 0;
let lastStepTime = 0;
let isCounting = false;

const accThreshold = 4;
const rotThreshold = 0.2;
const minStepInterval = 300; // ms

const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
let stepHistory = JSON.parse(localStorage.getItem('stepHistory')) || {};

// Cargar pasos del día
if (stepHistory[today]) {
  stepCount = stepHistory[today];
}
updateStepDisplay();
drawChart();

// Iniciar sensores
function startCounting() {
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission().then(response => {
      if (response === 'granted') {
        isCounting = true;
        window.addEventListener('devicemotion', handleMotion);
      } else {
        alert('Permiso denegado.');
      }
    }).catch(console.error);
  } else {
    isCounting = true;
    window.addEventListener('devicemotion', handleMotion);
  }
}

function handleMotion(event) {
  if (!isCounting) return;

  const acc = event.acceleration;
  const rot = event.rotationRate;
  if (!acc || !rot) return;

  const totalAcc = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
  const totalRot = Math.sqrt((rot.alpha || 0) ** 2 + (rot.beta || 0) ** 2 + (rot.gamma || 0) ** 2);
  const now = Date.now();

  if (
    Math.abs(totalAcc - lastAcc) > accThreshold &&
    Math.abs(totalRot - lastRot) > rotThreshold &&
    (now - lastStepTime) > minStepInterval
  ) {
    stepCount++;
    lastStepTime = now;
    stepHistory[today] = stepCount;
    localStorage.setItem('stepHistory', JSON.stringify(stepHistory));
    updateStepDisplay();
    drawChart();
  }

  lastAcc = totalAcc;
  lastRot = totalRot;
}

function updateStepDisplay() {
  document.getElementById('steps').textContent = `Pasos hoy: ${stepCount}`;
}

function resetSteps() {
  stepCount = 0;
  stepHistory[today] = 0;
  localStorage.setItem('stepHistory', JSON.stringify(stepHistory));
  updateStepDisplay();
  drawChart();
}

function drawChart() {
  const ctx = document.getElementById('stepChart').getContext('2d');
  const labels = [];
  const data = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split('T')[0];
    labels.push(key.slice(5)); // MM-DD
    data.push(stepHistory[key] || 0);
  }

  if (window.myChart) {
    window.myChart.destroy(); // actualiza si ya existe
  }

  window.myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Pasos',
        data,
        backgroundColor: 'rgba(0, 123, 255, 0.6)'
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 10 }
        }
      }
    }
  });
}



