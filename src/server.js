import http from 'http';
import express from 'express';
import io from 'socket.io-client';
import axios from 'axios';

import envCheck from './util/envCheck'; // eslint-disable-line
import * as motor from './util/motorControl';

const app = express();
const server = http.Server(app);
const socket = io(process.env.API_HOST, {
  transports: ['websocket'],
});

const credentials = {
  id: process.env.ROBOT_ID,
  key: process.env.ROBOT_KEY,
};
let semaphoreClosed = false;
// Login
axios.post(`${process.env.API_HOST}/crawlers/login`, credentials)
  .then((response) => {
    // ----------------------------------
    // --------Server code---------------
    // ----------------------------------
    // Join after connecting
    socket.emit('robot-join', {
      ...response.data.crawler,
      status: 'Ready',
    });

    // Receive robot controls
    socket.on('robot-control', (data) => {
      // Throttling
      if (semaphoreClosed) return;
      semaphoreClosed = true;
      setTimeout(() => {
        semaphoreClosed = false;
      }, 100);
      // Motor handling
      console.log('===============');
      console.log(data);
      console.log('----');
      const motorState = motor.getMotorsState(data);
      console.log(motorState);
      console.log('----');
      const pinState = motor.getPinState(motorState);
      console.log(pinState);
      motor.handlePinState(pinState, (err) => {
        console.log(err);
      });
      console.log('===============');
    });

    const port = process.env.PORT;
    server.listen(port, () => {
      console.log(`Robot is ready to roll on port ${port}!`); // eslint-disable-line
    });
    // ----------------------------------
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(200);
  });
