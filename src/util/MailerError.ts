export class MailerError {
  code: string;
  status: number;
  message: string;

  static new(message: string, status = 500, code = 'unknown-error'): MailerError {
    const e = new MailerError();
    e.code = code;
    e.message = message;
    e.status = status;

    return e;
  }

  public toString() {
    return `[${this.status}] ${this.code || ''} ${this.message}`
  }
}