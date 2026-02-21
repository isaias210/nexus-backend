const fs = require('fs');
const path = require('path');

const statePath = path.join(__dirname, 'state.json');
const logPath = path.join(__dirname, 'log.json');

function getState() {
  return JSON.parse(fs.readFileSync(statePath));
}

function updateState(newData) {
  const current = getState();
  const updated = { ...current, ...newData };
  fs.writeFileSync(statePath, JSON.stringify(updated, null, 2));
  return updated;
}

function addLog(entry) {
  const logs = JSON.parse(fs.readFileSync(logPath));
  logs.push({
    timestamp: new Date().toISOString(),
    ...entry
  });
  fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
}

module.exports = {
  getState,
  updateState,
  addLog
};
