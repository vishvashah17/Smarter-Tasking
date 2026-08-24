const fs = require('fs');
const path = require('path');
const https = require('https');

const gsapDir = path.join(__dirname, 'node_modules', 'gsap');
if (!fs.existsSync(gsapDir)) {
  fs.mkdirSync(gsapDir, { recursive: true });
}

function fetchFile(url, dest, callback) {
  https.get(url, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      return fetchFile(res.headers.location, dest, callback);
    }
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      fs.writeFileSync(dest, data, 'utf8');
      console.log(`Saved ${dest} (${data.length} bytes)`);
      if (callback) callback();
    });
  }).on('error', (err) => {
    console.error(`Error fetching ${url}:`, err);
  });
}

const pkgJson = {
  "name": "gsap",
  "version": "3.12.5",
  "main": "index.js",
  "module": "index.js",
  "type": "module",
  "exports": {
    ".": {
      "import": "./index.js",
      "default": "./index.js"
    }
  }
};

fs.writeFileSync(path.join(gsapDir, 'package.json'), JSON.stringify(pkgJson, null, 2));

fetchFile('https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js', path.join(gsapDir, 'index.js'), () => {
  console.log('GSAP download complete!');
});
