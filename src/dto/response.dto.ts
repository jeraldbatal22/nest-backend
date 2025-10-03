export class ResponseDto<T> {
  status: string;
  message: string;
  data: T;
}
