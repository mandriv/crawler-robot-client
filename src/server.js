import http from 'http';
import express from 'express';
import io from 'socket.io-client';
import axios from 'axios';

import envCheck from './util/envCheck'; // eslint-disable-line
import * as motor from './util/motorControl';
import * as video from './util/video';

const app = express();
const server = http.Server(app);
const socket = io(process.env.SOCKET_HOST, {
  transports: ['websocket'],
});

const credentials = {
  id: process.env.ROBOT_ID,
  key: process.env.ROBOT_KEY,
};
// Login
axios.post(`${process.env.API_HOST}/crawlers/login`, credentials)
  .then((response) => {
    video.init();
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
      // Motor handling
      const motorState = motor.getMotorsState(data);
      const pinState = motor.getPinState(motorState);
      motor.handlePinState(pinState);
    });

    // handle incoming video stream
    const robotID = response.data.crawler.id;
    app.all('/stream', video.getStreamRouteHandler(socket, robotID));

    const port = process.env.PORT;
    server.listen(port || 3001, () => {
      console.log(`Robot is ready to roll on port ${port}!`); // eslint-disable-line
    });
    // ----------------------------------
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(200);
  });
