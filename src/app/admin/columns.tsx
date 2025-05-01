"use client";

import { ColumnDef } from "@tanstack/react-table";
import { users } from "@/lib/schema";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateRole } from "./actions";
import { userRole, type UserRole } from "@/lib/schema";
import { toast } from "sonner";

export const columns: ColumnDef<typeof users.$inferSelect>[] = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Select
          defaultValue={role}
          onValueChange={async (value: UserRole) => {
            try {
              await updateRole(row.original.id, value);
              toast.success(`Role updated to ${value}`);
            } catch (error) {
              toast.error("Failed to update role");
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(userRole).map((role) => (
              <SelectItem key={role} value={role}>
                <Badge variant={role === userRole.ADMIN ? "default" : "secondary"}>
                  {role}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  },
  {
    accessorKey: "emailVerified",
    header: "Email Verified",
    cell: ({ row }) => {
      const verified = row.getValue("emailVerified");
      return verified ? "Yes" : "No";
    },
  },
]; 