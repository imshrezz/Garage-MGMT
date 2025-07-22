import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { jobCardFormSchema } from "@/lib/validations/jobcard";
import { z } from "zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type AddJobCardDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Customer = {
  _id: string;
  name: string;
  vehicles: { _id: string; vehicleNumber: string }[];
};

type Mechanic = {
  _id: string;
  fullName: string;
};

export function AddJobCardDialog({
  open,
  onOpenChange,
}: AddJobCardDialogProps) {
  const [activeTab, setActiveTab] = useState("customer");
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);

  const form = useForm<z.infer<typeof jobCardFormSchema>>({
    resolver: zodResolver(jobCardFormSchema),
    defaultValues: {
      customerId: "",
      vehicleId: "",
      kmIn: "",
      serviceType: "",
      complaintDescription: "",
      estimatedDeliveryDate: "",
      mechanicId: "",
    },
  });

  const watchedCustomerId = form.watch("customerId");

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        const [customersRes, mechanicsRes] = await Promise.all([
          api.get("/customers"),
          api.get("/garage-users/mechanics"),
        ]);

        console.log("Customers response data:", customersRes.data);
        // Check if it's an array before setting it
        if (Array.isArray(customersRes.data.customers)) {
          setCustomers(customersRes.data.customers || []);
        } else {
          console.error("Expected customers array but got:", customersRes.data);
          setCustomers([]);
        }

        setMechanics(mechanicsRes.data.users);
      } catch (error: any) {
        toast.error(error.message);
      }
    };

    fetchData();
  }, [open]);

  const getVehiclesForCustomer = (customerId: string) => {
    const customer = customers.find((c) => c._id === customerId);
    return customer?.vehicles || [];
  };

  async function onSubmit(data: z.infer<typeof jobCardFormSchema>) {
    setIsLoading(true);
    try {
      const customer = customers.find((c) => c._id === data.customerId);
      const vehicle = customer?.vehicles.find((v) => v._id === data.vehicleId);

      const payload = {
        customer: data.customerId,
        vehicleNumber: vehicle?.vehicleNumber.toUpperCase(),
        jobInDate: new Date().toISOString(),
        estimatedDelivery: data.estimatedDeliveryDate,
        serviceType:
          data.serviceType === "General"
            ? "General Service"
            : data.serviceType === "Engine"
            ? "Engine Work"
            : data.serviceType === "Electrical"
            ? "Electrical Work"
            : data.serviceType === "AC"
            ? "AC Service"
            : "Other",
        status: "Pending",
        assignedMechanic: data.mechanicId,
        kmIn: Number(data.kmIn),
        jobDescription: data.complaintDescription,
      };

      await api.post("/jobcards/create", payload);

      toast.success(
        `Job card for ${customer?.name ?? "Unknown"}'s vehicle (${
          vehicle?.vehicleNumber ?? "Unknown"
        }) has been created.`
      );

      onOpenChange(false);
      form.reset();
      setActiveTab("customer");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Job Card</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new job card.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            {" "}
            <Tabs
              defaultValue="customer"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="jobcard">Job Card</TabsTrigger>
              </TabsList>

              <TabsContent value="customer" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer._id} value={customer._id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Vehicle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getVehiclesForCustomer(watchedCustomerId).map(
                            (vehicle) => (
                              <SelectItem key={vehicle._id} value={vehicle._id}>
                                {vehicle.vehicleNumber}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="button" onClick={() => setActiveTab("jobcard")}>
                    Next: JobCard Details
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="jobcard" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="kmIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>KM In</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter KM In" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Service Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="General">
                            General Service
                          </SelectItem>
                          <SelectItem value="Engine">Engine Work</SelectItem>
                          <SelectItem value="Electrical">
                            Electrical Work
                          </SelectItem>
                          <SelectItem value="AC">AC Service</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="complaintDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complaint Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the issue..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedDeliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Delivery Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mechanicId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign Mechanic</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Mechanic" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mechanics.map((mechanic) => (
                            <SelectItem key={mechanic._id} value={mechanic._id}>
                              {mechanic.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save JobCard</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
