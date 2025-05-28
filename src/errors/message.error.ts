export class MessageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MessageError";
    Object.setPrototypeOf(this, MessageError.prototype);
  }
}
