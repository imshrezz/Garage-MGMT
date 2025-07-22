import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/axios";
import { ExpenseViewModal } from "./ExpenseViewModal";

type Expense = {
  id: string;
  date: string;
  type: string;
  amount: number;
  description: string;
  paidTo: string;
  paymentMode: string;
  createdBy: string;
};

type ExpensesListProps = {
  searchQuery: string;
};

const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case "Rent":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200";
    case "Salary":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "Parts Purchase":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "Utility Bills":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "Fuel":
      return "bg-orange-100 text-orange-800 hover:bg-orange-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

export const ExpensesList = ({ searchQuery }: ExpensesListProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Expense>>({});
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const openViewModal = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const closeViewModal = () => {
    setSelectedExpense(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await api.get("/expenses");
        const expensesWithId = res.data.map((e: any) => ({ ...e, id: e._id }));
        setExpenses(expensesWithId);
      } catch (err: any) {
        setError("Failed to fetch expenses");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const filteredExpenses = useMemo(() => {
    if (!searchQuery) return expenses;
    const query = searchQuery.toLowerCase();
    return expenses.filter(
      (expense) =>
        expense.type.toLowerCase().includes(query) ||
        (expense.description?.toLowerCase().includes(query) ?? false) ||
        expense.paidTo.toLowerCase().includes(query) ||
        expense.date.includes(query) ||
        expense.paymentMode.toLowerCase().includes(query)
    );
  }, [searchQuery, expenses]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredExpenses.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      await api.delete(`/expenses/delete/${id}`);
      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete expense");
    }
  };

  const startEditing = (expense: Expense) => {
    setEditingExpense(expense);
    setEditFormData({ ...expense });
  };

  const cancelEditing = () => {
    setEditingExpense(null);
    setEditFormData({});
  };

  const handleInputChange = (field: keyof Expense, value: any) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveEdit = async () => {
    if (!editingExpense) return;
    try {
      // Call API to update expense
      const res = await api.put(`/expenses/update/${editingExpense.id}`, editFormData);
      // Update in state
      setExpenses((prev) =>
        prev.map((expense) =>
          expense.id === editingExpense.id ? { ...expense, ...res.data } : expense
        )
      );
      cancelEditing();
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update expense");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading expenses...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">{error}</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden md:table-cell">Payment Mode</TableHead>
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
            ) : filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No expenses found
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((expense) => {
                const isEditing = editingExpense?.id === expense.id;
                return (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editFormData.date?.slice(0, 10) || ""}
                          onChange={(e) =>
                            handleInputChange("date", e.target.value)
                          }
                          className="border rounded px-2 py-1"
                        />
                      ) : (
                        new Date(expense.date).toLocaleDateString()
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <select
                          value={editFormData.type || ""}
                          onChange={(e) =>
                            handleInputChange("type", e.target.value)
                          }
                          className="border rounded px-2 py-1"
                        >
                          <option value="">Select Type</option>
                          <option value="Rent">Rent</option>
                          <option value="Salary">Salary</option>
                          <option value="Parts Purchase">Parts Purchase</option>
                          <option value="Utility Bills">Utility Bills</option>
                          <option value="Fuel">Fuel</option>
                        </select>
                      ) : (
                        <Badge
                          variant="outline"
                          className={`${getTypeBadgeColor(expense.type)} border-none`}
                        >
                          {expense.type}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editFormData.description || ""}
                          onChange={(e) =>
                            handleInputChange("description", e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        expense.description
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editFormData.amount || 0}
                          onChange={(e) =>
                            handleInputChange("amount", Number(e.target.value))
                          }
                          className="border rounded px-2 py-1 w-24"
                        />
                      ) : (
                        `₹${expense.amount.toLocaleString()}`
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {isEditing ? (
                        <select
                          value={editFormData.paymentMode || ""}
                          onChange={(e) =>
                            handleInputChange("paymentMode", e.target.value)
                          }
                          className="border rounded px-2 py-1"
                        >
                          <option value="">Select Payment Mode</option>
                          <option value="Cash">Cash</option>
                          <option value="UPI">UPI</option>
                          <option value="Credit Card">Credit Card</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                      ) : (
                        expense.paymentMode
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {!isEditing && (
                          <>
                            <Button variant="ghost" size="icon"  onClick={() => openViewModal(expense)}  title="View">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit"
                              onClick={() => startEditing(expense)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete"
                              onClick={() => handleDelete(expense.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}

                        {isEditing && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Save"
                              onClick={saveEdit}
                            >
                              <Save className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Cancel"
                              onClick={cancelEditing}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
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
      {!loading && filteredExpenses.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length} entries
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

      <ExpenseViewModal
        expense={selectedExpense}
        isOpen={isModalOpen}
        onClose={closeViewModal}
      />  
    </div>
  );
};
