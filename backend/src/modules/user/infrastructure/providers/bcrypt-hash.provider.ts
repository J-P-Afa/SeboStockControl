import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { IHashProvider } from '../../application/providers/hash.provider.interface';

@Injectable()
export class BcryptHashProvider implements IHashProvider {
  private readonly saltRounds = 10;

  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.saltRounds);
  }

  async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
