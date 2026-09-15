/* ===== START-REACT.JS ===== */
const { spawn } = require('child_process');

const react = spawn('npx', ['react-scripts', 'start'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

react.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (line.includes('Starting the development server')) {
      console.log(`${line}`);
    }
  });
});

react.stderr.on('data', (data) => {
  
});