const easymidi = require('easymidi');
const utils = require('./utils');

const XTOUCH_INPUT = 'X-TOUCH MINI 0';
const xtouch_in = new easymidi.Input(XTOUCH_INPUT);
const XTOUCH_OUTPUT = 'X-TOUCH MINI 1';
const xtouch_out = new easymidi.Output(XTOUCH_OUTPUT);

const numChannels = 8;
const numRows = 2;
const ccChannel = 10;
const globalChannel = 0;

// button state reflects the button lights
const buttonState = [];

// reset them all
for (let index = 0; index < numRows * numChannels; index++) {
  buttonState[index] = false;
  sendButtonLight(index, false);
}

// clear all  numChannels * 2^numRows parameter values
const parameterValue = [];
for (let index = 0; index < numRows * numRows * numChannels; index++) {
  parameterValue[index] = 0;
}
for (let index = 0; index < numChannels; index++) {
  sendRotaryMode(index, 0); // single mode
  sendRotaryValue(index, 0); // reset rotary value to 0
}

function sendRotaryMode(channelId, mode) {
  const command = {
    controller: utils.channelId2encoderModeController(channelId),
    value: mode,
    channel: globalChannel,
  }
  console.log(' ->cc', command);
  xtouch_out.send('cc', command);
}

function sendButtonLight(buttonId, isButtonSet) {
  const command = {
    note: utils.buttonId2midiNote(buttonId),
    velocity: isButtonSet ? 1 : 0,
    globalChannel,
  }
  console.log(' ->noteon', command);
  xtouch_out.send('noteon', command);
}

function sendRotaryValue(channelId, value) {
  const command = {
    controller: utils.channelId2encoderValueController(channelId),
    value: value,
    channel: ccChannel,
  }
  console.log(' ->cc', command);
  xtouch_out.send('cc', command);
}

function toggleButtonState(buttonId) {
  buttonState[buttonId] = !buttonState[buttonId];
  console.log(`button state [${buttonId}]: ${buttonState[buttonId]}`)
}

// switch channel state
xtouch_in.on('noteoff', msg => {
  console.log(' <-noteoff', msg.note, msg.velocity, msg.channel);

  const buttonId = utils.midiNote2buttonId(msg.note);
  console.log(`button ${buttonId} pressed.`)

  if (buttonId >= 0) {
    toggleButtonState(buttonId);

    // TODO: generalize update/send functions
    sendButtonLight(buttonId, buttonState[buttonId]);
    channelId = utils.buttonId2channelId(buttonId);
    const parameterId = utils.getParameterId(channelId, buttonState, numChannels);
    const pValue = parameterValue[parameterId];
    sendRotaryValue(channelId, pValue);
  }
});

xtouch_in.on('noteon', msg => {
  console.log(' ->noteon', msg.note, msg.velocity, msg.channel)
});


// read rotary values from rotary encoder
xtouch_in.on('cc', msg => {
  console.log(' <-cc', msg.controller, msg.value, msg.channel);

  const channelId = utils.encoderModeController2channelId(msg.controller);
  const parameterId = utils.getParameterId(channelId, buttonState, numChannels);
  parameterValue[parameterId] = msg.value;

  console.log(`Channel ${channelId} Parameter(${parameterId}): ${parameterValue[parameterId]}`);
});
