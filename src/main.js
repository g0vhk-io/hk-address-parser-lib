import resolver from "./address-resolver";
import address from './models/address';

export default function parse (address) {
	return resolver.queryAddress(address);
}


// named export for Address model
export const Address = address;

