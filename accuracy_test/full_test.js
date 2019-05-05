#!/usr/bin/env node
// Idea:
// We need to have two independent script that print out the lat/lng (also the formatted result?) in the stdout
const program = require('commander');
const Promise = require('bluebird');
const csv = require('fast-csv');
const fs = require('fs');
const { spawn } = require('child_process');
const async = require('async');
const moment = require('moment');
const md5 = require('md5');
const path = require('path');
const runner = require('./run_test');

// default logger
const { log, error } = console;

/**
 * Helper function to calcualte the distance of two given coordinates
 * @description
 * @param {*} lat1
 * @param {*} lon1
 * @param {*} lat2
 * @param {*} lon2
 * @returns
 */
function calcDistance(lat1, lon1, lat2, lon2) {
  var R = 6371; // km
  var dLat = toRad(lat2 - lat1);
  var dLon = toRad(lon2 - lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}

// Converts numeric degrees to radians
function toRad(Value) {
  return Value * Math.PI / 180;
}



/**
 * Load the test cases from file
 * @param {string} filePath
 */
async function readTestCases(filePath) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath);
    const testCases = [];
    csv.fromStream(stream).on('data', data => {
      testCases.push(data);
    }).on('end', () => {
      resolve(testCases.slice(1, testCases.length));
    });
  })
}

function checkResult(result, expectedLat, expectedLng) {
  const THRESHOLD = 0.1;
  if (!result.geo) {
    return false;
  }

  if (Array.isArray(result.geo)) {
    for ({ Latitude, Longitude } of result.geo) {
      if (calcDistance(Latitude, Longitude, expectedLat, expectedLng) < THRESHOLD) {
        return true;
      }
    }
  } else {
    const { Latitude, Longitude } = result.geo;
    if (calcDistance(Latitude, Longitude, expectedLat, expectedLng) < THRESHOLD) {
      return true;
    }
  }
  return false;
}


function outputResultTofile(result, outputFile) {
  // get the version
  const packageJson = JSON.parse(fs.readFileSync('./package.json'));
  const verison = packageJson.version;

  // load the file
  let content = {
    results: {}
  };

  if (fs.existsSync(outputFile)) {
    content = JSON.parse(fs.readFileSync(outputFile));
  }

  // Overwrite the version string
  content.results[verison] = result;

  fs.writeFileSync(outputFile, JSON.stringify(content, null, 2));
}

/**
 * @description Run with module
 * @param {*} address
 * @returns
 */
async function runTest(address) {
  return runner.run(address);
}


/**
 * Method stubbing to inject the caching layer for fetch
 */


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
const metrics = {
  loadedFromCache: 0,
  totalRequest: 0,
  repeatedRequest: 0,
  uriHash: {},
}

global.fetch = function (...args) {
  const url = args[0];

  metrics.totalRequest += 1;
  if (metrics.uriHash[url] === undefined) {
    metrics.uriHash[url] = 1;
  } else {
    metrics.uriHash[url] += 1;
  }

  // try to load the cached files
  const cache = loadFromCache(url);
  if (cache) {
    metrics.loadedFromCache += 1;
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

async function main({ limit = Infinity, outputFile, verbose = false }) {
  return new Promise(async (resolve, reject) => {
    const startTime = moment();
    const allTestData = await readTestCases(__dirname + '/test_cases/testcases_ogcio_searchable.csv');
    const result ={
      total: 0
    }


    result.date = moment().format('YYYY-MM-DD hh:mm:ss');
    if (typeof(tag) === 'string' && tag.length > 0) {
      result.tag = tag;
    }

    result.success = 0;
    result.failed = [];

    async.eachOfLimit(allTestData.slice(0, limit), 2000, async (testData) => {
      result.total += 1;
      try {
        const [address, lat, lng] = testData;
        const jsResult = await runTest(address);
        if (checkResult(jsResult, lat, lng)) {
          result.success += 1;
        } else {
          result.failed.push(address);
        }
      } catch (error) {
        error(`Error when running ${testData}`);
        error(error);
      }
    }, // callback
      () => {
        // output the result
        const timeElapsed = moment().diff(startTime, 'ms');
        log(`Finished! Total ${result.total} tests executed .`);
        log(`Time elapsed: ${timeElapsed}ms`);
        log(`========================================`);
        log(`Total Request fired: ${metrics.totalRequest}`);
        log(`Request cached: ${metrics.loadedFromCache}`);
        log(`Repeated request: ${metrics.repeatedRequest}`);
        log(`Average request per query: ${Math.round(metrics.totalRequest * 100/result.total) / 100}`);
        // Write to file

        result.success_rate = `${result.success / result.total}`;

        if (outputFile) {
          outputResultTofile(result, outputFile);
        }
        if (verbose) {
          log(result);
        }
        resolve();
      })
  });

}






/**
 * Termination process
 */
function end() {
  process.exit(1);
}


program
  .version('0.1.0');

/**
 * Simple mathematic calcuation
 */
program
  .description('Run the test cases')
  .option('-o, --output [file]', 'Output the test result to the file, default output to console')
  .option('-l, --limit [n]', 'Limit the number of test cases to run')
  .option('-v, --verbose', 'Show verbose log including the failed cases')
  .parse(process.argv);


const outputFile = program.output;
const verbose = program.verbose;
// bitwise flag: | python | node |
const limit = program.limit || Infinity;

main({ limit, outputFile, verbose })
  .then((end) => {
  })
  .catch((err) => {
    error(err);
    end();
  });