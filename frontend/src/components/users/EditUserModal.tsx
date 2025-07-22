// components/users/EditUserModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import User from "./UserList";

type Props = {
  open: boolean;
  onClose: () => void;
  customer: User | null;
  onSave: (updatedCustomer: User) => void;
};

const EditCustomerModal = ({ open, onClose, customer, onSave }: Props) => {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    if (customer) {
      setForm({
        fullName: customer.fullName || "",
        phone: customer.phone || "",
        email: customer.email || "",
        role: customer.role || "",
      });
    }
  }, [customer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (customer) {
      const updatedCustomer = {
        ...customer,
        ...form,
      };
      onSave(updatedCustomer);
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
          />
          <Input
            name="phone"
            placeholder="Mobile"
            value={form.phone}
            onChange={handleChange}
          />
          <Input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCustomerModal;
