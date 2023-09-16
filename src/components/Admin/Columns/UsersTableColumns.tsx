import { ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";
import { DataUser } from "@/pages/admin-portal/users";

export const columns: ColumnDef<DataUser>[] = [
  {
    accessorKey: "name",
    header: "Username",
    cell: ({ row }) => (
      <div className="whitespace-nowrap">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "isEmailVerified",
    header: "Verified",
    cell: ({ row }) => (
      <span
        className={clsx("cursor-pointer", {
          "text-green-500": row.original.isEmailVerified,
          "text-destructive": !row.original.isEmailVerified,
        })}
      >
        {row.getValue("isEmailVerified") ? "true" : "false"}
      </span>
    ),
  },
  {
    accessorKey: "id",
    header: "User ID",
    cell: ({ row }) => (
      <div className="whitespace-nowrap">{row.getValue("id")}</div>
    ),
  },
];
