/**
 *          | -> X-TOUCH IN           LOOP IN  -> |
 * X-TOUCH -|                 MAPPER              |- DAW
 *          | <- X-TOUCH OUT          LOOP OUT <- |
 * 
 */

const easymidi = require('easymidi');
const { parameterId2ChannelId } = require('./utils');
const utils = require('./utils');

const XTOUCH_INPUT = 'X-TOUCH MINI 2';
const xtouch_in = new easymidi.Input(XTOUCH_INPUT);
const XTOUCH_OUTPUT = 'X-TOUCH MINI 3';
const xtouch_out = new easymidi.Output(XTOUCH_OUTPUT);

const LOOP_INPUT = 'loopMIDI IN 1';
const loop_in = new easymidi.Output(LOOP_INPUT);
const LOOP_OUTPUT = 'loopMIDI OUT 1';
const loop_out = new easymidi.Input(LOOP_OUTPUT);

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

// clear all (numChannels * 2^numRows) parameter values
const parameterValue = [];
for (let index = 0; index < numRows * numRows * numChannels; index++) {
  parameterValue[index] = 0;
}
for (let index = 0; index < numChannels; index++) {
  sendRotaryMode(index, 0); // single mode
  sendParameterValueToEncoder(index, 0); // reset rotary value to 0
}

// x -touch mini send routines
function sendRotaryMode(channelId, mode) {
  const command = {
    controller: utils.channelId2encoderModeController(channelId),
    value: mode,
    channel: globalChannel,
  }
  console.log(' ->cc[x-touch]', command);
  xtouch_out.send('cc', command);
}

function sendButtonLight(buttonId, isButtonSet) {
  const command = {
    note: utils.buttonId2midiNote(buttonId),
    velocity: isButtonSet ? 1 : 0,
    globalChannel,
  }
  console.log(' ->noteon[x-touch]', command);
  xtouch_out.send('noteon', command);
}

function sendParameterValueToEncoder(channelId, value) {
  const command = {
    controller: utils.channelId2encoderValueController(channelId),
    value: value,
    channel: ccChannel,
  }
  console.log(' ->cc[x-touch]', command);
  xtouch_out.send('cc', command);
}

function sendParameterValueToLoop(parameterId, value) {
  const command = {
    controller: utils.parameterId2MidiController(parameterId),
    value: value,
    channel: ccChannel,
  }
  console.log(' ->cc[loop]', command);
  loop_in.send('cc', command);
}

// toggle internal button state
function toggleButtonState(buttonId) {
  buttonState[buttonId] = !buttonState[buttonId];
  console.log(`button state [${buttonId}]: ${buttonState[buttonId]}`)
}

// listening to x-touch button input
// switch channel register on button release
xtouch_in.on('noteoff', msg => {
  console.log(' <-noteoff[x-touch]', msg.note, msg.velocity, msg.channel);

  const buttonId = utils.midiNote2buttonId(msg.note);

  if (Number.isInteger(buttonId)) {
    console.log(`button ${buttonId} pressed.`);

    toggleButtonState(buttonId);

    // TODO: generalize update/send functions
    sendButtonLight(buttonId, buttonState[buttonId]);
    channelId = utils.buttonId2channelId(buttonId);
    const parameterId = utils.getParameterId(channelId, buttonState, numChannels);
    const pValue = parameterValue[parameterId];
    sendParameterValueToEncoder(channelId, pValue);
  }
  else {
    console.log(' ->noteoff[loop]', msg.note, msg.velocity, msg.channel);
    loop_in.send('noteoff', msg);
  }
});

// listen to rotary values from rotary encoder
xtouch_in.on('cc', msg => {
  console.log(' <-cc[x-touch]', msg.controller, msg.value, msg.channel);

  const channelId = utils.encoderModeController2channelId(msg.controller);
  if (Number.isInteger(channelId)) {
    const parameterId = utils.getParameterId(channelId, buttonState, numChannels);
    parameterValue[parameterId] = msg.value;

    console.log(`Channel ${channelId} Parameter(${parameterId}): ${parameterValue[parameterId]}`);

    sendParameterValueToLoop(parameterId, parameterValue[parameterId]);
  } else {
    console.log(' ->cc[loop]', msg.controller, msg.value, msg.channel);
    loop_in.send('cc', msg);
  }
});

// listen to value changes in the DAW
loop_out.on('cc', msg => {
  console.log(' <-cc[loop]', msg.controller, msg.value, msg.channel);

  const parameterId = msg.controller;
  const channelId = parameterId2ChannelId(parameterId);
  parameterValue[parameterId] = msg.value;

  console.log(`Channel ${channelId} Parameter(${parameterId}): ${parameterValue[parameterId]}`);

  const currentParameterId = utils.getParameterId(channelId, buttonState, numChannels);

  // only update encoder LEDs if this register is selected
  if (parameterId === currentParameterId) {
    sendParameterValueToEncoder(channelId, parameterValue[parameterId]);
  }
});
