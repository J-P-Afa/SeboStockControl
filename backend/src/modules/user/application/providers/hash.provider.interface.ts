// No common result needed for now

export const HASH_PROVIDER = 'HASH_PROVIDER';

export interface IHashProvider {
  /**
   * Hashes a plain text string.
   */
  hash(plainText: string): Promise<string>;

  /**
   * Compares a plain text string against a hashed string.
   */
  compare(plainText: string, hash: string): Promise<boolean>;
}
