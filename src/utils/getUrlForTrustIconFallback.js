import { toChecksumAddress } from '../handlers/web3';

export default function getUrlForTrustIconFallback(address) {
  if (!address) return null;
  const checksummedAddress = toChecksumAddress(address);
  return `https://raw.githubusercontent.com/LastHyphen/assets/master/blockchains/ethereum/assets/${checksummedAddress}/logo.png`;
}
