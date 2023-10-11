import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUpdatePost } from "@/context/UpdatePostProvider";
import { DataPost } from "@/pages/admin-portal/posts";
import { Dialog } from "../ui/dialog";
import EditPostWindow from "../EditPostWindow";
import { Dispatch, SetStateAction, useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  setData: Dispatch<SetStateAction<DataPost[]>>;
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  setData,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });
  const {
    setPostIndex,
    setPostId,
    setPostTitle,
    setPostCaption,
    setDefaultPostImage,
    setDefaultProducts,
    setDefaultPostTitle,
    setDefaultPostCaption,
    resetStates,
    toggle,
    toggleValue,
    setStatus,
  } = useUpdatePost();

  async function setUpEditWindow(post: DataPost, index: number) {
    setPostIndex(index);
    setPostId(post.id);
    setPostTitle(post.title);
    setPostCaption(post.caption);
    setDefaultPostTitle(post.title);
    setDefaultPostCaption(post.caption);
    setDefaultPostImage(post.image.url);
    setDefaultProducts(() =>
      post.product.map(({ id, title, link, image }) => ({
        id,
        title,
        link,
        image: null,
        defaultTitle: title,
        defaultLink: link,
        defaultImage: image,
      }))
    );
    setStatus(post.status);
  }
  return (
    <div className="mt-4 rounded-md border">
      <Dialog
        onOpenChange={(state) => {
          if (!state) {
            resetStates();
          }
          toggle();
        }}
        open={toggleValue}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, i) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => {
                    setUpEditWindow(row.original as DataPost, i);
                    toggle();
                  }}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <EditPostWindow setData={setData} />
      </Dialog>
    </div>
  );
}
