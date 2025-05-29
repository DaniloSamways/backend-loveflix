export class MessageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MessageError";
    console.log(message);
    Object.setPrototypeOf(this, MessageError.prototype);
  }
}
