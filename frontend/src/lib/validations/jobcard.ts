import { z } from "zod";

export const jobCardFormSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  vehicleId: z.string().min(1, "Vehicle is required"),
  kmIn: z.string().min(1, "KM In is required"),
  serviceType: z.string().min(1, "Service Type is required"),
  complaintDescription: z.string().min(1, "Complaint description is required"),
  estimatedDeliveryDate: z.string().min(1, "Estimated delivery date is required"),
  mechanicId: z.string().min(1, "Mechanic is required"),
});
