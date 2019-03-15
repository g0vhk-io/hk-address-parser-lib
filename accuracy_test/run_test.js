const addressResolver = require('./../dist/hk-address-parser.cjs.js');


module.exports = {
  run: async (address) => {
    try {
      const results = await addressResolver.parse(address);
      const result = results[0];
      const obj = {
        eng: result.fullAddress('eng'),
        chi: result.fullAddress('chi'),
        geo: result.coordinates().map(coord => ({Latitude: coord.lat + '', Longitude: coord.lng + ''}))
      };
      return obj;
    } catch (error) {
      console.error(error);
      return {};
    }
  }
}

