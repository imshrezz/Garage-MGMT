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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";

type JobCard = {
  _id: string;
  customer: { _id: string; name: string; mobile: string };
  vehicleNumber: string;
  jobInDate: string;
  estimatedDelivery: string;
  serviceType: string;
  status: string;
  assignedMechanic: { _id: string; name: string; specialty: string };
  kmIn: number;
  jobDescription: string;
};

type Props = {
  searchQuery: string;
  refreshTrigger?: boolean;
  onDeletedOrAdded?: () => void;
};

export const JobCardList = ({ searchQuery, refreshTrigger, onDeletedOrAdded }: Props) => {
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchJobCards = async () => {
    try {
      setLoading(true);
      const res = await api.get("/jobcards");
      setJobCards(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch job cards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobCards();
  }, [refreshTrigger]);

  const handleDelete = async () => {
    if (!selectedJobCard) return;
    try {
      await api.delete(`/jobcards/delete/${selectedJobCard._id}`);
      toast.success("Job card deleted successfully");
      await fetchJobCards(); // Refresh the list
      onDeletedOrAdded?.(); // Notify parent component
      setDeleteOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete job card");
    }
  };

  const handleEditChange = (field: keyof JobCard, value: any) => {
    if (!selectedJobCard) return;
    setSelectedJobCard({ ...selectedJobCard, [field]: value });
  };

  const handleEditSubmit = async () => {
    if (!selectedJobCard) return;
    try {
      await api.put(`/jobcards/update/${selectedJobCard._id}`, selectedJobCard);
      toast.success("Job card updated successfully");
      await fetchJobCards(); // Refresh the list
      onDeletedOrAdded?.(); // Notify parent component
      setEditOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update job card");
    }
  };

  const filtered = useMemo(() => {
    if (!searchQuery) return jobCards;
    const q = searchQuery.toLowerCase();
    return jobCards.filter(
      (j) =>
        j.customer.name.toLowerCase().includes(q) ||
        j.vehicleNumber.toLowerCase().includes(q) ||
        j.serviceType.toLowerCase().includes(q) ||
        j.status.toLowerCase().includes(q) ||
        j.assignedMechanic.name.toLowerCase().includes(q)
    );
  }, [searchQuery, jobCards]);

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "Closed":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">Vehicle</TableHead>
              <TableHead className="hidden md:table-cell">Service Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No job cards found
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((j) => (
                <TableRow key={j._id}>
                  <TableCell>{j.customer.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {j.vehicleNumber}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {j.serviceType}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(j.status)} border-none`}
                    >
                      {j.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedJobCard(j);
                          setViewOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedJobCard(j);
                          setEditOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedJobCard(j);
                          setDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
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

      {/* View Modal */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Job Card Details</DialogTitle>
          </DialogHeader>
          {selectedJobCard && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Customer</Label>
                  <p>{selectedJobCard.customer.name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Vehicle No</Label>
                  <p>{selectedJobCard.vehicleNumber}</p>
                </div>
                <div>
                  <Label className="font-semibold">Mechanic</Label>
                  <p>{selectedJobCard.assignedMechanic.name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Service Type</Label>
                  <p>{selectedJobCard.serviceType}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status</Label>
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(selectedJobCard.status)} border-none`}
                  >
                    {selectedJobCard.status}
                  </Badge>
                </div>
                <div>
                  <Label className="font-semibold">KM In</Label>
                  <p>{selectedJobCard.kmIn}</p>
                </div>
              </div>
              <div>
                <Label className="font-semibold">Description</Label>
                <p className="mt-1">{selectedJobCard.jobDescription}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Job Card</DialogTitle>
          </DialogHeader>
          {selectedJobCard && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Service Type</Label>
                <select
                  className="border border-input rounded-md px-3 py-2"
                  value={selectedJobCard.serviceType}
                  onChange={(e) =>
                    handleEditChange("serviceType", e.target.value)
                  }
                >
                  <option value="">Select Service Type</option>
                  <option value="General Service">General Service</option>
                  <option value="Engine Work">Engine Work</option>
                  <option value="Electrical Work">Electrical Work</option>
                  <option value="Denting Painting">Denting Painting</option>
                  <option value="AC Repair">AC Repair</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label>Status</Label>
                <select
                  className="border border-input rounded-md px-3 py-2"
                  value={selectedJobCard.status}
                  onChange={(e) => handleEditChange("status", e.target.value)}
                >
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label>Description</Label>
                <Input
                  value={selectedJobCard.jobDescription}
                  onChange={(e) =>
                    handleEditChange("jobDescription", e.target.value)
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditSubmit}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this job card?</p>
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
