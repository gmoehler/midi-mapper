const easymidi = require('easymidi');


const xt_in = new easymidi.Input("X-TOUCH MINI 1");
const xt_out = new easymidi.Output("X-TOUCH MINI 2");

const lp_in = new easymidi.Input("loopMIDI Port 0");
const lp_out = new easymidi.Output("loopMIDI Port 1");

xt_in.on('noteoff', msg => {
  console.log('xt: noteoff', msg.note, msg.velocity, msg.channel);
  lp_out.send('noteoff', msg);
});

xt_in.on('noteon', msg => {
  console.log('xt: noteon', msg.note, msg.velocity, msg.channel);
  lp_out.send('noteon', msg);
});

xt_in.on('cc', msg => {
  console.log('xt: cc', msg.controller, msg.value, msg.channel);
  lp_out.send('cc', msg);
});

xt_in.on('program', msg => {
  console.log('xt: program', msg.number, msg.channel);
  lp_out.send('program', msg);
});

lp_in.on('noteoff', msg => {
  console.log('lp: noteoff', msg.note, msg.velocity, msg.channel);
  //xt_out.send('noteoff', msg);
});

lp_in.on('noteon', msg => {
  console.log('lp: noteon', msg.note, msg.velocity, msg.channel);
  //xt_out.send('noteon', msg);
});

lp_in.on('cc', msg => {
  console.log('lp: cc', msg.controller, msg.value, msg.channel);
  //xt_out.send('cc', msg);
});

lp_in.on('program', msg => {
  console.log('lp: program', msg.number, msg.channel);
  //xt_out.send('program', msg);
});


