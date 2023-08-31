import { User } from "next-auth";

declare module "next-auth" {
  interface AuthUser extends User {
    email: string;
    image: string | null;
    name: string;
    username: string | null;
    phone: string | null;
  }
}

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

export interface _Product {
  id: number;
  image: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  link: string;
  title: string | null;
  postId: string;
}

export type Product = {
  title: string;
  link: string;
  image: File | null;
};

export type DefaultProduct = {
  id: number;
  title: string | null;
  link: string;
  image: File | null;
  defaultTitle: string | null;
  defaultLink: string;
  defaultImage: string | null;
};
