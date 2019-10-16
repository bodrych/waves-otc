import { keyPair, signBytes, randomBytes, base58Encode } from '@waves/ts-lib-crypto'


export default {
	randomValue: (len) => {
		return base58Encode(randomBytes(len))
	},
	keyPair,
	signBytes,
}