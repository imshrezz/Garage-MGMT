import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import ViewUserModal from "./ViewUserModal";
import EditUserModal from "./EditUserModal";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type User = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: string;
};

type UserListProps = {
  searchQuery: string;
};

export const UserList = ({ searchQuery }: UserListProps) => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/garage-users/users");
      const rawCustomers = res.data.users || [];
      const mapped = rawCustomers
        .map((customer: any) => ({
          ...customer,
          id: customer._id,
        }))
        .reverse();
      setCustomers(mapped);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    const query = searchQuery.toLowerCase();
    return customers.filter(
      (customer) =>
        (customer.fullName?.toLowerCase() || "").includes(query) ||
        (customer.phone || "").includes(query) ||
        (customer.email?.toLowerCase() || "").includes(query)
    );
  }, [searchQuery, customers]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredCustomers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleUpdateCustomer = async (updatedCustomer: Customer) => {
    try {
      const { id, ...rest } = updatedCustomer;
      await api.put(`/customers/${id}`, rest);
      toast.success("Customer updated successfully");
      fetchCustomers();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update customer");
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    setLoadingId(id);
    try {
      await api.delete(`/customers/delete/${id}`);
      toast.success("Customer deleted successfully");
      fetchCustomers();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete customer");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteCustomerDialog = async () => {
    if (!selectedCustomer) return;
    try {
      await api.delete(`/garage-users/${selectedCustomer.id}`);
      toast.success("User deleted successfully");
      fetchCustomers();
      setDeleteOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleEditSubmit = async (updatedCustomer: User) => {
    try {
      const { id, ...rest } = updatedCustomer;
      await api.put(`/garage-users/${id}`, rest);
      toast.success("Customer updated successfully");
      fetchCustomers();
      setEditOpen(false);
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    {customer.fullName}
                  </TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.role}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {customer.email || "—"}
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="View"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setViewOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setEditOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setDeleteOpen(true);
                        }}
                        disabled={loadingId === customer.id}
                      >
                        {loadingId === customer.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {!loading && filteredCustomers.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + itemsPerPage, filteredCustomers.length)} of{" "}
            {filteredCustomers.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <EditUserModal
        open={!!editOpen}
        onClose={() => setEditOpen(false)}
        customer={selectedCustomer}
        onSave={handleEditSubmit}
      />
      <ViewUserModal
        open={!!viewOpen}
        onClose={() => setViewOpen(false)}
        customer={selectedCustomer}
      />

      {/* Delete Modal */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this customer?</p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCustomerDialog}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserList;
