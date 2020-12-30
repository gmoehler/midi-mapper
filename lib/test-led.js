const easymidi = require('easymidi');


// const lp_out = new easymidi.Output("loopMIDI OUT 2");
const lp_out = new easymidi.Output("X-TOUCH MINI 1");

const timer = ms => new Promise(res => setTimeout(res, ms))

async function sendLed(val) {

  msg = {
    controller: 2,
    value: val,
    channel: 10,
  }
  console.log(val);
  lp_out.send('cc', msg)
}

async function test() {
  for (let times = 0; times < 1; times++) {

    for (let val = 0; val < 128; val++) {
      sendLed(val);
      await timer(100);
    }
  }
}

test();