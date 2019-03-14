# 香港地址解析器 Hong Kong Address Parser Lib

## Installation

```bash
npm install hk-address-parser-lib
```

## Usage

```javascript

import AddressResolver from 'hk-address-parser';

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

