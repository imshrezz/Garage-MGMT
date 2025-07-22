import { useEffect, useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

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
import CreateItemDialog from "./CreateItemDialog";

// Add CreateItemPayload type
type CreateItemPayload = {
  description: string;
  hsnCode: string;
  rate: number;
  gstPercent: number;
  quantity: number;
};

// Schema
const billingItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  hsnCode: z.string().min(1, "HSN Code is required"),
  quantity: z.string().min(1, "Quantity is required"),
  rate: z.string().min(1, "Rate is required"),
  gstRate: z.string().min(1, "GST Rate is required"),
  itemId: z.string().min(1, "Item ID is required"),
});

const gstBillingFormSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  vehicleId: z.string().min(1, "Vehicle is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string().min(1, "Date is required"),
  customerGstin: z.string().optional(),
  items: z.array(billingItemSchema).min(1, "Add at least one item"),
  additionalNotes: z.string().optional(),
  mechanicCharge: z.string().optional(),
  // paymentMode: z.string().min(1, "Payment mode is required"),
});

type GSTBillingFormValues = z.infer<typeof gstBillingFormSchema>;

type Customer = {
  _id: string;
  name: string;
  mobile: string;
  address?: string;
  gstin?: string;
  vehicles: {
    _id: string;
    model: string;
    vehicleNumber: string;
    brand: string;
    registrationDate?: string;
    insuranceExpiry?: string;
  }[];
};

type Item = {
  _id: string;
  description: string;
  hsnCode: string;
  rate: number;
};

// Add payload type
type GstBillPayload = {
  customer: string;
  vehicleId: string;
  customerDetails: {
    name: string;
    mobile: string;
    gstin: string;
    address: string;
  };
  vehicleDetails: {
    number: string;
    brand: string;
    model: string;
    registrationDate: string;
    insuranceExpiry: string;
  };
  items: Array<{
    itemId: string;
    quantity: number;
    rate: number;
    gstPercent: number;
    actualAmount: number;
    gstAmount: number;
    totalAmount: number;
  }>;
  gst: number;
  invoiceNo: string;
  invoiceDate: string;
  totalAmount: number;
  // paymentMode: string;
  mechanicCharge: number;
};

const GSTBillingForm = () => {
  const [isCreateItemDialogOpen, setIsCreateItemDialogOpen] = useState(false);
  const [creatingItemIndex, setCreatingItemIndex] = useState<number | null>(0);
  const [invoiceSNumber, setInvoiceSNumber] = useState<string | null>("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<
    Customer["vehicles"]
  >([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCustomerSelected, setIsCustomerSelected] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [showItemSuggestions, setShowItemSuggestions] = useState<number | null>(
    null
  );
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const itemSuggestionsRef = useRef<HTMLDivElement>(null);
  const [itemInputRefs, setItemInputRefs] = useState<{
    [key: number]: HTMLInputElement | null;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update the click outside handler
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

  // Generate invoice number on component mount
  const generateInvoiceNumber = async () => {
    const prefix = "INV";
    try {
      const { data } = await api.get("/gstbills/count");
      const { count } = data;
      setInvoiceSNumber(`${prefix}-${count + 1}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch customers");
    }
  };

  useEffect(() => {
    generateInvoiceNumber();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const form = useForm<GSTBillingFormValues>({
    resolver: zodResolver(gstBillingFormSchema),
    defaultValues: {
      customerId: "",
      vehicleId: "",
      invoiceNumber: invoiceSNumber ?? "",
      invoiceDate: today,
      customerGstin: "",
      items: [
        {
          description: "",
          hsnCode: "",
          quantity: "1",
          rate: "0",
          gstRate: "18",
          itemId: "",
        },
      ],
      additionalNotes: "",
      mechanicCharge: "0",
      // paymentMode: "Cash",
    },
  });
  // Update invoiceNumber in form when invoiceSNumber changes
  useEffect(() => {
    if (invoiceSNumber) {
      form.setValue("invoiceNumber", invoiceSNumber);
    }
  }, [invoiceSNumber, form]);
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchCustomerId = form.watch("customerId");
  const watchItems = form.watch("items");

  // Load customers whoe job card are available
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await api.get("/customers/with-jobcards");
        setCustomers(data.customers || []);
        setFilteredCustomers(data.customers || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch customers");
      }
    };
    fetchCustomers();
  }, []);

  // Load items-materials in car
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await api.get("/items");
        setItems(data.items || []);
        setFilteredItems(data.items || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch items");
      }
    };
    fetchItems();
  }, []);

  // Update vehicle list and GSTIN when customer changes
  useEffect(() => {
    const customer = customers.find((c) => c._id === watchCustomerId);
    if (customer) {
      setFilteredVehicles(customer.vehicles || []);
      form.setValue("customerGstin", customer.gstin || "");
      form.setValue("vehicleId", "");
    } else {
      setFilteredVehicles([]);
      form.setValue("customerGstin", "");
      form.setValue("vehicleId", "");
    }
  }, [watchCustomerId, customers, form]);

  // Update the customer search effect
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

  // Update the item search handler
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

  // Add useEffect for item input refs
  useEffect(() => {
    const refs: { [key: number]: HTMLInputElement | null } = {};
    fields.forEach((_, index) => {
      refs[index] = null;
    });
    setItemInputRefs(refs);
  }, [fields]);

  // Update the item selection handler
  const handleItemSelect = (item: Item, index: number) => {
    form.setValue(`items.${index}.description`, item.description);
    form.setValue(`items.${index}.hsnCode`, item.hsnCode);
    form.setValue(`items.${index}.rate`, item.rate.toString());
    form.setValue(`items.${index}.itemId`, item._id);
    setShowItemSuggestions(null);
    setFilteredItems(items);
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalGST = 0;
    const mechanicCharge = parseFloat(form.watch("mechanicCharge") || "0");

    watchItems.forEach((item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const gstRate = parseFloat(item.gstRate) || 0;

      const itemTotal = quantity * rate;
      const itemGST = itemTotal * (gstRate / 100);

      subtotal += itemTotal;
      totalGST += itemGST;
    });

    const grandTotal = subtotal + totalGST + mechanicCharge;

    return {
      subtotal: subtotal.toFixed(2),
      totalGST: totalGST.toFixed(2),
      mechanicCharge: mechanicCharge.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
    };
  };

  const { subtotal, totalGST, mechanicCharge, grandTotal } = calculateTotals();

  // Update the form submission
  const onSubmit = async (values: GSTBillingFormValues) => {
    try {
      setIsSubmitting(true);
      const selectedCustomer = customers.find(
        (c) => c._id === values.customerId
      );

      const selectedVehicle = filteredVehicles.find(
        (v) => v._id === values.vehicleId
      );

      if (!selectedCustomer || !selectedVehicle) {
        toast.error("Customer or vehicle not found");
        return;
      }

      // Check for existing job card
      try {
        const vehicleNumber = selectedVehicle.vehicleNumber;
        if (!vehicleNumber || typeof vehicleNumber !== "string") {
          toast.error("Invalid vehicle number");
          return;
        }

        const jobCardResponse = await api.get(
          `/jobcards/by-vehicle/${vehicleNumber}`
        );
        if (jobCardResponse.data && jobCardResponse.data._id) {
          // Check if job card is already closed
          if (jobCardResponse.data.status === "Closed") {
            toast.error("A bill has already been generated for this job card");
            return;
          }
        }
      } catch (error) {
        console.error("Error checking job card:", error);
        toast.error("Failed to verify job card status");
        return;
      }

      // Calculate item totals with GST
      const itemsWithTotals = values.items.map((item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const rate = parseFloat(item.rate) || 0;
        const gstRate = parseFloat(item.gstRate) || 0;
        const amount = quantity * rate;
        const gstAmount = amount * (gstRate / 100);
        const totalAmount = amount + gstAmount;

        return {
          itemId: item.itemId,
          quantity: quantity,
          rate: rate,
          gstPercent: gstRate,
          actualAmount: amount,
          gstAmount: gstAmount,
          totalAmount: totalAmount,
        };
      });

      const mechanicChargeValue = parseFloat(values.mechanicCharge) || 0;

      const payload: GstBillPayload = {
        customer: values.customerId,
        vehicleId: values.vehicleId,
        customerDetails: {
          name: selectedCustomer.name,
          mobile: selectedCustomer.mobile,
          gstin: values.customerGstin || "",
          address: selectedCustomer.address || "",
        },
        vehicleDetails: {
          number: selectedVehicle.vehicleNumber,
          brand: selectedVehicle.brand,
          model: selectedVehicle.model,
          registrationDate: selectedVehicle.registrationDate || "",
          insuranceExpiry: selectedVehicle.insuranceExpiry || "",
        },
        items: itemsWithTotals,
        gst: parseFloat(values.items[0]?.gstRate || "18"),
        invoiceNo: values.invoiceNumber,
        invoiceDate: values.invoiceDate,
        totalAmount: parseFloat(grandTotal),
        mechanicCharge: mechanicChargeValue,
      };

      // Create GST bill
      const response = await api.post("/gstbills/create", payload);

      if (!response.data || !response.data.billId) {
        throw new Error("No bill ID received from server");
      }

      const billId = response.data.billId;

      // Update job card status to Closed
      try {
        const jobCardResponse = await api.get(
          `/jobcards/by-vehicle/${selectedVehicle.vehicleNumber}`
        );
        if (jobCardResponse.data && jobCardResponse.data._id) {
          await api.put(`/jobcards/update-status/${jobCardResponse.data._id}`, {
            status: "Closed",
          });
          toast.success("Job card status updated to Closed");
        } else {
          console.error("No job card found for this vehicle");
        }
      } catch (error) {
        console.error("Error updating job card status:", error);
      }

      toast.success("GST bill created successfully!");

      // Generate PDF
      try {
        const pdfResponse = await api.get(`/gstbills/${billId}/pdf`, {
          responseType: "blob",
        });

        if (!pdfResponse.data) {
          throw new Error("No PDF data received");
        }

        const blob = new Blob([pdfResponse.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `GST-Bill-${values.invoiceNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success("PDF generated successfully!");
      } catch (pdfError) {
        console.error("Error generating PDF:", pdfError);
        toast.error("Failed to generate PDF. Please try again.");
      }

      // Reset form
      form.reset({
        customerId: "",
        vehicleId: "",
        invoiceNumber: invoiceSNumber ?? "",
        invoiceDate: today,
        customerGstin: "",
        items: [
          {
            description: "",
            hsnCode: "",
            quantity: "1",
            rate: "0",
            gstRate: "18",
            itemId: "",
          },
        ],
        additionalNotes: "",
        mechanicCharge: "0",
      });
      setFilteredVehicles([]);
      setCustomerSearch("");
      generateInvoiceNumber();
    } catch (error) {
      console.error("Error creating GST bill:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create GST bill"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    form.reset({
      customerId: "",
      vehicleId: "",
      invoiceNumber: invoiceSNumber ?? "",
      invoiceDate: today,
      customerGstin: "",
      items: [
        {
          description: "",
          hsnCode: "",
          quantity: "1",
          rate: "0",
          gstRate: "18",
          itemId: "",
        },
      ],
      additionalNotes: "",
      mechanicCharge: "0",
      // paymentMode: "Cash",
    });
    setCustomerSearch("");
    setIsCustomerSelected(false);
  };

  // Update the handleCreateItem function
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

      // Ensure all required fields are present
      const item = {
        _id: createdItem._id,
        description: createdItem.description || itemData.description,
        hsnCode: createdItem.hsnCode || itemData.hsnCode,
        rate: createdItem.rate || itemData.rate,
        gstPercent: createdItem.gstPercent || itemData.gstPercent,
        itemId: createdItem._id?.toString() || "",
      };

      // Add the new item to the items list
      setItems((prev) => [...prev, item]);

      // If we're creating an item for a specific index, update that row
      if (creatingItemIndex !== null) {
        form.setValue(
          `items.${creatingItemIndex}.description`,
          item.description
        );
        form.setValue(`items.${creatingItemIndex}.hsnCode`, item.hsnCode);
        form.setValue(
          `items.${creatingItemIndex}.rate`,
          item.rate.toString()
        );
        form.setValue(
          `items.${creatingItemIndex}.gstRate`,
          item.gstPercent.toString()
        );
      } else {
        // Otherwise, add it as a new row
        append({
          description: item.description,
          hsnCode: item.hsnCode,
          quantity: "1",
          rate: item.rate.toString(),
          gstRate: item.gstPercent.toString(),
          itemId: item.itemId,
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

  // Update the dialog close handler
  const handleDialogClose = () => {
    setIsCreateItemDialogOpen(false);
    setCreatingItemIndex(null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Invoice Number - Readonly */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            key={customer._id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                            onClick={() => {
                              field.onChange(customer._id);
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

          {/* Customer GSTIN */}
          <FormField
            control={form.control}
            name="customerGstin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer GSTIN</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter customer GSTIN if available"
                  />
                </FormControl>
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

        {/* Items Table */}
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
                    hsnCode: "",
                    quantity: "1",
                    rate: "0",
                    gstRate: "18",
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
                  <th className="px-4 py-2 text-left">HSN Code</th>
                  <th className="px-4 py-2 text-left">Qty</th>
                  <th className="px-4 py-2 text-left">Rate (₹)</th>
                  <th className="px-4 py-2 text-left">GST %</th>
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
                                            HSN: {item.hsnCode} | Rate: ₹
                                            {item.rate}
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
                      <td className="px-3 py-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.hsnCode`}
                          render={({ field }) => (
                            <FormItem className="mb-0">
                              <FormControl>
                                <Input {...field} placeholder="HSN" readOnly />
                              </FormControl>
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
                                <Input {...field} type="number" min={1} />
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
                                  min={0}
                                  step="0.01"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </td>
                      <td className="px-3 py-2" style={{ width: "80px" }}>
                        <FormField
                          control={form.control}
                          name={`items.${index}.gstRate`}
                          render={({ field }) => (
                            <FormItem className="mb-0">
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="GST %" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="0">0%</SelectItem>
                                    <SelectItem value="5">5%</SelectItem>
                                    <SelectItem value="12">12%</SelectItem>
                                    <SelectItem value="18">18%</SelectItem>
                                    <SelectItem value="28">28%</SelectItem>
                                  </SelectContent>
                                </Select>
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
        <div className="border rounded-md p-4 space-y-2 bg-muted/20">
          <div className="flex justify-between">
            <span className="font-medium">Subtotal:</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">GST Total:</span>
            <span>₹{totalGST}</span>
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
            <span>Grand Total:</span>
            <span>₹{grandTotal}</span>
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={handleReset}>
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Generating Bill..." : "Generate GST Bill"}
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

export default GSTBillingForm;
