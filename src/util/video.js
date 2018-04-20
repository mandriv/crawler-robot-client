import { spawn } from 'child_process';
import fs from 'fs';
import ss from 'socket.io-stream';

const FILEPATH = '/home/pi/out.jpg';

export const startStreaming = (socket, robotID) => {
  console.log('taking photo');
  const args = `-f video4linux2 -s 640x480 -i /dev/video0 -vframes 1 ${FILEPATH}`;
  spawn('avconv', args.split(' '));

  fs.watch(FILEPATH, () => {
    console.log('change!');
    const stream = ss.createStream();
    ss(socket).emit('video-stream', stream, { robotID });
    const readStream = fs.createReadStream(FILEPATH);
    readStream.pipe(stream);
    readStream.on('end', () => {
      console.log('stream end');
      spawn('avconv', args.split(' '));
    });
  });
};

export default startStreaming;
