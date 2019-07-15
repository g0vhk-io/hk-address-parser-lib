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

describe('address-resolver-amoy-garden', () => {
  const testCases = {};
  const cache = {};

  // Load from the test cases
  before(() => {
    const data = JSON.parse(fs.readFileSync(`./test/testcases/full/amoy-garden.json`).toString());
      testCases[data.query] = data;
      for (const request of data.requests) {
        cache[request.url] = request.response;
      }
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
  it('should return the components in ENG', async () => {

    const testData = Object.values(testCases)[0];
    const { query, location } = testData;

    const searchResult = await AddressResolver.queryAddress(query);
    expect(searchResult).to.be.a('array');
    expect(searchResult.length).to.be.gte(0);
    expect(searchResult[0] instanceof Address).to.be.true;
    expect(searchResult[0].componentValueForKey('Block', Address.LANG_EN)).to.be.equal("BLK P");
    
    expect(searchResult[0].componentValueForKey('Estate', Address.LANG_EN)).to.be.equal("AMOY GARDENS");
    expect(searchResult[0].componentValueForKey('Street', Address.LANG_EN)).to.be.equal("77 NGAU TAU KOK ROAD");
    expect(searchResult[0].componentValueForKey('District', Address.LANG_EN)).to.be.equal("Kwun Tong District");
    expect(searchResult[0].componentValueForKey('Region', Address.LANG_EN)).to.be.equal("Kowloon");

    expect(searchResult[0].fullAddress(Address.LANG_EN)).to.be.equal("AMOY GARDENS, 77 NGAU TAU KOK ROAD, Kowloon");
  });

  it('should return the components in Chinese', async () => {

    const testData = Object.values(testCases)[0];
    const { query, location } = testData;

    const searchResult = await AddressResolver.queryAddress(query);
    expect(searchResult).to.be.a('array');
    expect(searchResult.length).to.be.gte(0);
    expect(searchResult[0] instanceof Address).to.be.true;
    expect(searchResult[0].componentValueForKey('Block', Address.LANG_ZH)).to.be.equal("P座");
    expect(searchResult[0].componentValueForKey('Estate', Address.LANG_ZH)).to.be.equal("淘大花園");
    expect(searchResult[0].componentValueForKey('Street', Address.LANG_ZH)).to.be.equal("牛頭角道77號");
    expect(searchResult[0].componentValueForKey('District', Address.LANG_ZH)).to.be.equal("觀塘區");
    expect(searchResult[0].componentValueForKey('Region', Address.LANG_ZH)).to.be.equal("九龍");

    expect(searchResult[0].fullAddress(Address.LANG_ZH)).to.be.equal("九龍牛頭角道77號淘大花園");
  });


});
