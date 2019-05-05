# 香港地址解析器 Hong Kong Address Parser Lib

This is the JavaScript Address Resolver library for [Hong Kong Address Parser](https://g0vhk-io.github.io/HKAddressParser).  
Feel free to check the [frontend repo](https://github.com/g0vhk-io/HKAddressParser) or download the [npm package](https://www.npmjs.com/package/hk-address-parser-lib).  

## Installation

You are required to install these two dependencies yourself if they are not already in your project:
```bash
npm i @turf/turf proj4
```
Then install the address parser:
```bash
npm i hk-address-parser
```

## Usage

```javascript

import AddressResolver from 'hk-address-parser-lib';

...

const records = await AddressResolver.parse("address to search");
records.forEach(address => {
  //
})
```

---

### API for address

#### function components(lang: LANG): any

#### function componentLabelForKey(key: string, lang: LANG): string

#### function componentValueForKey(key: string, lang: LANG): string

#### function fullAddress(lang: LANG): string

#### function coordinate(): { lat, lng }

#### function coordinates(): { lat, lng }[]

#### function dataSource(): string[]

#### function confidence(): int

#### function distanceTo(address: Address): Number

## Contribute

### Testing the accuracy

