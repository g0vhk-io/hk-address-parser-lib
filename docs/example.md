---
id: example
title: Example
---

## Example

with ES6 import syntax:

```javascript

import AddressParser from 'hk-address-parser-lib';

...

const records = await AddressParser.parse("元朗大球場");
const [firstRecord] = records;
console.log(firstRecord.coordinate());
// { lat: 22.4428, lng: 114.0220 }
console.log(record.fullAddress(AddressParser.Address.LANG_ZH));
// 新界 元朗 元朗體育路6號 元朗大球場

```
