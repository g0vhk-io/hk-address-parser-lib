# 香港地址解析器 Hong Kong Address Parser Lib

This is the JavaScript Address Resolver library for [Hong Kong Address Parser](https://g0vhk-io.github.io/HKAddressParser).
Feel free to check the [frontend repo](https://github.com/g0vhk-io/HKAddressParser) or download the [npm package](https://www.npmjs.com/package/hk-address-parser-lib).


For full details, see [https://g0vhk-io.github.io/hk-address-parser-lib](https://g0vhk-io.github.io/hk-address-parser-lib)

## Installation

Install library from npm directly

```bash
npm i hk-address-parser-lib
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
