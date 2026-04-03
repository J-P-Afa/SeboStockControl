export class IsbnUtils {
  /**
   * Converte ISBN-13 para ISBN-10.
   * Só funciona para ISBNs que começam com 978.
   */
  static isbn13To10(isbn13: string): string | null {
    const clean = isbn13.replace(/[^0-9]/g, '');
    if (clean.length !== 13 || !clean.startsWith('978')) {
      return null;
    }

    // Pega os 9 dígitos centrais (pulando o prefixo 978)
    const nineDigits = clean.substring(3, 12);

    // Calcula o dígito verificador do ISBN-10
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(nineDigits[i], 10) * (10 - i);
    }

    const remainder = sum % 11;
    const checkDigit = 11 - remainder;

    let checkStr: string;
    if (checkDigit === 10) {
      checkStr = 'X';
    } else if (checkDigit === 11) {
      checkStr = '0';
    } else {
      checkStr = checkDigit.toString();
    }

    return nineDigits + checkStr;
  }

  /**
   * Converte ISBN-10 para ISBN-13.
   * Adiciona o prefixo 978.
   */
  static isbn10To13(isbn10: string): string | null {
    const clean = isbn10.replace(/[^0-9X]/gi, '');
    if (clean.length !== 10) {
      return null;
    }

    const nineDigits = clean.substring(0, 9);
    const prefix = '978' + nineDigits;

    // Calcula o dígito verificador do ISBN-13
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const factor = i % 2 === 0 ? 1 : 3;
      sum += parseInt(prefix[i], 10) * factor;
    }

    const remainder = sum % 10;
    const checkDigit = (10 - remainder) % 10;

    return prefix + checkDigit.toString();
  }

  /**
   * Garante que ambos os campos de ISBN estejam preenchidos se possível.
   */
  static populateBoth(isbn: string): {
    isbn10: string | null;
    isbn13: string | null;
  } {
    const clean = isbn.replace(/[^0-9X]/gi, '');
    if (clean.length === 10) {
      return {
        isbn10: clean,
        isbn13: this.isbn10To13(clean),
      };
    } else if (clean.length === 13) {
      return {
        isbn10: this.isbn13To10(clean),
        isbn13: clean,
      };
    }
    return { isbn10: null, isbn13: null };
  }
}
