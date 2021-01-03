/**
 *          | -> X-TOUCH IN           LOOP IN  -> |
 * X-TOUCH -|                 MAPPER              |- DAW
 *          | <- X-TOUCH OUT          LOOP OUT <- |
 * 
 */

const easymidi = require('easymidi');

const conv = require('./conversions');
const butState = require('./buttonState');
const paramStore = require('./parameterStore');

const XTOUCH_INPUT = 'X-TOUCH MINI 2';
const xtouch_in = new easymidi.Input(XTOUCH_INPUT);
const XTOUCH_OUTPUT = 'X-TOUCH MINI 3';
const xtouch_out = new easymidi.Output(XTOUCH_OUTPUT);

const LOOP_INPUT = 'loopMIDI IN 1';
const loop_in = new easymidi.Output(LOOP_INPUT);
const LOOP_OUTPUT = 'loopMIDI OUT 1';
const loop_out = new easymidi.Input(LOOP_OUTPUT);

const numLayers = 2;
const numRows = 3;
const numStrips = 8;
const numRegisters = 4;

const ccChannel = 10;
const globalChannel = 0;

// reset all button leds
for (let layer = 0; layer < numLayers; layer++) {
  for (let row = 0; row < numRows; row++) {
    for (let strip = 0; strip < numStrips; strip++) {
      const buttonId = conv.toButtonId(layer, row, strip);
      butState.clearButtonState(buttonId,
        [sendButtonLight, displayEncoderValueForCurrentRegister]);
    }
  }
}

// clear all parameter values
for (let layer = 0; layer < numLayers; layer++) {
  for (let strip = 0; strip < numStrips; strip++) {
    for (let register = 0; register < numRegisters; register++) {
      const paramId = conv.toParameterId(layer, strip, register);
      paramStore.clearParameterValue(paramId,
        [sendParameterValueToLoop, displayEncoderValueForParam]);
    }
  }
}

/*
for (let index = 0; index < numChannels; index++) {
  sendRotaryMode(index, 0); // single mode
  sendParameterValueToEncoder(index, 0); // reset rotary value to 0
} */

// x -touch mini send routines
/*
function sendRotaryMode(channelId, mode) {
  const command = {
    controller: utils.channelId2encoderModeController(channelId),
    value: mode,
    channel: globalChannel,
  }
  console.log(' ->cc[x-touch]', command);
  xtouch_out.send('cc', command);
} */

function sendButtonLight(buttonId, isButtonSet) {
  const command = {
    note: conv.buttonId2ButtonLedMidi(buttonId),
    velocity: isButtonSet ? 1 : 0,
    globalChannel,
  }
  console.log(' ->noteon[x-touch]', command);
  xtouch_out.send('noteon', command);
}

function sendParameterValueToEncoder(paramId, val) {
  const command = {
    controller: conv.channelId2EncoderMidi(paramId),
    value: val,
    channel: ccChannel,
  }
  console.log(' ->cc[x-touch]', command);
  xtouch_out.send('cc', command);
}

function sendParameterValueToLoop(paramId, value) {
  const command = {
    controller: conv.parameterId2Midi(paramId),
    value: value,
    channel: ccChannel,
  }
  console.log(' ->cc[loop]', command);
  loop_in.send('cc', command);
}

// display parameter value for the currently selected register
function displayEncoderValueForCurrentRegister(buttonId) {
  const currentParamId = butState.getSelectedParameterId(buttonId.layer, buttonId.strip);
  const value = paramStore.getParameterValue(currentParamId);
  sendParameterValueToEncoder(currentParamId, value);
}

// display parameter value when register of parameter is current register
function displayEncoderValueForParam(paramId) {
  const currentParamId = butState.getSelectedParameterId(paramId.layer, paramId.strip);
  if (paramId.register === currentParamId.register) {
    const value = paramStore.getParameterValue(currentParamId);
    sendParameterValueToEncoder(currentParamId, value);
  }
}

// listening to x-touch button input
// switch channel register on button release
xtouch_in.on('noteoff', msg => {
  console.log(' <-noteoff[x-touch]', msg.note, msg.velocity, msg.channel);

  const buttonId = conv.buttonMidi2buttonId(msg.note);
  console.log("Button: ", buttonId);

  // toggle state and when changed:
  // - send new button led info
  // - display encoder value for selected register
  // TODO: only do this when channel is mapped
  //       else send only value to loop
  butState.toggleButtonState(buttonId,
    [sendButtonLight, displayEncoderValueForCurrentRegister]);

  /* 
    else {
      console.log(' ->noteoff[loop]', msg.note, msg.velocity, msg.channel);
      loop_in.send('noteoff', msg);
    }*/
});

// listen to rotary values from rotary encoder
xtouch_in.on('cc', msg => {
  console.log(' <-cc[x-touch]', msg.controller, msg.value, msg.channel);

  const channelId = conv.encoderMidi2channelId(msg.controller);
  const paramId = butState.getSelectedParameterId(channelId.layer, channelId.strip);

  console.log("Parameter (", paramId, "): ", msg.value);

  // set parameter state and when changed:
  // - update encoder LED (not required?)
  // - send new state to loop
  paramStore.setParameterValue(paramId, msg.value, [sendParameterValueToLoop]);

  /*
  else {
  console.log(' ->cc[loop]', msg.controller, msg.value, msg.channel);
  loop_in.send('cc', msg);
  }
*/
});

// listen to value changes in the DAW
loop_out.on('cc', msg => {
  console.log(' <-cc[loop]', msg.controller, msg.value, msg.channel);

  const paramId = midi2parameterId(msg.controller);
  console.log("Parameter(", parameterId, "): ", msg.value);

  paramStore.setParameterValue(paramId, msg.value, [displayEncoderValueForParam]);
});
