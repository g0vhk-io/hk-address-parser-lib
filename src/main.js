import resolver from "./address-resolver";
import address from './models/address';


// named export for the parse function
export const parse = (address) => {
	return resolver.queryAddress(address);
}

// named export for Address model
export const Address = address;

