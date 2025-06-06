export class ImageLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageLimitError";
    Object.setPrototypeOf(this, ImageLimitError.prototype);
  }
}
