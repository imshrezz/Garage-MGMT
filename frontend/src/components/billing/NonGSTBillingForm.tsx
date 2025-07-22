import { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import api from "@/lib/axios";
import CreateItemDialog from "./CreateItemDialog";

// Schema for non-GST billing items
const nonGSTBillingItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.string().min(1, "Quantity is required"),
  rate: z.string().min(1, "Rate is required"),
  itemId: z.string().optional(),
});

// Schema for the entire form
const nonGSTBillingFormSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  vehicleId: z.string().min(1, "Vehicle is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string().min(1, "Date is required"),
  items: z.array(nonGSTBillingItemSchema).min(1, "Add at least one item"),
  additionalNotes: z.string().optional(),
  mechanicCharge: z.string().optional(),
});

type NonGSTBillingFormValues = z.infer<typeof nonGSTBillingFormSchema>;

// Add Item type
type Item = {
  _id: string;
  description: string;
  rate: number;
};

// Add garage details type
type Garage = {
  name: string;
  address: string;
  gstin: string;
  state: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
};

// Add CreateItemPayload type
type CreateItemPayload = {
  description: string;
  hsnCode: string;
  rate: number;
  gstPercent: number;
  quantity: number;
};

const NonGSTBillingForm = () => {
  const [customers, setCustomers] = useState<
    {
      id: string;
      name: string;
      mobile?: string;
      address?: string;
      vehicles: any[];
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState<typeof customers>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCustomerSelected, setIsCustomerSelected] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [showItemSuggestions, setShowItemSuggestions] = useState<number | null>(null);
  const [invoiceSNumber, setInvoiceSNumber] = useState<string | null>("");
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const itemSuggestionsRef = useRef<HTMLDivElement>(null);
  const [itemInputRefs, setItemInputRefs] = useState<{
    [key: number]: HTMLInputElement | null;
  }>({});
  const [garageDetails, setGarageDetails] = useState<Garage | null>(null);
  const [isCreateItemDialogOpen, setIsCreateItemDialogOpen] = useState(false);
  const [creatingItemIndex, setCreatingItemIndex] = useState<number | null>(null);

  // Generate invoice number on component mount
  const generateInvoiceNumber = async () => {
    const prefix = "BILL-";
    try {
      const { data } = await api.get("/nongstbills/count");
      if (data && typeof data.count === 'number') {
        const count = data.count;
        const newInvoiceNumber = `${prefix}-${count + 1}`;
        setInvoiceSNumber(newInvoiceNumber);
        return newInvoiceNumber;
      } else {
        throw new Error("Invalid count data received");
      }
    } catch (err) {
      console.error("Error generating invoice number:", err);
      // Fallback to a timestamp-based number if the API call fails
      const timestamp = new Date().getTime();
      const fallbackNumber = `${prefix}-${timestamp}`;
      setInvoiceSNumber(fallbackNumber);
      return fallbackNumber;
    }
  };

  useEffect(() => {
    generateInvoiceNumber();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const form = useForm<NonGSTBillingFormValues>({
    resolver: zodResolver(nonGSTBillingFormSchema),
    defaultValues: {
      customerId: "",
      vehicleId: "",
      invoiceNumber: invoiceSNumber ?? "",
      invoiceDate: today,
      items: [
        {
          description: "",
          quantity: "1",
          rate: "0",
          itemId: "",
        },
      ],
      additionalNotes: "",
      mechanicCharge: "0",
    },
  });

  // Update invoiceNumber in form when invoiceSNumber changes
  useEffect(() => {
    if (invoiceSNumber) {
      form.setValue("invoiceNumber", invoiceSNumber);
    }
  }, [invoiceSNumber, form]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await api.get("/customers/with-jobcards");
        if (data && data.customers && Array.isArray(data.customers)) {
          const customerList = data.customers.map((cust: any) => ({
            id: cust._id,
            name: cust.name,
            mobile: cust.mobile,
            address: cust.address,
            vehicles: cust.vehicles,
          }));
          setCustomers(customerList);
          setFilteredCustomers(customerList);
        } else {
          console.error("Invalid customer data format:", data);
          toast.error("Failed to load customers");
        }
      } catch (error) {
        console.error("Failed to fetch customers:", error);
        toast.error("Failed to load customers");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await api.get("/items");
        if (data && data.items && Array.isArray(data.items)) {
          const itemList = data.items.map((item: any) => ({
            _id: item._id,
            description: item.description,
            rate: item.rate,
          }));
          setItems(itemList);
          setFilteredItems(itemList);
        } else {
          console.error("Invalid items data format:", data);
          toast.error("Failed to load items");
        }
      } catch (error) {
        console.error("Failed to fetch items:", error);
        toast.error("Failed to load items");
      }
    };
    fetchItems();
  }, []);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // For customer suggestions
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }

      // For item suggestions
      if (
        itemSuggestionsRef.current &&
        !itemSuggestionsRef.current.contains(event.target as Node)
      ) {
        setShowItemSuggestions(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Add useEffect for item input refs
  useEffect(() => {
    const refs: { [key: number]: HTMLInputElement | null } = {};
    fields.forEach((_, index) => {
      refs[index] = null;
    });
    setItemInputRefs(refs);
  }, [fields]);

  // Update customer search effect
  useEffect(() => {
    if (!customerSearch.trim()) {
      setFilteredCustomers(customers);
      setShowSuggestions(false);
      return;
    }
    const filtered = customers.filter((c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase())
    );
    setFilteredCustomers(filtered);
    if (!isCustomerSelected) {
      setShowSuggestions(true);
    }
  }, [customerSearch, customers, isCustomerSelected]);

  // Update item search handler
  const handleItemSearch = (searchText: string, index: number) => {
    if (!searchText.trim()) {
      setFilteredItems(items);
      setShowItemSuggestions(null);
      return;
    }
    const filtered = items.filter((item) =>
      item.description.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredItems(filtered);
    if (filtered.length > 0 || searchText.trim()) {
      setShowItemSuggestions(index);
    } else {
      setShowItemSuggestions(null);
    }
  };

  // Add item selection handler
  const handleItemSelect = (item: Item, index: number) => {
    form.setValue(`items.${index}.description`, item.description);
    form.setValue(`items.${index}.rate`, item.rate.toString());
    form.setValue(`items.${index}.itemId`, item._id);
    setShowItemSuggestions(null);
    setFilteredItems(items);
  };

  const watchCustomerId = form.watch("customerId");
  const watchItems = form.watch("items");

  const filteredVehicles =
    customers.find((c) => c.id === watchCustomerId)?.vehicles || [];

  const calculateTotals = () => {
    let total = 0;
    const mechanicCharge = parseFloat(form.watch("mechanicCharge") || "0");

    watchItems.forEach((item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      total += quantity * rate;
    });

    return {
      subtotal: total.toFixed(2),
      mechanicCharge: mechanicCharge.toFixed(2),
      grandTotal: (total + mechanicCharge).toFixed(2),
    };
  };

  const { subtotal, mechanicCharge, grandTotal } = calculateTotals();

  // Add useEffect to fetch garage details
  useEffect(() => {
    const fetchGarageDetails = async () => {
      try {
        const { data } = await api.get("/garage");
        console.log("Raw garage details from API:", data); // Debug log
        if (data && data.garage) {
          const garageData = {
            name: data.garage.garageName || "",
            address: data.garage.address || "",
            gstin: data.garage.gstNumber || "",
            state: data.garage.state || "",
            city: data.garage.city || "",
            postalCode: data.garage.zipCode || "",
            phone: data.garage.phone || "",
            email: data.garage.email || ""
          };
          console.log("Processed garage details:", garageData); // Debug log
          setGarageDetails(garageData);
        } else {
          console.error("No garage data found in response:", data);
          toast.error("Garage details not found");
        }
      } catch (error) {
        console.error("Failed to fetch garage details:", error);
        toast.error("Failed to load garage details");
      }
    };
    fetchGarageDetails();
  }, []);

  const onSubmit = async (values: NonGSTBillingFormValues) => {
    try {
      setIsSubmitting(true);
      const selectedCustomer = customers.find(
        (c) => c.id === values.customerId
      );

      const selectedVehicle = filteredVehicles.find(
        (v) => v._id === values.vehicleId
      );

      if (!selectedCustomer || !selectedVehicle) {
        toast.error("Customer or vehicle not found");
        return;
      }

      if (!garageDetails) {
        toast.error("Garage details not found");
        return;
      }

      // Format items to match backend expectations - just send the item IDs
      const itemIds = values.items
        .map((item) => item.itemId)
        .filter((id) => id);

      // Calculate total amount
      const itemsTotal = values.items.reduce((sum, item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const rate = parseFloat(item.rate) || 0;
        return sum + quantity * rate;
      }, 0);

      const mechanicCharge = parseFloat(values.mechanicCharge || "0");
      const totalAmount = itemsTotal + mechanicCharge;

      // Log garage details before creating payload
      console.log("Garage details before creating payload:", garageDetails);

      const payload = {
        customer: values.customerId,
        vehicleId: values.vehicleId,
        invoiceNo: values.invoiceNumber,
        invoiceDate: values.invoiceDate,
        items: itemIds,
        totalAmount: totalAmount,
        additionalNotes: values.additionalNotes || "",
        mechanicCharge: mechanicCharge,
        garage: {
          name: garageDetails?.name || "",
          address: garageDetails?.address || "",
          city: garageDetails?.city || "",
          state: garageDetails?.state || "",
          postalCode: garageDetails?.postalCode || "",
          gstin: garageDetails?.gstin || "",
          phone: garageDetails?.phone || "",
          email: garageDetails?.email || ""
        },
        customerDetails: {
          name: selectedCustomer.name,
          mobile: selectedCustomer.mobile || "",
          address: selectedCustomer.address || "",
        },
        vehicleDetails: {
          number: selectedVehicle.vehicleNumber,
          brand: selectedVehicle.brand,
          model: selectedVehicle.model,
          registrationDate: selectedVehicle.registrationDate || "",
          insuranceExpiry: selectedVehicle.insuranceExpiry || "",
        },
      };

      console.log("Final payload:", payload); // Debug log

      // Create Non-GST bill
      const response = await api.post("nongstbills", payload);

      if (!response.data || !response.data._id) {
        throw new Error("No bill ID received from server");
      }

      const billId = response.data._id;

      // Update job card status to Closed
      try {
        // First find the job card for this vehicle
        const jobCardResponse = await api.get(`/jobcards/by-vehicle/${selectedVehicle.vehicleNumber}`);
        if (jobCardResponse.data && jobCardResponse.data._id) {
          await api.put(`/jobcards/update-status/${jobCardResponse.data._id}`, {
            status: "Closed"
          });
          toast.success("Job card status updated to Closed");
        } else {
          console.error("No job card found for this vehicle");
        }
      } catch (error) {
        console.error("Error updating job card status:", error);
        // Don't throw error here, as the bill was created successfully
      }

      toast.success("Non-GST bill created successfully!");

      // Generate PDF
      try {
        const pdfResponse = await api.get(`/nongstbills/${billId}/pdf`, {
          responseType: "blob",
        });

        if (!pdfResponse.data) {
          throw new Error("No PDF data received");
        }

        const blob = new Blob([pdfResponse.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Non-GST-Bill-${values.invoiceNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success("PDF generated successfully!");
      } catch (pdfError) {
        console.error("Error generating PDF:", pdfError);
        toast.error("Failed to generate PDF. Please try again.");
      }

      // Reset form and generate new invoice number
      form.reset({
        customerId: "",
        vehicleId: "",
        invoiceNumber: invoiceSNumber ?? "",
        invoiceDate: today,
        items: [
          {
            description: "",
            quantity: "1",
            rate: "0",
            itemId: "",
          },
        ],
        additionalNotes: "",
        mechanicCharge: "0",
      });
      generateInvoiceNumber(); // Generate new invoice number after successful submission
    } catch (error) {
      console.error("Error creating Non-GST bill:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create Non-GST bill"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add handleCreateItem function
  const handleCreateItem = async (itemData: CreateItemPayload) => {
    try {
      const response = await api.post("/items/create", {
        description: itemData.description,
        hsnCode: itemData.hsnCode,
        rate: itemData.rate,
        gstPercent: itemData.gstPercent,
      });

      const createdItem = response.data.item;

      if (!createdItem) {
        throw new Error("No item data received from server");
      }

      // Add the new item to the items list
      setItems((prev) => [...prev, {
        _id: createdItem._id,
        description: createdItem.description,
        rate: createdItem.rate
      }]);

      // If we're creating an item for a specific index, update that row
      if (creatingItemIndex !== null) {
        form.setValue(`items.${creatingItemIndex}.description`, createdItem.description);
        form.setValue(`items.${creatingItemIndex}.rate`, createdItem.rate.toString());
        form.setValue(`items.${creatingItemIndex}.itemId`, createdItem._id);
      } else {
        // Otherwise, add it as a new row
        append({
          description: createdItem.description,
          quantity: "1",
          rate: createdItem.rate.toString(),
          itemId: createdItem._id,
        });
      }

      setShowItemSuggestions(null);
      setIsCreateItemDialogOpen(false);
      setCreatingItemIndex(null);

      toast.success("New item created successfully");
    } catch (error) {
      console.error("Error creating item:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create new item"
      );
    }
  };

  // Add dialog close handler
  const handleDialogClose = () => {
    setIsCreateItemDialogOpen(false);
    setCreatingItemIndex(null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">


            {/* Invoice Number */}
            <FormField
            control={form.control}
            name="invoiceNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Number</FormLabel>
                <FormControl>
                  <Input {...field} readOnly />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          {/* Customer */}
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel>Customer</FormLabel>
                <div className="relative">
                  {showSuggestions && customerSearch && !isCustomerSelected && (
                    <div
                      ref={suggestionsRef}
                      className="absolute z-50 w-full bottom-full mb-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
                      style={{ minHeight: "40px" }}
                    >
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer) => (
                          <div
                            key={customer.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                            onClick={() => {
                              field.onChange(customer.id);
                              setCustomerSearch(customer.name);
                              setShowSuggestions(false);
                              setIsCustomerSelected(true);
                              setFilteredCustomers(customers);
                            }}
                          >
                            <div className="font-medium">{customer.name}</div>
                            {customer.mobile && (
                              <div className="text-sm text-gray-500">
                                {customer.mobile}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500 text-center">
                          No customers found
                        </div>
                      )}
                    </div>
                  )}
                  <FormControl>
                    <Input
                      {...field}
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        if (!e.target.value) {
                          field.onChange("");
                          setIsCustomerSelected(false);
                        }
                      }}
                      onFocus={() => {
                        if (customerSearch && !isCustomerSelected) {
                          setShowSuggestions(true);
                        }
                      }}
                      placeholder="Search customer..."
                      className="w-full"
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Vehicle */}
          <FormField
            control={form.control}
            name="vehicleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!watchCustomerId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Vehicle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredVehicles.map((vehicle) => (
                      <SelectItem key={vehicle._id} value={vehicle._id}>
                        {vehicle.model.toUpperCase()} (
                        {vehicle.vehicleNumber.toUpperCase()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

        

          {/* Invoice Date */}
          <FormField
            control={form.control}
            name="invoiceDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Date</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Items</h3>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setCreatingItemIndex(null);
                  setIsCreateItemDialogOpen(true);
                }}
              >
                <Plus size={16} /> Create Item
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() =>
                  append({
                    description: "",
                    quantity: "1",
                    rate: "0",
                    itemId: "",
                  })
                }
              >
                <Plus size={16} /> Add Item
              </Button>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Qty</th>
                  <th className="px-4 py-2 text-left">Rate (₹)</th>
                  <th className="px-4 py-2 text-right">Amount (₹)</th>
                  <th className="px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => {
                  const quantity =
                    parseFloat(form.watch(`items.${index}.quantity`)) || 0;
                  const rate =
                    parseFloat(form.watch(`items.${index}.rate`)) || 0;
                  const amount = quantity * rate;

                  return (
                    <tr key={field.id} className="border-t">
                      <td className="px-3 py-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem className="mb-0">
                              <div className="relative">
                                {showItemSuggestions === index && (
                                  <div
                                    ref={itemSuggestionsRef}
                                    className="fixed z-[100] bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
                                    style={{
                                      minHeight: "40px",
                                      width:
                                        itemInputRefs[index]?.offsetWidth ||
                                        "100%",
                                      left: itemInputRefs[
                                        index
                                      ]?.getBoundingClientRect().left,
                                      top:
                                        (itemInputRefs[
                                          index
                                        ]?.getBoundingClientRect().top || 0) -
                                        5,
                                    }}
                                  >
                                    {filteredItems.length > 0 ? (
                                      filteredItems.map((item) => (
                                        <div
                                          key={item._id}
                                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                                          onClick={() =>
                                            handleItemSelect(item, index)
                                          }
                                        >
                                          <div className="font-medium">
                                            {item.description}
                                          </div>
                                          <div className="text-sm text-gray-500">
                                            Rate: ₹{item.rate}
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="px-4 py-2 text-gray-500 text-center">
                                        No items found
                                      </div>
                                    )}
                                  </div>
                                )}
                                <FormControl>
                                  <Input
                                    {...field}
                                    ref={(el) => {
                                      itemInputRefs[index] = el;
                                    }}
                                    placeholder="Item description"
                                    onChange={(e) => {
                                      field.onChange(e);
                                      handleItemSearch(e.target.value, index);
                                    }}
                                    onFocus={() => {
                                      if (field.value) {
                                        handleItemSearch(field.value, index);
                                      }
                                    }}
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </td>
                      <td className="px-3 py-2" style={{ width: "80px" }}>
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem className="mb-0">
                              <FormControl>
                                <Input {...field} type="number" min="1" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </td>
                      <td className="px-3 py-2" style={{ width: "100px" }}>
                        <FormField
                          control={form.control}
                          name={`items.${index}.rate`}
                          render={({ field }) => (
                            <FormItem className="mb-0">
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </td>
                      <td className="px-4 py-2 text-right font-medium">
                        ₹{amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="additionalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter any additional notes or special instructions"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Total */}
        <div className="border rounded-md p-4 space-y-2 bg-muted/20">
          <div className="flex justify-between">
            <span className="font-medium">Subtotal:</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Mechanic Charge:</span>
            <div className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="mechanicCharge"
                render={({ field }) => (
                  <FormItem className="mb-0">
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-32"
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          form.trigger("mechanicCharge");
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total Amount:</span>
            <span>₹{grandTotal}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            * This is a non-GST invoice. No tax is applicable.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Generating Bill..." : "Generate Non-GST Bill"}
          </Button>
        </div>

        <CreateItemDialog
          open={isCreateItemDialogOpen}
          onOpenChange={handleDialogClose}
          onSubmit={handleCreateItem}
          initialData={{
            description: "",
            hsnCode: "",
            rate: 0,
            gstPercent: 18,
            quantity: 1,
          }}
        />
      </form>
    </Form>
  );
};

export default NonGSTBillingForm;
