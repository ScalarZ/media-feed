import { DataPost } from "@/pages/admin-portal/posts";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import clsx from "clsx";

export const columns: ColumnDef<DataPost>[] = [
  {
    accessorKey: "user.name",
    header: "Username",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <div className="whitespace-nowrap">
        {format(new Date(row.getValue("createdAt")), "dd/MM/yyyy")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={clsx("cursor-pointer", {
          "text-green-500": row.original.status === "PUBLISHED",
          "text-destructive": row.original.status === "REJECTED",
        })}
      >
        {row.getValue("status")}
      </span>
    ),
  },
  {
    accessorKey: "id",
    header: "PostId",
    cell: ({ row }) => (
      <div className="whitespace-nowrap">{row.getValue("id")}</div>
    ),
  },
];
