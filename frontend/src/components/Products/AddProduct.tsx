import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { toast } from "sonner";

const GST_OPTIONS = [0, 5, 12, 18, 28];

const formSchema = z.object({
  description: z.string().min(1, "Description is required"),
  hsnCode: z.string().min(1, "HSN Code is required"),
  rate: z.number().positive("Rate must be positive"),
  gstPercent: z.number().refine((val) => GST_OPTIONS.includes(val), {
    message: "Invalid GST %",
  }),
});

type ProductFormValues = z.infer<typeof formSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

const AddProductDialog = ({ open, onOpenChange, onSuccess }: Props) => {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      hsnCode: "",
      rate: 0,
      gstPercent: 18,
    },
  });

  const onSubmit = async (values: ProductFormValues) => {
    try {
      setSubmitting(true);
      const res = await api.post("/items/create", values);
      toast.success("Product added successfully");
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to add product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <div>
            <Label>Description</Label>
            <Input {...form.register("description")} />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div>
            <Label>HSN Code</Label>
            <Input {...form.register("hsnCode")} />
            {form.formState.errors.hsnCode && (
              <p className="text-sm text-red-500">{form.formState.errors.hsnCode.message}</p>
            )}
          </div>

          <div>
            <Label>Base Price</Label>
            <Input type="number" {...form.register("rate", { valueAsNumber: true })} />
            {form.formState.errors.rate && (
              <p className="text-sm text-red-500">{form.formState.errors.rate.message}</p>
            )}
          </div>

          <div>
            <Label>GST %</Label>
            <Select
              value={form.watch("gstPercent").toString()}
              onValueChange={(val) => form.setValue("gstPercent", parseInt(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select GST %" />
              </SelectTrigger>
              <SelectContent>
                {GST_OPTIONS.map((gst) => (
                  <SelectItem key={gst} value={gst.toString()}>
                    {gst}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.gstPercent && (
              <p className="text-sm text-red-500">{form.formState.errors.gstPercent.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
