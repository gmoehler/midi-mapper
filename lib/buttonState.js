// binary button states

const buttonState = [];

function buttonId2Index(buttonId) {
  return JSON.stringify(buttonId);
}

function setButtonState(buttonId, val, updateFunction) {
  const idx = buttonId2Index(buttonId);
  if (buttonState[idx] !== val) {
    buttonState[idx] = val;
    updateFunction(buttonId, val);
  }
}

function toggleButtonState(buttonId, updateFunction) {
  setButtonState(buttonId,
    !getButtonState(buttonId),
    updateFunction);
}

function getButtonState(buttonId) {
  const idx = buttonId2Index(buttonId);
  return buttonState[idx] || false;
}

module.exports = {
  getButtonState,
  toggleButtonState,
}