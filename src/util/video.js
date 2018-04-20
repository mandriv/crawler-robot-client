import { spawnSync } from 'child_process';
import fs from 'fs';

export const startStreaming = (socket, robotID) => {
  while (true) {
    console.log('taking photo');
    const args = '-f video4linux2 -s 640x480 -i /dev/video0 -vframes 1 ~/out.jpg';
    spawnSync('avconv', args.split(' '));

    fs.watch('~/out.jpg', () => {
      console.log('change!');
    });
  }
}

export default startStreaming;
