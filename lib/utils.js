
// bank for which the mapper should work
const bank = "A";

// midi ids of buttons to out internal button ids
// (using different offsets for Bank A & B)
const offsetMidiButtonsBankA = 8; // midi starts with 8
const offsetMidiButtonsBankB = 32; // midi starts with 32
const midi2ButtonId = [
  0, 2, 4, 6, 8, 10, 12, 14,
  1, 3, 5, 7, 9, 11, 13, 15
];

// mapping internal button ids to the midi ids of the 
// corresponding Leds
const buttonId2midiLED = [
  0, 8,
  1, 9,
  2, 10,
  3, 11,
  4, 12,
  5, 13,
  6, 14,
  7, 15,
];

const offsetMidiEncoderBankA = 1;
const offsetMidiEncoderBankB = 11;

function midiNote2buttonId(note) {
  const offsetMidiButtons = bank === "A" ?
    offsetMidiButtonsBankA : offsetMidiButtonsBankB;

  const buttonId = midi2ButtonId[note - offsetMidiButtons];
  return buttonId;
}

function buttonId2midiNote(buttonId) {
  const midiNote = buttonId2midiLED[buttonId];
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

// return midi id for encoder values of a channel
function channelId2encoderValueController(channelId) {
  const offsetMidiEncoder = bank === "A" ?
    offsetMidiEncoderBankA : offsetMidiEncoderBankB;
  return channelId + offsetMidiEncoder;
}

function encoderModeController2channelId(controller) {
  const offsetMidiEncoder = bank === "A" ?
    offsetMidiEncoderBankA : offsetMidiEncoderBankB;
  return controller - offsetMidiEncoder;
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