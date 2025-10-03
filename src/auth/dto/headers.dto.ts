import { Expose, Transform } from 'class-transformer';
import { IsString } from 'class-validator';

export class HeadersDto {
  @IsString()
  // Node/Express lowercases header names; map from 'authorization'
  @Expose({ name: 'authorization' })
  @Transform(({ value }) => {
    if (typeof value !== 'string') return '';
    // Expect format: 'Bearer <token>'
    const prefix = 'Bearer ';
    return value.startsWith(prefix) ? value.slice(prefix.length).trim() : value;
  })
  accessToken: string;
}
