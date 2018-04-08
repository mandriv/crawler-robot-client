import events from 'events';
import { spawn } from 'child_process';

const port = process.env.PORT || 3001;

export const FORMAT_IN = 'video4linux2';
export const CAMERA_DIR = '/dev/video0';
export const FRAMERATE = 30;
export const VIDEO_SIZE = '640x480';
export const FORMAT_OUT = 'mpegts';
export const BITRATE = '1000k';
export const URL = `http://localhost:${port}/stream`;

export const DEFAULT_CONFIG = {
  formatIn: FORMAT_IN,
  dir: CAMERA_DIR,
  framerate: FRAMERATE,
  videoSize: VIDEO_SIZE,
  formatOut: FORMAT_OUT,
  bitrate: BITRATE,
  url: URL,
};

export const init = (cfg = DEFAULT_CONFIG) => {
  console.log('Starting avconv...') // eslint-disable-line

  const formatIn = `-f ${cfg.formatIn}`;
  const framerate = `-framerate ${cfg.framerate}`;
  const sizeIn = `-video_size ${cfg.videoSize}`;
  const input = `-i ${cfg.dir}`;
  const formatOut = `-f ${cfg.formatOut}`;
  const codec = '-codec:v mpeg1video';
  const sizeOut = `-s ${cfg.videoSize}`;
  const bitrate = `-b:v ${cfg.bitrate} -bf 0`;
  const { url } = cfg;
  const args = `${formatIn} ${framerate} ${sizeIn} ${input} ${formatOut} ${codec} ${sizeOut} ${bitrate} ${url}`;
  const avconv = spawn('avconv', args.split(' '));
  avconv.on('close', () => console.log('avconc failed')); // eslint-disable-line
};

export const getStreamRouteHandler = (socket, robotID) => (req) => {
  // init emiiter
  req.Emitter = new events.EventEmitter().setMaxListeners(0);
  req.connection.setTimeout(0);
  // emit data
  req.on('data', (buffer) => {
    console.log(buffer);
    req.Emitter.emit('data', buffer);
    socket.emit('video-stream', {
      robotID,
      buffer,
    });
  });
};
