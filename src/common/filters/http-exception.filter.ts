// import {
//   ArgumentsHost,
//   Catch,
//   ExceptionFilter,
//   HttpException,
//   HttpStatus,
// } from '@nestjs/common';

// @Catch()
// export class AllExceptionsFilter implements ExceptionFilter {
//   catch(exception: unknown, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse();
//     const request = ctx.getRequest();

//     const isHttp = exception instanceof HttpException;
//     const status = isHttp
//       ? exception.getStatus()
//       : HttpStatus.INTERNAL_SERVER_ERROR;

//     const exceptionResponse = isHttp
//       ? (exception as HttpException).getResponse()
//       : undefined;
//     const message = ((): string => {
//       if (typeof exceptionResponse === 'string') return exceptionResponse;
//       if (exceptionResponse && typeof exceptionResponse === 'object') {
//         const m = (exceptionResponse as any).message;
//         if (Array.isArray(m)) return m.join(', ');
//         if (typeof m === 'string') return m;
//       }
//       if (isHttp) return (exception as HttpException).message;
//       return 'Internal server error';
//     })();

//     const body = {
//       data: null,
//       message,
//       status,
//       // Optional: include trace identifiers for debugging in non-production
//       // path: request.url,
//       // timestamp: new Date().toISOString(),
//     };

//     response.status(status).json(body);
//   }
// }
