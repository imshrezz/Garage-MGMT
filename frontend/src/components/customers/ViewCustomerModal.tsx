import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";

type Vehicle = {
  vehicleNumber: string;
  brand: string;
  model: string;
  fuelType: string;
  vehicleType: string;
  registrationDate: string;
  insuranceExpiry: string;
};

type Customer = {
  id: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  vehicles: Vehicle[];
  dateAdded: string;
};

type ViewCustomerModalProps = {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
};

const ViewCustomerModal = ({
  open,
  onClose,
  customer,
}: ViewCustomerModalProps) => {
  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <strong>Name:</strong> {customer.name}
          </div>
          <div>
            <strong>Mobile:</strong> {customer.mobile}
          </div>
          <div>
            <strong>Email:</strong> {customer.email || "—"}
          </div>
          <div>
            <strong>Address:</strong> {customer.address || "—"}
          </div>
          <div>
            <strong>Vehicles:</strong>
            <div className="flex flex-col gap-1 mt-1">
              {customer.vehicles?.length > 0 ? (
                customer.vehicles.map((vehicle) => (
                  <Badge
                    key={vehicle.vehicleNumber}
                    variant="outline"
                    className="w-fit"
                  >
                    <Car className="w-3 h-3 mr-1" />
                    {vehicle.vehicleNumber} - {vehicle.brand} {vehicle.model}
                  </Badge>
                ))
              ) : (
                <span>—</span>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewCustomerModal;
