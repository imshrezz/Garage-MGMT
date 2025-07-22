import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

type ExpenseViewModalProps = {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
};

export const ExpenseViewModal: React.FC<ExpenseViewModalProps> = ({ expense, isOpen, onClose }) => {
  if (!expense) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Expense Details</DialogTitle>
          <DialogDescription>Details of the selected expense</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 mt-4">
          <p><strong>Date:</strong> {new Date(expense.date).toLocaleDateString()}</p>
          <p><strong>Type:</strong> {expense.type}</p>
          <p><strong>Description:</strong> {expense.description}</p>
          <p><strong>Amount:</strong> ₹{expense.amount.toLocaleString()}</p>
          <p><strong>Paid To:</strong> {expense.paidTo}</p>
          <p><strong>Payment Mode:</strong> {expense.paymentMode}</p>
          <p><strong>Created By:</strong> {expense.createdBy}</p>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseViewModal;