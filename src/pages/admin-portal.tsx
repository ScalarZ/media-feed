import { useState, useEffect } from "react";
import { DataTable } from "@/components/Admin/DataTable";
import { columns } from "@/components/Admin/DataTable/Columns";
import Filter from "@/components/Admin/Filter";
import { Separator } from "@/components/ui/separator";
import { useToggle } from "@/hooks/useToggle";
import { useUser } from "@/hooks/useUser";
import { Image, Post, Product } from "@/schema";
import { trpc } from "@/utils/trpc";

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
      <h1 className="text-2xl text-center font-semibold">Admin Portal</h1>
      <Filter user={user} setData={setData} />
      <Separator />
      {data.length ? (
        <DataTable columns={columns} data={data} setData={setData} />
      ) : null}
    </div>
  );
}
