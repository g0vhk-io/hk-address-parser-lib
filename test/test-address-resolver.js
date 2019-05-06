const Promise = require('bluebird');
const { expect } = require('chai');
const fs = require('fs');

import Address from '../src/models/address';
import * as sinon from 'sinon';
import AddressResolver from '../src/address-resolver';
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

describe('address-resolver', () => {
  const testCases = {};
  const cache = {};

  // Load from the test cases
  before(() => {
    const filenames = fs.readdirSync('./test/testcases/full');
    filenames.forEach((filename) => {
      const data = JSON.parse(fs.readFileSync(`./test/testcases/full/${filename}`).toString());
      testCases[data.query] = data;
      for (const request of data.requests) {
        cache[request.url] = request.response;
      }
    });
  });

  beforeEach(() => {
    const fetch = sinon.stub(global, 'fetch');
    fetch.callsFake((url) => {
      return Promise.resolve({
        json: async () => {
          return Promise.resolve(cache[url]);
        }
      });
    })
  })

  afterEach(() => {
    global.fetch.restore();
  })

  it('should return a list of address', async () => {

    const testData = Object.values(testCases)[0];
    const { query, location } = testData;

    const searchResult = await AddressResolver.queryAddress(query);
    expect(searchResult).to.be.a('array');
    expect(searchResult.length).to.be.gte(0);
    expect(searchResult[0] instanceof Address).to.be.true;
  });

  describe('queryMultipleAddress', () => {
    it('should return a list of address', async () => {

      const testData = Object.values(testCases)[0];
      const { query, location } = testData;

      const searchResults = await AddressResolver.batchQueryAddresses([query], { limit : 10 });
      expect(searchResults).to.be.a('array');
      expect(searchResults.length).to.be.eq(1);

      const searchResult = searchResults[0];
      expect(searchResult).to.be.a('array');
      expect(searchResult.length).to.be.gt(0);
      expect(searchResult[0] instanceof Address).to.be.true;
    });

    it('should return all results after all query success', async () => {

      const testData = Object.values(testCases)[0];
      const { query, location } = testData;

      const addresses = [];
      for (let i =0 ;i < 20; i ++) {
        addresses.push(query);
      }
      const searchResults = await AddressResolver.batchQueryAddresses(addresses, { limit : 10 });
      expect(searchResults).to.be.a('array');
      expect(searchResults.length).to.be.eq(20);

      const searchResult = searchResults[0];
      expect(searchResult).to.be.a('array');
      expect(searchResult.length).to.be.gt(0);
      expect(searchResult[0] instanceof Address).to.be.true;
    });

    it('should be able to run with no limit', async () => {

      const testData = Object.values(testCases)[0];
      const { query, location } = testData;

      const searchResults = await AddressResolver.batchQueryAddresses([query]);
      expect(searchResults).to.be.a('array');
      expect(searchResults.length).to.be.eq(1);

      const searchResult = searchResults[0];
      expect(searchResult).to.be.a('array');
      expect(searchResult.length).to.be.gt(0);
      expect(searchResult[0] instanceof Address).to.be.true;
    });
  })


});
