// types/expense.ts
export type Expense = {
    _id: string;
    date: string;          
    type: string;          
    amount: number;
    description: string;
    paidTo: string;
    paymentMode: string;
    createdBy: string;     
  };
  
  export interface ExpenseViewModel {
    id: string;            
    formattedDate: string; 
    type: string;
    amount: number;
    formattedAmount: string;
    description: string;
    paidTo: string;
    paymentMode: string;
    createdBy: string;
  }
  
  export function mapExpenseToViewModel(expense: Expense): ExpenseViewModel {
    return {
      id: expense._id,
      formattedDate: new Date(expense.date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      type: expense.type,
      amount: expense.amount,
      formattedAmount: `₹${expense.amount.toLocaleString()}`,
      description: expense.description,
      paidTo: expense.paidTo,
      paymentMode: expense.paymentMode,
      createdBy: expense.createdBy,
    };
  }
  