import resolver from "./address-resolver";
import address from './models/address';


// named export for the parse function
export const parse = (address) => {
	return resolver.queryAddress(address);
}

export const parseBatch = (addresses, options = {
  limit: 10,
}) => {
  return resolver.queryMultipleAddress(addresses, options);
}

// named export for Address model
export const Address = address;

