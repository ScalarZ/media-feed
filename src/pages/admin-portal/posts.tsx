import { useState, useEffect } from "react";
import PostsTable from "@/components/Admin/PostsTable";
import { columns } from "@/components/Admin/Columns/PostsTableColumns";
import PostsFilter from "@/components/Admin/PostsFilter";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/useUser";
import { Image, Post, Product } from "@/schema";
import NavBar from "@/components/Admin/NavBar";

export interface DataPost extends Post {
  user: {
    id: string;
    name: string;
  } | null;
  createAt: string | null;
  updateAt: string | null;
  image: Image & { createdAt: string | null };
  product: (Product & { createAt: string | null; updateAt: string | null })[];
}

export default function AdminPortal() {
  const user = useUser();
  const [data, setData] = useState<DataPost[]>([]);

  return (
    <div className="p-4">
      <NavBar />
      <PostsFilter user={user} setData={setData} />
      <Separator />
      {data.length ? (
        <PostsTable columns={columns} data={data} setData={setData} />
      ) : null}
    </div>
  );
}
