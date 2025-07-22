import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/axios";

type CreateItemPayload = {
  description: string;
  hsnCode: string;
  rate: number;
  gstPercent: number;
  quantity: number;
};

type CreateItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (itemData: CreateItemPayload) => void;
  initialData?: CreateItemPayload;
};

const CreateItemDialog = ({
  open,
  onOpenChange,
  onSubmit,
  initialData = {
    description: "",
    hsnCode: "",
    rate: 0,
    gstPercent: 18,
    quantity: 1,
  },
}: CreateItemDialogProps) => {
  const [itemData, setItemData] = useState<CreateItemPayload>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateItemAmounts = (rate: number, quantity: number, gstPercent: number) => {
    const actualAmount = rate * quantity;
    const gstAmount = (actualAmount * gstPercent) / 100;
    const finalAmount = actualAmount + gstAmount;
    return {
      actualAmount: actualAmount.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      finalAmount: finalAmount.toFixed(2),
    };
  };

  const { actualAmount, gstAmount, finalAmount } = calculateItemAmounts(
    itemData.rate,
    itemData.quantity,
    itemData.gstPercent
  );

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Check for duplicate item
      const { data } = await api.get("/items");
      const existingItems = data.items || [];
      
      const isDuplicate = existingItems.some(
        (item: any) => 
          item.description.toLowerCase() === itemData.description.toLowerCase() ||
          item.hsnCode.toLowerCase() === itemData.hsnCode.toLowerCase()
      );

      if (isDuplicate) {
        toast.error("An item with this description or HSN code already exists");
        return;
      }

      const response = await api.post("/items/create", {
        description: itemData.description,
        hsnCode: itemData.hsnCode,
        rate: itemData.rate,
        gstPercent: itemData.gstPercent,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create item");
      }

      const createdItem = response.data.item;

      if (!createdItem) {
        throw new Error("No item data received from server");
      }

      onSubmit(itemData);
      onOpenChange(false);
      toast.success("Item created successfully");
    } catch (error: any) {
      console.error("Error creating item:", error);
      toast.error(error.response?.data?.message || "Failed to create item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={itemData.description}
              onChange={(e) =>
                setItemData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Enter item description"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="hsnCode">HSN Code</Label>
            <Input
              id="hsnCode"
              value={itemData.hsnCode}
              onChange={(e) =>
                setItemData((prev) => ({ ...prev, hsnCode: e.target.value }))
              }
              placeholder="Enter HSN code"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={itemData.quantity}
                onChange={(e) =>
                  setItemData((prev) => ({
                    ...prev,
                    quantity: parseInt(e.target.value) || 1,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rate">Rate (₹)</Label>
              <Input
                id="rate"
                type="number"
                min="0"
                step="0.01"
                value={itemData.rate}
                onChange={(e) =>
                  setItemData((prev) => ({
                    ...prev,
                    rate: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gst">GST %</Label>
            <Select
              value={itemData.gstPercent.toString()}
              onValueChange={(value) =>
                setItemData((prev) => ({
                  ...prev,
                  gstPercent: parseInt(value),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select GST %" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0%</SelectItem>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="12">12%</SelectItem>
                <SelectItem value="18">18%</SelectItem>
                <SelectItem value="28">28%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="border rounded-md p-4 space-y-2 bg-muted/20">
            <div className="flex justify-between">
              <span className="font-medium">Actual Amount:</span>
              <span>₹{actualAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">GST Amount:</span>
              <span>₹{gstAmount}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Final Amount:</span>
              <span>₹{finalAmount}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !itemData.description || 
              !itemData.hsnCode || 
              itemData.rate <= 0 ||
              isSubmitting
            }
          >
            {isSubmitting ? "Creating..." : "Create Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateItemDialog;