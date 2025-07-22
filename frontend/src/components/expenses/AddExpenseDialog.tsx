// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/hooks/use-toast";
// import { Calendar } from "lucide-react";

// const expenseFormSchema = z.object({
//   expenseType: z.string().min(1, { message: "Expense type is required" }),
//   amount: z.string().min(1, { message: "Amount is required" }),
//   description: z.string().min(1, { message: "Description is required" }),
//   date: z.string().min(1, { message: "Date is required" }),
//   paidTo: z.string().min(1, { message: "Paid to is required" }),
//   paymentMode: z.string().min(1, { message: "Payment mode is required" }),
// });

// type AddExpenseDialogProps = {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// };

// export function AddExpenseDialog({
//   open,
//   onOpenChange,
// }: AddExpenseDialogProps) {
//   const { toast } = useToast();

//   const form = useForm<z.infer<typeof expenseFormSchema>>({
//     resolver: zodResolver(expenseFormSchema),
//     defaultValues: {
//       expenseType: "",
//       amount: "",
//       description: "",
//       date: new Date().toISOString().split("T")[0], // Default to today
//       paidTo: "",
//       paymentMode: "",
//     },
//   });

//   function onSubmit(data: z.infer<typeof expenseFormSchema>) {
//     console.log("Form submitted:", data);

//     toast({
//       title: "Expense Added",
//       description: `₹${data.amount} expense has been recorded.`,
//     });

//     onOpenChange(false);
//     form.reset();
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[500px]">
//         <DialogHeader>
//           <DialogTitle>Add New Expense</DialogTitle>
//           <DialogDescription>
//             Record a new expense for garage operations.
//           </DialogDescription>
//         </DialogHeader>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <FormField
//                 control={form.control}
//                 name="expenseType"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>
//                       Expense Type <span className="text-red-500">*</span>
//                     </FormLabel>
//                     <Select
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                     >
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select expense type" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         <SelectItem value="Rent">Rent</SelectItem>
//                         <SelectItem value="Salary">Salary</SelectItem>
//                         <SelectItem value="Parts Purchase">
//                           Parts Purchase
//                         </SelectItem>
//                         <SelectItem value="Utility Bills">
//                           Utility Bills
//                         </SelectItem>
//                         <SelectItem value="Fuel">Fuel</SelectItem>
//                         <SelectItem value="Other">Other</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="amount"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>
//                       Amount (₹) <span className="text-red-500">*</span>
//                     </FormLabel>
//                     <FormControl>
//                       <Input type="number" placeholder="e.g. 5000" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             <FormField
//               control={form.control}
//               name="description"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>
//                     Description <span className="text-red-500">*</span>
//                   </FormLabel>
//                   <FormControl>
//                     <Textarea
//                       placeholder="Brief description of the expense"
//                       className="resize-none"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <FormField
//                 control={form.control}
//                 name="date"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>
//                       Date of Expense <span className="text-red-500">*</span>
//                     </FormLabel>
//                     <FormControl>
//                       <div className="relative">
//                         <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
//                         <Input type="date" className="pl-9" {...field} />
//                       </div>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="paidTo"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>
//                       Paid To <span className="text-red-500">*</span>
//                     </FormLabel>
//                     <FormControl>
//                       <Input placeholder="Vendor, employee, etc." {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             <FormField
//               control={form.control}
//               name="paymentMode"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>
//                     Payment Mode <span className="text-red-500">*</span>
//                   </FormLabel>
//                   <Select
//                     onValueChange={field.onChange}
//                     defaultValue={field.value}
//                   >
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select payment mode" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="Cash">Cash</SelectItem>
//                       <SelectItem value="UPI">UPI</SelectItem>
//                       <SelectItem value="Card">Card</SelectItem>
//                       <SelectItem value="Bank Transfer">
//                         Bank Transfer
//                       </SelectItem>
//                       <SelectItem value="Check">Check</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <DialogFooter>
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => onOpenChange(false)}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit">Add Expense</Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";
import api from "@/lib/axios";

const expenseFormSchema = z.object({
  expenseType: z.string().min(1, { message: "Expense type is required" }),
  amount: z.string().min(1, { message: "Amount is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  paidTo: z.string().min(1, { message: "Paid to is required" }),
  paymentMode: z.string().min(1, { message: "Payment mode is required" }),
});

type AddExpenseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddExpenseDialog({
  open,
  onOpenChange,
}: AddExpenseDialogProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof expenseFormSchema>>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      expenseType: "",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0], // default today
      paidTo: "",
      paymentMode: "",
    },
  });

  async function onSubmit(data: z.infer<typeof expenseFormSchema>) {
    try {
      const payload = {
        type: data.expenseType,
        amount: parseFloat(data.amount),
        description: data.description,
        date: new Date(data.date),
        paidTo: data.paidTo,
        paymentMode: data.paymentMode,
        createdBy: "admin", // Replace with actual logged-in user if needed
      };

      await api.post("/expenses/create", payload);

      toast({
        title: "Expense Added",
        description: `₹${payload.amount} expense has been recorded.`,
      });

      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to add expense.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Record a new expense for garage operations.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expenseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Expense Type <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select expense type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Rent">Rent</SelectItem>
                        <SelectItem value="Salary">Salary</SelectItem>
                        <SelectItem value="Parts Purchase">
                          Parts Purchase
                        </SelectItem>
                        <SelectItem value="Utility Bills">
                          Utility Bills
                        </SelectItem>
                        <SelectItem value="Fuel">Fuel</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Amount (₹) <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 5000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the expense"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Date of Expense <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="date" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paidTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Paid To <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Vendor, employee, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="paymentMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Payment Mode <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Bank Transfer">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Expense</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

