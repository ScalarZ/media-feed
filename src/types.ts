export type User = {
  id: string;
  username: string;
  email: string;
};

export type Post = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  caption: string;
  userId: string;
  image: Image;
  product: _Product[];
};

export type Image = {
  id: number;
  createdAt: string | null;
  updatedAt: string | null;
  url: string;
  postId: string;
};

export type _Product = {
  id: number;
  title: string;
  createdAt: string | null;
  updatedAt: string | null;
  link: string;
  image: string;
  postId: string;
};

export type Product = {
  title: string;
  link: string;
  image: File | null;
};

export type DefaultProduct = {
  id: number;
  title: string;
  link: string;
  image: File | null;
  defaultTitle: string;
  defaultLink: string;
  defaultImage: string;
};
