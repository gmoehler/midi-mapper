const easymidi = require('easymidi');

const XTOUCH_INPUT = 'X-TOUCH MINI 0';
const xtouch_in = new easymidi.Input(XTOUCH_INPUT);
const XTOUCH_OUTPUT = 'X-TOUCH MINI 1';
const xtouch_out = new easymidi.Output(XTOUCH_OUTPUT);

const numChannels = 8;
const numRows = 2;
const ccChannel = 10;
const globalChannel = 0;

// init channel registers to 0
const channelRegister = [];
for (let index = 0; index < numChannels; index++) {
  channelRegister[index] = 0;
}

// reset button lights
const buttonState = [];
for (let index = 0; index < numRows * numChannels; index++) {
  buttonState[index] = false;
  setButtonLight(index, false);
}

// clear parameter numChannels * 2^numRows values
const parameterValue = [];
for (let index = 0; index < numRows * numRows * numChannels; index++) {
  parameterValue[index] = 0;
}
for (let index = 0; index < numChannels; index++) {
  setRotaryMode(index, 0); // single mode
  setRotaryValue(index, 0); // reset rotary value to 0
}

// input ids of buttons are 0..15
const inputId2ButtonId = [
  0, 1, 2, 3, 4, 5, 6, 7,
  0, 1, 2, 3, 4, 5, 6, 7,
  8, 9, 10, 11, 12, 13, 14, 15
];

function toggleButtonState(id) {
  buttonState[id] = !buttonState[id];
  setButtonLight(id, buttonState[id]);
}

function setButtonLight(id, isButtonSet) {
  const command = {
    note: id,
    velocity: isButtonSet ? 1 : 0,
    globalChannel,
  }
  console.log('noteon', command);
  xtouch_out.send('noteon', command);
}

function setRotaryMode(id, mode) {
  const command = {
    controller: id + 1,
    value: mode,
    channel: globalChannel,
  }
  console.log('cc', command);
  xtouch_out.send('cc', command);
}

function setRotaryValue(id, value) {
  const command = {
    controller: id + 1,
    value: value,
    channel: ccChannel,
  }
  console.log('cc', command);
  xtouch_out.send('cc', command);
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

function updateChannelRegister(id) {
  const upper = id < 8;
  const channelId = upper ? id : id - 8;

  channelRegister[channelId] = bit_toggle(channelRegister[channelId],
    upper ? 0 : 1);

  console.log(`channelState (${channelId}): ${channelRegister[channelId]}`);
}

function updateParameterValue(id) {
  const upper = id < 8;
  const channelId = upper ? id : id - 8;
  const currentRegister = channelRegister[channelId];
  const parameterId = channelId + (channelRegister[channelId] * numChannels);
  const pValue = parameterValue[parameterId];

  console.log(`Channel ${channelId} Parameter(${parameterId}): ${pValue}`);

  setRotaryValue(channelId, pValue);

}

// switch channel state
xtouch_in.on('noteoff', msg => {
  const buttonId = inputId2ButtonId[msg.note];
  console.log('noteoff', msg.note, msg.velocity, msg.channel, buttonId);

  toggleButtonState(buttonId);
  updateChannelRegister(buttonId);
  updateParameterValue(buttonId);
});

xtouch_in.on('noteon', msg => {
  console.log('noteon', msg.note, msg.velocity, msg.channel)
});


// read rotary values from rotary encoder
xtouch_in.on('cc', msg => {
  console.log('cc', msg.controller, msg.value, msg.channel);

  const channelId = msg.controller - 1;
  const parameterId = channelId + (channelRegister[channelId] * numChannels);
  parameterValue[parameterId] = msg.value;

  console.log(`Channel ${channelId} Parameter(${parameterId}): ${parameterValue[parameterId]}`);
});
