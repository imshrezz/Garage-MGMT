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
  password: string;
  role: string;
  dateAdded: string;
};

type ViewCustomerModalProps = {
  open: boolean;
  onClose: () => void;
  customer: User | null;
};

const ViewUserModal = ({ open, onClose, customer }: ViewCustomerModalProps) => {
  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <strong>Full Name:</strong> {customer.fullName}
          </div>
          <div>
            <strong>Mobile:</strong> {customer.phone}
          </div>
          <div>
            <strong>Email:</strong> {customer.email || "—"}
          </div>
          <div>
            <strong>Role:</strong> {customer.role || "—"}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewUserModal;
