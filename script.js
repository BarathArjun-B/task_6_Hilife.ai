const timerDisplay = document.querySelector('#timerDisplay');
const timerStatus = document.querySelector('#timerStatus');
const totalTimeDisplay = document.querySelector('#totalTime');
const startButton = document.querySelector('#startButton');
const pauseButton = document.querySelector('#pauseButton');
const resumeButton = document.querySelector('#resumeButton');
const resetButton = document.querySelector('#resetButton');

let intervalId = null;
let startTime = null; // timestamp when timer started or resumed
let elapsedSaved = 0; // elapsed milliseconds when paused or before start
let timerState = 'stopped'; // 'running', 'paused', 'stopped'

const STORAGE_KEYS = {
  state: 'studyTimerState',
  startTime: 'studyTimerStartTime',
  elapsedSaved: 'studyTimerElapsedSaved'
};

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours} : ${minutes} : ${seconds}`;
}

function saveTimerData() {
  localStorage.setItem(STORAGE_KEYS.state, timerState);
  localStorage.setItem(STORAGE_KEYS.startTime, startTime ? String(startTime) : '');
  localStorage.setItem(STORAGE_KEYS.elapsedSaved, String(elapsedSaved));
}

function loadTimerData() {
  const storedState = localStorage.getItem(STORAGE_KEYS.state);
  const storedStartTime = localStorage.getItem(STORAGE_KEYS.startTime);
  const storedElapsed = localStorage.getItem(STORAGE_KEYS.elapsedSaved);

  timerState = storedState || 'stopped';
  startTime = storedStartTime ? Number(storedStartTime) : null;
  elapsedSaved = storedElapsed ? Number(storedElapsed) : 0;
}

function getElapsedTime() {
  if (timerState === 'running' && startTime) {
    return Date.now() - startTime;
  }
  return elapsedSaved;
}

function updateDisplays() {
  const elapsed = getElapsedTime();
  timerDisplay.textContent = formatTime(elapsed);
  totalTimeDisplay.textContent = formatTime(elapsed);
  timerStatus.textContent = timerState === 'running' ? 'Studying' : 'Paused';
}

function updateButtons() {
  const isRunning = timerState === 'running';
  const isPaused = timerState === 'paused';

  startButton.disabled = isRunning;
  pauseButton.disabled = !isRunning;
  resumeButton.disabled = !isPaused;
}

function startTimer() {
  if (intervalId) {
    clearInterval(intervalId);
  }

  if (timerState === 'paused' && elapsedSaved > 0) {
    startTime = Date.now() - elapsedSaved;
  } else {
    startTime = Date.now();
    elapsedSaved = 0;
  }

  timerState = 'running';
  saveTimerData();
  updateButtons();
  updateDisplays();

  intervalId = setInterval(() => {
    updateDisplays();
  }, 250);
}

function pauseTimer() {
  if (timerState !== 'running') {
    return;
  }

  elapsedSaved = Date.now() - startTime;
  timerState = 'paused';
  startTime = null;
  saveTimerData();
  updateButtons();
  updateDisplays();

  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function resumeTimer() {
  if (timerState !== 'paused') {
    return;
  }

  startTimer();
}

function resetTimer() {
  timerState = 'stopped';
  startTime = null;
  elapsedSaved = 0;
  saveTimerData();
  updateButtons();
  updateDisplays();

  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resumeButton.addEventListener('click', resumeTimer);
resetButton.addEventListener('click', resetTimer);

function initializeTimer() {
  loadTimerData();

  if (timerState === 'running' && startTime) {
    // if the timer was running before reload, keep the elapsed time accurate
    if (intervalId) {
      clearInterval(intervalId);
    }
    intervalId = setInterval(() => {
      updateDisplays();
    }, 250);
  }

  updateButtons();
  updateDisplays();
}

initializeTimer();
