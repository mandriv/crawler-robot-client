const { Gpio } = require('onoff');

// pin numbers
export const LEFT_MOTOR_PIN_1_NUMBER = 17; // corresponding to pin 2 on h bridge
export const LEFT_MOTOR_PIN_2_NUMBER = 27; // corresponding to pin 7
export const RIGHT_MOTOR_PIN_1_NUMBER = 9; // pin 10
export const RIGHT_MOTOR_PIN_2_NUMBER = 11; // pin 15
export const PWR_3_PIN_NUMBER = 2;
export const PWR_2_PIN_NUMBER = 3;
export const PWR_1_PIN_NUMBER = 4;
export const PWR_0_PIN_NUMBER = 15;
// gpio
export const leftMotorPin1 = new Gpio(LEFT_MOTOR_PIN_1_NUMBER, 'out');
export const leftMotorPin2 = new Gpio(LEFT_MOTOR_PIN_2_NUMBER, 'out');
export const rightMotorPin1 = new Gpio(RIGHT_MOTOR_PIN_1_NUMBER, 'out');
export const rightMotorPin2 = new Gpio(RIGHT_MOTOR_PIN_2_NUMBER, 'out');
export const pwr3 = new Gpio(PWR_3_PIN_NUMBER, 'out');
export const pwr2 = new Gpio(PWR_2_PIN_NUMBER, 'out');
export const pwr1 = new Gpio(PWR_1_PIN_NUMBER, 'out');
export const pwr0 = new Gpio(PWR_0_PIN_NUMBER, 'out');

export function isInRange(value, lower, upper) {
  return value >= lower && value < upper;
}

export function map(num, inMin = 0, inMax = 100, outMin = 0, outMax = 15) {
  return Math.round((((num - inMin) * (outMax - outMin)) / (inMax - inMin)) + outMin);
}

export function to4BitUnsigned(num) {
  return Number(num).toString(2).padStart(4, '0');
}


// F - forwards, B - backwards, I - idle
export function getMotorsState(state) {
  const { power, angle } = state;
  const powerNum = Number(power);
  const angleNum = Number(angle);
  if (power === 0) {
    return {
      left: 'I',
      right: 'I',
      power4Bit: to4BitUnsigned(map(powerNum)),
    };
  }
  if (Number.isNaN(angleNum)) throw new Error('Invalid angle!');
  // →
  if (isInRange(angle, 337.5, 360) || isInRange(angle, 0, 22.5)) {
    return {
      left: 'F',
      right: 'B',
      power4Bit: to4BitUnsigned(map(powerNum)),
    };
  }
  // ↗
  if (isInRange(angle, 22.5, 67.5)) {
    return {
      left: 'F',
      right: 'I',
      power4Bit: to4BitUnsigned(map(powerNum)),
    };
  }
  // ↑
  if (isInRange(angle, 67.5, 112.5)) {
    return {
      left: 'F',
      right: 'F',
      power4Bit: to4BitUnsigned(map(powerNum)),
    };
  }
  // ↖
  if (isInRange(angle, 112.5, 157.5)) {
    return {
      left: 'I',
      right: 'F',
      power4Bit: to4BitUnsigned(map(powerNum)),
    };
  }
  // ←
  if (isInRange(angle, 157.5, 202.5)) {
    return {
      left: 'B',
      right: 'F',
      power4Bit: to4BitUnsigned(map(powerNum)),
    };
  }
  // ↙
  if (isInRange(angle, 202.5, 247.5)) {
    return {
      left: 'I',
      right: 'B',
      power4Bit: to4BitUnsigned(map(powerNum)),
    };
  }
  // ↓
  if (isInRange(angle, 247.5, 292.5)) {
    return {
      left: 'B',
      right: 'B',
    };
  }
  // ↘
  if (isInRange(angle, 292.5, 337.5)) {
    return {
      left: 'B',
      right: 'I',
      power4Bit: to4BitUnsigned(map(powerNum)),
    };
  }
}

export function getPinState(motorsState) {
  const { left, right, power4Bit } = motorsState;
  const pinState = {
    left1: 0,
    left2: 0,
    right1: 0,
    right2: 0,
    pwr3: Number(power4Bit.charAt(0)),
    pwr2: Number(power4Bit.charAt(1)),
    pwr1: Number(power4Bit.charAt(2)),
    pwr0: Number(power4Bit.charAt(3)),
  };

  if (left === 'F') {
    pinState.left1 = 1;
    pinState.left2 = 0;
  } else if (left === 'B') {
    pinState.left1 = 0;
    pinState.left2 = 1;
  }

  if (right === 'F') {
    pinState.right1 = 1;
    pinState.right2 = 0;
  } else if (right === 'B') {
    pinState.right1 = 0;
    pinState.right2 = 1;
  }

  return pinState;
}

export function handlePinState(pinState) {
  function cb(err) {
    if (err) console.warn(err);
  }
  leftMotorPin1.write(pinState.left1 || 0, cb);
  leftMotorPin2.write(pinState.left2 || 0, cb);
  rightMotorPin1.write(pinState.right1 || 0, cb);
  rightMotorPin2.write(pinState.right2 || 0, cb);
  pwr3.write(pinState.pwr3 || 0, cb);
  pwr2.write(pinState.pwr2 || 0, cb);
  pwr1.write(pinState.pwr1 || 0, cb);
  pwr0.write(pinState.pwr0 || 0, cb);
}
