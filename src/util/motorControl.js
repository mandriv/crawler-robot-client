const Gpio = require('onoff').Gpio;

// pin numbers
export const LEFT_MOTOR_PIN_1_NUMBER = 17; // corresponding to pin 2 on h bridge
export const LEFT_MOTOR_PIN_2_NUMBER = 27; // corresponding to pin 7
export const RIGHT_MOTOR_PIN_1_NUMBER = 9; // pin 10
export const RIGHT_MOTOR_PIN_2_NUMBER = 11; // pin 15
// gpio
console.log(Gpio);
export const leftMotorPin1 = new Gpio(LEFT_MOTOR_PIN_1_NUMBER, 'out');
export const leftMotorPin2 = new Gpio(LEFT_MOTOR_PIN_2_NUMBER, 'out');
export const rightMotorPin1 = new Gpio(RIGHT_MOTOR_PIN_1_NUMBER, 'out');
export const rightMotorPin2 = new Gpio(RIGHT_MOTOR_PIN_2_NUMBER, 'out');

export function isInRange(value, lower, upper) {
  return value >= lower && value < upper;
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
    };
  }
  if (Number.isNaN(angleNum)) throw new Error('Invalid angle!');
  // →
  if (isInRange(angle, 337.5, 360) || isInRange(angle, 0, 22.5)) {
    return {
      left: 'F',
      right: 'B',
    };
  }
  // ↗
  if (isInRange(angle, 22.5, 67.5)) {
    return {
      left: 'F',
      right: 'I',
    };
  }
  // ↑
  if (isInRange(angle, 67.5, 112.5)) {
    return {
      left: 'F',
      right: 'F',
    };
  }
  // ↖
  if (isInRange(angle, 112.5, 157.5)) {
    return {
      left: 'I',
      right: 'F',
    };
  }
  // ←
  if (isInRange(angle, 157.5, 202.5)) {
    return {
      left: 'B',
      right: 'F',
    };
  }
  // ↙
  if (isInRange(angle, 202.5, 247.5)) {
    return {
      left: 'I',
      right: 'B',
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
    };
  }
}

export function getPinState(motorsState) {
  const { left, right } = motorsState;
  const pinState = {
    left1: 0,
    left2: 0,
    right1: 0,
    right2: 0,
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

export function handlePinState(pinState, cb) {
  console.log(leftMotorPin1);
  leftMotorPin1.write(pinState.left1, cb);
  leftMotorPin2.write(pinState.left2, cb);
  rightMotorPin1.write(pinState.right1, cb);
  rightMotorPin2.write(pinState.right2, cb);
}
