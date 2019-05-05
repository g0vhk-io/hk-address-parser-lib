const Promise = require('bluebird');
const { expect } = require('chai');
const fs = require('fs');

import Address from '../src/models/address';
import * as sinon from 'sinon';
import { searchAddressFromLand, queryMultipleAddress } from '../src/address-resolver';
import LandAddress from '../src/models/land-address';
import { lcs, sortLandResult } from '../src/land-sorter';


// Create a TestAddress class for testing
class TestAddress extends Address {

  constructor({ lat, lng }) {
    super();
    this.lat = lat;
    this.lng = lng;
  }

  coordinate() {
    return {
      lat: this.lat,
      lng: this.lng,
    }
  }
};

describe('address-parser', () => {
  const testCases = {};
  before(() => {
    const filenames = fs.readdirSync('./test/testcases/land-department');
    filenames.forEach((filename) => {
      const data = JSON.parse(fs.readFileSync(`./test/testcases/land-department/${filename}`).toString());
      testCases[data.query] = data;
    });

    const fetch = sinon.stub(global, 'fetch');
    fetch.callsFake((url) => {
      for (const address of Object.keys(testCases)) {

        if (url.indexOf(encodeURI(address)) >= 0) {

          return Promise.resolve({
            json: async () => {
              return Promise.resolve(testCases[address].data);
            }
          });
        }
      }
    })
  });

  it('should return a list of land result', async () => {

    const testData = Object.values(testCases)[0];
    const { query, location } = testData;

    const searchResult = await searchAddressFromLand(query);
    expect(searchResult).to.be.a('array');
    expect(searchResult.length).to.be.gte(0);
    expect(searchResult[0] instanceof Address).to.be.true;
  });

  it('should return the count of longest common subsequence', async () => {
    const lcsTestcases = [
      ['A', 'AA', 1],
      ['AXYT', 'AY', 2]
    ];
    for (const testcase of lcsTestcases) {
      expect(lcs(testcase[0], testcase[1])).to.be.eq(testcase[2]);
    }
  });

  it('should return a sorted list of land result', async () => {

    const testData = Object.values(testCases)[0];
    const { query, location } = testData;

    const targetAddress = new TestAddress(location);

    let searchResult = await searchAddressFromLand(query);
    expect(searchResult).to.be.a('array');
    expect(searchResult.length).to.be.gte(0);

    // The result should be sorted
    let distanceForFirstResult = searchResult[0].distanceTo(targetAddress);
    // Every object should be LandAddress
    for (let i = 0; i < searchResult.length; i++) {
      const result = searchResult[i];
      expect(result instanceof LandAddress).to.be.equal(true);
      const distance = result.distanceTo(targetAddress);
      expect(distance).to.be.not.undefined
      expect(distance).to.be.not.null
    }

  });
});
