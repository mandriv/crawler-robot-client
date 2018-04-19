import dotenv from 'dotenv';

function envCheck() {
  // load variables
  dotenv.config();

  // check integrity
  const requiredFields = [
    'NODE_ENV',
    'PORT',
    'CONTROL_SOCKET_HOST',
    'VIDEO_WEBSOCKET_HOST',
    'API_HOST',
    'ROBOT_ID',
    'ROBOT_KEY',
  ];
  let missingFieldError = false;
  requiredFields.forEach((field) => {
    if (!process.env[field]) {
      missingFieldError = true;
      console.error(`Environment variable '${field}' is missing!`);
    }
  });
  if (missingFieldError) {
    console.error('Some enviroment variables are missing. Shutting down...');
    process.exit(1);
  } else {
    console.log('Env config ok...'); // eslint-disable-line
  }
}

export default envCheck();
