"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { users } from "@/lib/schema";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateRole, deleteUser } from "./actions";
import { userRole, type UserRole } from "@/lib/schema";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

type User = typeof users.$inferSelect;

const RoleCell = ({ row }: { row: Row<User> }) => {
  const role = row.getValue("role") as string;
  return (
    <Select
      defaultValue={role}
      onValueChange={async (value: UserRole) => {
        try {
          await updateRole(row.original.id, value);
          toast.success(`Role updated to ${value}`);
        } catch {
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
};

const ActionsCell = ({ row }: { row: Row<User> }) => {
  const router = useRouter();
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the user {row.original.email}. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              try {
                await deleteUser(row.original.id);
                toast.success("User deleted successfully");
                router.refresh();
              } catch {
                toast.error("Failed to delete user");
              }
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const columns: ColumnDef<User>[] = [
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
    cell: RoleCell,
  },
  {
    accessorKey: "emailVerified",
    header: "Email Verified",
    cell: ({ row }) => {
      const verified = row.getValue("emailVerified");
      return verified ? "Yes" : "No";
    },
  },
  {
    id: "actions",
    cell: ActionsCell,
  },
]; 