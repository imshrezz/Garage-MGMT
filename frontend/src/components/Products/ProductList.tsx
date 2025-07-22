import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";



type Product = {
  _id: string;
  description: string;
  hsnCode: string;
  rate: number;
  gstPercent: number;
};

const GST_OPTIONS = [0, 5, 12, 18, 28];

type Props = {
  searchQuery: string;
  refreshTrigger?: boolean;
  onDeletedOrAdded?: () => void;
};

export const ProductList = ({ searchQuery, refreshTrigger, onDeletedOrAdded }: Props) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/items");
      // Set default GST to 18% if not present
      const productsWithGST = res.data.items.map((item: any) => ({
        ...item,
        gstPercent: item.gstPercent || 18,
        rate: Number(item.rate) || 0
      }));
      setProducts(productsWithGST);
    } catch (err) {
      console.error("Error fetching products", err);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [refreshTrigger]);

  const handleEditChange = (field: keyof Product, value: any) => {
    if (!selectedProduct) return;
    if (field === 'rate') {
      // Convert rate to number when editing
      setSelectedProduct({ ...selectedProduct, [field]: Number(value) || 0 });
    } else if (field === 'gstPercent') {
      // Convert GST to number when editing
      setSelectedProduct({ ...selectedProduct, [field]: Number(value) || 0 });
    } else {
      setSelectedProduct({ ...selectedProduct, [field]: value });
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedProduct) return;
    try {
      await api.put(`/items/update/${selectedProduct._id}`, {
        description: selectedProduct.description,
        hsnCode: selectedProduct.hsnCode,
        rate: Number(selectedProduct.rate) || 0,
        gstPercent: Number(selectedProduct.gstPercent) || 0
      });
      
      setEditOpen(false);
      toast.success("Product updated successfully");
      fetchProducts();
      onDeletedOrAdded?.();
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      await api.delete(`/items/delete/${selectedProduct._id}`);
      setDeleteOpen(false);
      toast.success("Product deleted successfully");
      fetchProducts();
      onDeletedOrAdded?.();
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const calculateGSTAmount = (rate: number, gstPercent: number) => {
    const numRate = Number(rate) || 0;
    const numGst = Number(gstPercent) || 0;
    return (numRate * numGst) / 100;
  };

  const calculateFinalAmount = (rate: number, gstPercent: number) => {
    const numRate = Number(rate) || 0;
    const numGst = Number(gstPercent) || 0;
    return numRate + (numRate * numGst) / 100;
  };

  const filtered = useMemo(() => {
    if (!searchQuery) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.description.toLowerCase().includes(q) ||
        p.hsnCode.toLowerCase().includes(q)
    );
  }, [searchQuery, products]);

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sr.</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>HSN Code</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead>GST %</TableHead>
              <TableHead>GST Amount</TableHead>
              <TableHead>Final Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((p, index) => {
                const gstAmount = calculateGSTAmount(p.rate, p.gstPercent);
                const finalAmount = calculateFinalAmount(p.rate, p.gstPercent);
                
                return (
                  <TableRow key={p._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{p.description}</TableCell>
                    <TableCell>{p.hsnCode}</TableCell>
                    <TableCell>₹{Number(p.rate).toFixed(2)}</TableCell>
                    <TableCell>{Number(p.gstPercent).toFixed(0)}%</TableCell>
                    <TableCell>₹{gstAmount.toFixed(2)}</TableCell>
                    <TableCell>₹{finalAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedProduct(p);
                            setViewOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedProduct(p);
                            setEditOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedProduct(p);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-2 text-sm">
              <p>
                <strong>Description:</strong> {selectedProduct.description}
              </p>
              <p>
                <strong>HSN Code:</strong> {selectedProduct.hsnCode}
              </p>
              <p>
                <strong>Base Price:</strong> ₹{Number(selectedProduct.rate || 0).toFixed(2)}
              </p>
              <p>
                <strong>GST:</strong> {Number(selectedProduct.gstPercent || 0).toFixed(0)}%
              </p>
              <p>
                <strong>GST Amount:</strong> ₹
                {calculateGSTAmount(selectedProduct.rate || 0, selectedProduct.gstPercent || 0).toFixed(2)}
              </p>
              <p>
                <strong>Final Amount:</strong> ₹
                {calculateFinalAmount(selectedProduct.rate || 0, selectedProduct.gstPercent || 0).toFixed(2)}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid gap-3">
              <div>
                <Label>Description</Label>
                <Input
                  value={selectedProduct.description}
                  onChange={(e) =>
                    handleEditChange("description", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>HSN Code</Label>
                <Input
                  value={selectedProduct.hsnCode}
                  onChange={(e) => handleEditChange("hsnCode", e.target.value)}
                />
              </div>
              <div>
                <Label>Base Price</Label>
                <Input
                  type="text"
                  value={selectedProduct.rate || ''}
                  onChange={(e) => handleEditChange("rate", e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Label>GST %</Label>
                <Select
                  value={String(selectedProduct.gstPercent || 0)}
                  onValueChange={(value) => handleEditChange("gstPercent", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select GST %" />
                  </SelectTrigger>
                  <SelectContent>
                    {GST_OPTIONS.map((gst) => (
                      <SelectItem key={gst} value={String(gst)}>
                        {gst}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditSubmit}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete{" "}
            <strong>{selectedProduct?.description}</strong>?
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default ProductList;