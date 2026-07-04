export interface Event {
  databaseId: string;
  slug: string;
  title: string;
  content: string;
  eventDate: string;
  featuredImage: FeaturedImage | null;
  categories: Category[];
}

export interface Page {
  databaseId: string;
  slug: string;
  title: string;
  content: string;
  featuredImage: FeaturedImage | null;
  gallery: Image[];
}

export interface Post {
  databaseId: string;
  slug: string;
  date: string;
  title: string;
  content: string;
  featuredImage: FeaturedImage | null;
  categories: Category[];
}

export interface FeaturedImage {
  databaseId: string;
  sourceUrl: string;
}

export interface Image {
  databaseId: string;
  sourceUrl: string;
}

export interface Category {
  databaseId: string;
  slug: string;
  name: string;
}

export interface SEOMetadata {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
}
