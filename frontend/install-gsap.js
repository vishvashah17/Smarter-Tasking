import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';

const targetDir = 'd:/taskmanager/frontend/node_modules/gsap';
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Write package.json for gsap
const pkgJson = {
  "name": "gsap",
  "version": "3.12.5",
  "description": "GreenSock Animation Platform",
  "main": "index.js",
  "module": "index.js",
  "type": "module",
  "exports": {
    ".": {
      "import": "./index.js",
      "require": "./dist/gsap.js"
    }
  }
};
fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(pkgJson, null, 2));

// Download index.js from unpkg/jsdelivr
const url = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';
console.log('Fetching GSAP from CDN...');

https.get(url, (res) => {
  if (res.statusCode === 302 || res.statusCode === 301) {
    https.get(res.headers.location, (res2) => {
      let data = '';
      res2.on('data', chunk => data += chunk);
      res2.on('end', () => {
        fs.writeFileSync(path.join(targetDir, 'index.js'), data);
        console.log('Successfully wrote index.js, length:', data.length);
      });
    });
  } else {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      fs.writeFileSync(path.join(targetDir, 'index.js'), data);
      console.log('Successfully wrote index.js, length:', data.length);
    });
  }
}).on('error', (err) => {
  console.error('Error fetching GSAP:', err);
});
