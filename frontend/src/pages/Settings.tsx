import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/lib/axios";
import { mobileNumberSchema } from "@/lib/validations/common";
import { useGarage } from "@/context/GarageContext";

const isValidGST = (gst: string) =>
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst);

const garageSettingsSchema = z.object({
  garageName: z.string().min(2, "Garage name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City name must be at least 2 characters"),
  state: z.string().min(2, "State name must be at least 2 characters"),
  zipCode: z.string().min(5, "Zip code must be at least 5 characters"),
  phone: mobileNumberSchema,
  email: z.string().email("Please enter a valid email address"),
  gstNumber: z
    .string()
    .min(15, "GSTIN must be at least 15 characters")
    .max(15, "GSTIN must be 15 characters")
    .refine(isValidGST, { message: "Invalid GST number format" }),
  footerMessage: z.string().optional(),
});

type GarageSettingsValues = z.infer<typeof garageSettingsSchema>;

const Settings = () => {
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { garageLogo, setGarageLogo } = useGarage();

  const form = useForm<GarageSettingsValues>({
    resolver: zodResolver(garageSettingsSchema),
    defaultValues: {
      garageName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
      footerMessage: "",
      gstNumber: "",
    },
  });

  useEffect(() => {
    const fetchGarageProfile = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/garage");
        console.log("garage data ", data);
        
        if (data.success && data.garage) {
          form.reset({
            garageName: data.garage.garageName || "",
            address: data.garage.address || "",
            city: data.garage.city || "",
            state: data.garage.state || "",
            zipCode: data.garage.zipCode || "",
            phone: data.garage.phone || "",
            email: data.garage.email || "",
            footerMessage: data.garage.footerMessage || "",
            gstNumber: data.garage.gstNumber || "",
          });
          // Set logo if it exists
          if (data.garage.logo) {
            setGarageLogo(`http://localhost:5000${data.garage.logo}`);
          }
        } else if (data.success === false && data.message === "Garage details not found") {
          // Create new garage profile with dummy data
          const createResponse = await api.post("/garage/create");
          if (createResponse.data.success) {
            const newGarage = createResponse.data.garage;
            form.reset({
              garageName: newGarage.garageName || "",
              address: newGarage.address || "",
              city: newGarage.city || "",
              state: newGarage.state || "",
              zipCode: newGarage.zipCode || "",
              phone: newGarage.phone || "",
              email: newGarage.email || "",
              footerMessage: newGarage.footerMessage || "",
              gstNumber: newGarage.gstNumber || "",
            });
            if (newGarage.logo) {
              setGarageLogo(`http://localhost:5000${newGarage.logo}`);
            }
            toast.success("Default garage profile created successfully!");
          }
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          localStorage.removeItem("garage_token");
          window.location.href = "/login";
        } else {
          toast.error("Failed to load garage profile");
        }
        console.error("Garage profile fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGarageProfile();
  }, [form, setGarageLogo]);

  const onSubmit = async (values: GarageSettingsValues) => {
    try {
      setUploading(true);
      const formData = new FormData();

      // Append all form values
      Object.entries(values).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      // Append logo file if selected
      if (selectedFile) {
        formData.append("logo", selectedFile);
      }

      const { data } = await api.put("/garage/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        toast.success("Garage settings updated successfully!");
        setIsEditing(false);
        setSelectedFile(null);
        // Update logo URL if it was changed
        if (data.garage.logo) {
          const newLogoUrl = `http://localhost:5000${data.garage.logo}`;
          setGarageLogo(newLogoUrl);
        }
      } else {
        toast.error(data.message || "Failed to update settings");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("garage_token");
        window.location.href = "/login";
      } else {
        toast.error("Failed to update garage settings");
      }
      console.error("Settings update error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    setUploading(true);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setGarageLogo(reader.result as string);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = async () => {
    try {
      setUploading(true);
      const { data } = await api.put("/garage/update", { removeLogo: true });

      if (data.success) {
        setGarageLogo(null);
        setSelectedFile(null);
        toast.success("Logo removed successfully");
      } else {
        toast.error(data.message || "Failed to remove logo");
      }
    } catch (error: any) {
      toast.error("Failed to remove logo");
      console.error("Logo removal error:", error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button
          variant="outline"
          type="button"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <Tabs defaultValue="garage" className="w-full">
        <TabsList>
          <TabsTrigger value="garage">Garage Information</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-6"
          >
            <TabsContent value="garage" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Garage Logo</CardTitle>
                  <CardDescription>
                    Upload your garage logo that will appear on invoices and
                    receipts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-32 border rounded-md flex items-center justify-center overflow-hidden bg-muted">
                      {garageLogo ? (
                        <img
                          src={garageLogo}
                          alt="Garage Logo"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          No logo uploaded
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        onChange={handleLogoChange}
                        accept="image/*"
                        className="max-w-sm"
                        disabled={!isEditing || uploading}
                      />
                      <p className="text-sm text-muted-foreground">
                        Recommended size: 500x500 pixels. Max file size: 5MB
                      </p>
                      {garageLogo && (
                        <Button
                          variant="outline"
                          type="button"
                          onClick={removeLogo}
                          size="sm"
                          disabled={!isEditing}
                        >
                          Remove Logo
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Garage Details</CardTitle>
                  <CardDescription>
                    Enter your garage's basic information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="garageName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Garage Name</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gstNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GST No</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!isEditing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Invoice Footer Message</CardTitle>
                  <CardDescription>
                    This message will appear at the bottom of all invoices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="footerMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            rows={3}
                            placeholder="Enter a message to display at the bottom of invoices..."
                            {...field}
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {isEditing && (
              <div className="flex justify-end">
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </Tabs>
    </div>
  );
};

export default Settings;
