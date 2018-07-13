import { HttpRequest, HttpStatusCode } from 'azure-functions-ts-essentials';

export class HttpRequestWrapper implements HttpRequest {
  method: undefined;
  statusCode: HttpStatusCode;
  body: any;

  send(statusCode: HttpStatusCode, body: any): void {
    this.statusCode = statusCode;
    this.body = body;
  }

  status(statusCode: HttpStatusCode): void {
    this.statusCode = statusCode;
  }

  end(): void {}
}
