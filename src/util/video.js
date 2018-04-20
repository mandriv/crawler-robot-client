import { spawn } from 'child_process';
import fs from 'fs';

export const init = () => {
  console.log('Starting avconv...') // eslint-disable-line
  while (true) {
    const args = '-f video4linux2 -s 640x480 -i /dev/video0 -vframes 1 ~/out.jpg';
    spawn('avconv', args.split(' '));
  }
};

export const startStreaming = (socket, robotID) => {
  fs.watch('~/out.jpg', () => {
    console.log('change!');
  });
}
