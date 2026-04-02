import { IsbnUtils } from './isbn-utils';

describe('IsbnUtils', () => {
  describe('isbn13To10', () => {
    it('should convert ISBN-13 to ISBN-10 (example 1)', () => {
      // One Piece vol 107: 9786525918914 -> 652591891X
      const result = IsbnUtils.isbn13To10('9786525918914');
      expect(result).toBe('652591891X');
    });

    it('should convert ISBN-13 to ISBN-10 (example 2)', () => {
      // Naruto Gold 8: 9788542603330 -> 8542603338
      const result = IsbnUtils.isbn13To10('9788542603330');
      expect(result).toBe('8542603338');
    });

    it('should return null for invalid ISBN-13', () => {
      expect(IsbnUtils.isbn13To10('123')).toBeNull();
      expect(IsbnUtils.isbn13To10('9791234567890')).toBeNull(); // Only 978 is supported for simple conversion
    });
  });

  describe('isbn10To13', () => {
    it('should convert ISBN-10 to ISBN-13 (example 1)', () => {
      const result = IsbnUtils.isbn10To13('652591891X');
      expect(result).toBe('9786525918914');
    });

    it('should convert ISBN-10 to ISBN-13 (example 2)', () => {
      const result = IsbnUtils.isbn10To13('8542603338');
      expect(result).toBe('9788542603330');
    });
  });

  describe('populateBoth', () => {
    it('should populate both from ISBN-13', () => {
      const result = IsbnUtils.populateBoth('9786525918914');
      expect(result).toEqual({
        isbn10: '652591891X',
        isbn13: '9786525918914',
      });
    });

    it('should populate both from ISBN-10', () => {
      const result = IsbnUtils.populateBoth('8542603338');
      expect(result).toEqual({
        isbn10: '8542603338',
        isbn13: '9788542603330',
      });
    });
  });
});
