// binary states (on/off) for each button

const { toButtonId, toParameterId } = require("./conversions");

const buttonState = [];

function buttonId2Index(buttonId) {
  return JSON.stringify(buttonId);
}

function setButtonState(buttonId, newStateValue, updateFunctions) {
  const idx = buttonId2Index(buttonId);
  if (buttonState[idx] !== newStateValue) {
    buttonState[idx] = newStateValue;
    updateFunctions.forEach((func) =>
      func(buttonId, newStateValue))
  }
}

function toggleButtonState(buttonId, updateFunctions) {
  setButtonState(buttonId,
    !getButtonState(buttonId),
    updateFunctions);
}

function clearButtonState(buttonId, updateFunctions) {
  setButtonState(buttonId, false, updateFunctions);
}

function getButtonState(buttonId) {
  const idx = buttonId2Index(buttonId);
  return buttonState[idx] || false;
}

// returns the parameter id for a strip
// based on the pressed buttons
// TODO: use channelId as parameter?
function getSelectedParameterId(layer, strip) {
  const button0 = toButtonId(layer, 1, strip);
  const button1 = toButtonId(layer, 2, strip);

  const state0 = getButtonState(button0) ? 1 : 0;
  const state1 = getButtonState(button1) ? 1 : 0;

  // which register was choosed by button state
  const register = (state1 << 1) + state0;
  return toParameterId(layer, strip, register);
}

module.exports = {
  getButtonState,
  toggleButtonState,
  clearButtonState,
  getSelectedParameterId,
}