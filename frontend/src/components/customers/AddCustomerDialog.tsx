import { useState } from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { mobileNumberSchema, optionalMobileNumberSchema } from "@/lib/validations/common";

const vehicleSchema = z.object({
  vehicleNumber: z.string().min(5, { message: "Vehicle number is required" }),
  brand: z.string().optional(),
  model: z.string().optional(),
  fuelType: z.string().optional(),
  vehicleType: z.string().optional(),
  registrationDate: z.string().optional(),
  insuranceExpiry: z.string().optional(),
});

const customerFormSchema = z.object({
  // Customer Details
  name: z.string().min(2, { message: "Name is required" }),
  mobile: mobileNumberSchema,
  alternateNumber: optionalMobileNumberSchema,
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .optional()
    .or(z.literal("")),
  address: z.string().optional(),

  // Vehicle Details
  vehicles: z.array(vehicleSchema).min(1, "At least one vehicle is required"),
});

type AddCustomerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

const createCustomer = async (data: any) => {
  const response = await api.post("/customers", data);
  return response.data;
};

export function AddCustomerDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddCustomerDialogProps) {
  const [activeTab, setActiveTab] = useState("customer");

  const form = useForm<z.infer<typeof customerFormSchema>>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      mobile: "",
      alternateNumber: "",
      email: "",
      address: "",
      vehicles: [
        {
          vehicleNumber: "",
          brand: "",
          model: "",
          fuelType: "Petrol",
          vehicleType: "Car",
          registrationDate: "",
          insuranceExpiry: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "vehicles",
  });

  async function onSubmit(data: z.infer<typeof customerFormSchema>) {
    const payload = {
      name: data.name,
      mobile: data.mobile,
      alternateNumber: data.alternateNumber,
      email: data.email || undefined,
      address: data.address,
      vehicles: data.vehicles.map(vehicle => ({
        ...vehicle,
        vehicleNumber: vehicle.vehicleNumber.toUpperCase(),
      })),
    };

    try {
      await createCustomer(payload);
      toast.success("Customer added successfully");
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error adding customer:", error);
      toast.error(error?.response?.data?.message || "Failed to add customer");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Add a new customer and their vehicle details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs
              defaultValue="customer"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="customer">Customer Details</TabsTrigger>
                <TabsTrigger value="vehicle">Vehicle Details</TabsTrigger>
              </TabsList>

              <TabsContent value="customer" className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Full Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Mobile Number <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="9876543210" 
                            {...field} 
                            onChange={(e) => {
                              // Remove any non-digit characters
                              const value = e.target.value.replace(/\D/g, '');
                              field.onChange(value);
                            }}
                            className={form.formState.errors.mobile ? "border-red-500" : field.value && /^[6-9]\d{9}$/.test(field.value) ? "border-green-500" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="alternateNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alternate Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="9876543210" 
                            {...field} 
                            onChange={(e) => {
                              // Remove any non-digit characters
                              const value = e.target.value.replace(/\D/g, '');
                              field.onChange(value);
                            }}
                            className={form.formState.errors.alternateNumber ? "border-red-500" : field.value && /^[6-9]\d{9}$/.test(field.value) ? "border-green-500" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Full address..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="button" onClick={() => setActiveTab("vehicle")}>
                    Next: Vehicle Details
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="vehicle" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Vehicles</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        vehicleNumber: "",
                        brand: "",
                        model: "",
                        fuelType: "Petrol",
                        vehicleType: "Car",
                        registrationDate: "",
                        insuranceExpiry: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Vehicle
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Vehicle {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name={`vehicles.${index}.vehicleNumber`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Vehicle Number <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="MH01AB1234" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`vehicles.${index}.brand`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Brand</FormLabel>
                            <FormControl>
                              <Input placeholder="Honda, Maruti, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`vehicles.${index}.model`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Model</FormLabel>
                            <FormControl>
                              <Input placeholder="City, Swift, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`vehicles.${index}.fuelType`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fuel Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select fuel type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Petrol">Petrol</SelectItem>
                                <SelectItem value="Diesel">Diesel</SelectItem>
                                <SelectItem value="CNG">CNG</SelectItem>
                                <SelectItem value="Electric">Electric</SelectItem>
                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`vehicles.${index}.vehicleType`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select vehicle type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Car">Car</SelectItem>
                                <SelectItem value="SUV">SUV</SelectItem>
                                <SelectItem value="Hatchback">Hatchback</SelectItem>
                                <SelectItem value="Sedan">Sedan</SelectItem>
                                <SelectItem value="Van">Van</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`vehicles.${index}.registrationDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Registration Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`vehicles.${index}.insuranceExpiry`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Insurance Expiry Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("customer")}
                  >
                    Back to Customer Details
                  </Button>
                </div>
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
              <Button type="submit">Save Customer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
