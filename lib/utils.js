// input nodes of buttons are 8..23
// convert to button ids 0..15
const midi2ButtonId = [
  -1, -1, -1, -1, -1, -1, -1, -1,
  0, 2, 4, 6, 8, 10, 12, 14,
  1, 3, 5, 7, 9, 11, 13, 15
];

const buttonId2midi = [
  0, 8,
  1, 9,
  2, 10,
  3, 11,
  4, 12,
  5, 13,
  6, 14,
  7, 15,
];

function midiNote2buttonId(note) {
  const buttonId = midi2ButtonId[note];
  return buttonId;
}

function buttonId2midiNote(buttonId) {
  const midiNote = buttonId2midi[buttonId];
  return midiNote;
}

function buttonId2channelId(buttonId) {
  const channelId = buttonId >> 1;
  return channelId;
}

function getParameterId(channelId, buttonState, numChannels) {
  // console.log(`button states: ${buttonState[channelId * 2]} ${buttonState[channelId * 2 + 1]}`)
  const currentRegister = buttonState[channelId * 2] * 1
    + buttonState[channelId * 2 + 1] * 2;
  // console.log(`register: ${currentRegister}`)
  const parameterId = channelId + (currentRegister * numChannels);
  return parameterId;
}

function parameterId2ChannelId(parameterId) {
  return parameterId % 4;
}

function channelId2encoderModeController(channelId) {
  return channelId + 1;
}

function channelId2encoderValueController(channelId) {
  return channelId + 1;
}

function encoderModeController2channelId(controller) {
  return controller - 1;
}

function bit_test(num, bit) {
  return ((num >> bit) % 2 != 0)
}

function bit_set(num, bit) {
  return num | 1 << bit;
}

function bit_clear(num, bit) {
  return num & ~(1 << bit);
}

function bit_toggle(num, bit) {
  return bit_test(num, bit) ? bit_clear(num, bit) : bit_set(num, bit);
}

module.exports = {
  midiNote2buttonId,
  buttonId2midiNote,
  buttonId2channelId,
  getParameterId,
  parameterId2ChannelId,
  channelId2encoderModeController,
  channelId2encoderValueController,
  encoderModeController2channelId,
  bit_toggle
}