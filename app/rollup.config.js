const intro = `/*!
 * Build: ${(new Date()).toISOString()}
 */`;

import cleanup from 'rollup-plugin-cleanup';

export default {
  entry: 'scripts/app.js',
  dest: 'static/scripts/app.js',
  plugins: [
    cleanup()
  ],
  intro
};
