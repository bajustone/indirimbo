#!/usr/bin/env node
/**
 * @author
 * BAHATI Justin
 */

const fs = require('fs');
const CleanCSS = require('clean-css');
const files = [
  'static/styles/app.css'
];
const opts = {
  keepSpecialComments: 1
};

files.forEach(f => {
  fs.writeFileSync(f, new CleanCSS(opts).minify([f]).styles, 'utf8');
});
