import { nanoid, customAlphabet } from 'nanoid'

export const CHA_NUM = '0123456789';
export const CHA_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const CHA_LOWER = 'abcdefghijklmnopqrstuvwxyz';

export function uid(prefix = '', size = 10, alphabet?: string) {
  if (alphabet == null || alphabet.length === 0) {
    return `${prefix}${nanoid(size)}`;
  }
  const customNanoid = customAlphabet(alphabet, size)
  return `${prefix}${customNanoid()}`;
}
