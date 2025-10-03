import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodType } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: any) {
    const result = this.schema.safeParse(value);

    if (result.success) {
      return result.data; // ✅ return only validated data
    }
    // ✅ Throw proper error with messages
    throw new BadRequestException(result.error.issues);
  }
}
