// React Native Polyfills
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

// Node.js polyfills
import { Buffer } from 'buffer';

// Global polyfills
global.Buffer = Buffer;
global.process = require('process/browser');

// Stream polyfill
import * as stream from 'readable-stream';
global.stream = stream;

// TextEncoder/TextDecoder for libraries expecting Web APIs
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { TextEncoder, TextDecoder } = require('text-encoding');
if (typeof global.TextEncoder === 'undefined') {
  // @ts-ignore
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  // @ts-ignore
  global.TextDecoder = TextDecoder;
}