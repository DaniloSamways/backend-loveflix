export interface Content {
  title: string;
  subtitle?: string;
  thumbnail: string;
  sections?: {
    title: string;
    photos: {
      title: string;
      image_src?: string;
    }[];
  }[];
}
