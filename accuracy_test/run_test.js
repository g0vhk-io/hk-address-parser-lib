const md5 = require('md5');

const addressResolver = require('./../dist/hk-address-parser.cjs.js');
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');

if (process.argv.length < 2) {
  console.log('{}');
}


const address = process.argv[2];

function cacheFilePathForUrl(url) {
  // Base64 would return '/' but we do not want for paths
  return path.join('.cache', md5(url));
}

function saveToCache(url, json) {
  if (!fs.existsSync('.cache')){
    fs.mkdirSync('.cache');
  }
  const filePath = cacheFilePathForUrl(url);
  fs.writeFileSync(filePath, JSON.stringify(json));
}

function loadFromCache(url) {
  const filePath = cacheFilePathForUrl(url);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath).toString();
}

// Replace the fetch function
const nodeFetch = global.fetch;
global.fetch = function (...args) {
  const url = args[0];

  // try to load the cached files
  const cache = loadFromCache(url);
  if (cache) {
    return new Promise((resolve) => {
      resolve({
        json: () => JSON.parse(cache)
      });
    });
  } else {
    // Hook the function
    const fn = new Promise((resolve, reject) => {
      nodeFetch(...args).then(res => {
        // Overwrite the json()
        res.json().then(json => {
          saveToCache(url, json);
          res.json = () => json;
          resolve(res);
        })

      })
    });
    return fn;
  }
}


addressResolver.parse(address).then(results => {
  const result = results[0];
  const obj = {
    eng: result.fullAddress('eng'),
    chi: result.fullAddress('chi'),
    geo: result.coordinates().map(coord => ({Latitude: coord.lat + '', Longitude: coord.lng + ''}))
  };
  console.log(JSON.stringify(obj));
}).catch(error => {
   console.log(error.stack);
  console.log('{}');
})