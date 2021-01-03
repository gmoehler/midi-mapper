// 64 parameter ids:
// layer     0..1
// strip     0..7 
// register  0..4

function toParameterId(layer, strip, register) {
  return {
    layer,
    strip,
    register,
  }
}

function toChannelId(layer, strip) {
  return toParameterId(layer, strip, null);
}

// 38 button ids:
// layer: 0..1
// row:   0..2
// strip: 0..7

function toButtonId(layer, row, strip) {
  return {
    layer,
    row,
    strip
  }
}

//////////////////////////////////
// midi codes input from x-touch
//////////////////////////////////

// buttons take midi code as button id
// 0..7 encoder buttons (layer A)
// 8..15 / 16..23 two rows of buttons (layer A)
// 24..31 encoder buttons (layer B)
// 32..39 / 40..37 two rows of buttons (layer B)

function buttonMidi2buttonId(buttonMidi) {

  const layer = buttonMidi > 23 ? 1 : 0;
  const row = parseInt((buttonMidi % 24) / 8);
  const strip = (buttonMidi % 24) % 8;

  return toButtonId(layer, row, strip);
}

// encoders
function encoderMidi2channelId(encoderMidi) {
  // encoders are:
  // 1..8 (Layer A)
  // 9..10: Main fader (Layer A/B) - ignored for now
  // 11..18 (Layer B)
  if (encoderMidi < 1 || encoderMidi > 18 ||
    encoderMidi === 9 || encoderMidi === 10) {
    return toChannelId(null, null);
  }
  return encoderMidi < 9 ?
    toChannelId(0, encoderMidi - 1) :
    toChannelId(1, encoderMidi - 11);
}

/////////////////////////////////
// midi codes output to x-touch  
/////////////////////////////////

// button LEDs
function buttonId2ButtonLedMidi(buttonId) {
  if (buttonId.row > 0) { // only leds in row 1 & 2
    return buttonId.strip + (buttonId.row - 1) * 8;
  }
}

// encoder values (incl. LEDs)
function channelId2EncoderMidi(channelId) {
  return channelId.layer === 0 ?
    1 + channelId.strip : 10 + channelId.strip;
}

/////////////////////////
// DAW in/out midi codes
/////////////////////////

// parameter id to midi (bitwise: LSSSRR)
function parameterId2Midi(parameterId) {
  return (parameterId.layer << 5)
    + (parameterId.strip << 2)
    + parameterId.register;
}

function extractBits(val, fromBit, toBit) {
  return ((val &
    ((1 << toBit) - 1) &
    ~(((1 << fromBit) - 1)))
    >>> fromBit);
}

// parameter midi code to parameter id (bitwise: LSSSRR)
function midi2parameterId(parameterId) {
  return toParameterId(
    extractBits(parameterId, 5, 6),
    extractBits(parameterId, 2, 5),
    extractBits(parameterId, 0, 2))
}

module.exports = {
  toParameterId,
  toButtonId,
  buttonMidi2buttonId,
  encoderMidi2channelId,
  buttonId2ButtonLedMidi,
  channelId2EncoderMidi,
  parameterId2Midi,
  midi2parameterId,
}