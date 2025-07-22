// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
//   Legend,
//   Tooltip,
// } from "recharts";

// // Mock expense data by category
// const expensesByCategory = [
//   { name: "Rent", value: 25000, color: "#8b5cf6" },
//   { name: "Salary", value: 45000, color: "#3b82f6" },
//   { name: "Parts", value: 32000, color: "#10b981" },
//   { name: "Utilities", value: 8000, color: "#f59e0b" },
//   { name: "Fuel", value: 5000, color: "#f97316" },
//   { name: "Other", value: 3000, color: "#6b7280" },
// ];

// // Calculate total expenses
// const totalExpenses = expensesByCategory.reduce(
//   (sum, category) => sum + category.value,
//   0
// );

// export const ExpenseSummary = () => {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//       <Card className="md:col-span-2">
//         <CardHeader>
//           <CardTitle>Expense by Category</CardTitle>
//           <CardDescription>
//             Distribution of expenses by category
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="h-[300px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={expensesByCategory}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={60}
//                   outerRadius={100}
//                   fill="#8884d8"
//                   paddingAngle={2}
//                   dataKey="value"
//                   label={({ name, percent }) =>
//                     `${name} ${(percent * 100).toFixed(0)}%`
//                   }
//                 >
//                   {expensesByCategory.map((entry) => (
//                     <Cell key={`cell-${entry.name}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip formatter={(value) => [`₹${value}`, ""]} />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </CardContent>
//       </Card>

//       <div className="space-y-6">
//         <Card>
//           <CardHeader className="py-4">
//             <CardTitle className="text-sm font-medium">
//               Total Expenses
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               ₹{totalExpenses.toLocaleString()}
//             </div>
//             <p className="text-xs text-muted-foreground">
//               For the current month
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="py-4">
//             <CardTitle className="text-sm font-medium">Top Expense</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {expensesByCategory[0].name}
//             </div>
//             <p className="text-xs text-muted-foreground">
//               ₹{expensesByCategory[0].value.toLocaleString()}(
//               {((expensesByCategory[0].value / totalExpenses) * 100).toFixed(0)}
//               % of total)
//             </p>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };


import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import api from "@/lib/axios"; // Your axios instance

type Expense = {
  _id: string;
  type: string;
  amount: number;
  // other fields if needed
};

type CategoryData = {
  name: string;
  value: number;
  color: string;
};

// Define colors for categories (adjust as needed)
const CATEGORY_COLORS: Record<string, string> = {
  Rent: "#8b5cf6",
  Salary: "#3b82f6",
  "Parts Purchase": "#10b981",
  Utilities: "#f59e0b",
  Fuel: "#f97316",
  Other: "#6b7280",
};

export const ExpenseSummary = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await api.get("/expenses");
        setExpenses(res.data);
      } catch (err) {
        setError("Failed to fetch expenses");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  // Aggregate expenses by type
  const expensesByCategory: CategoryData[] = React.useMemo(() => {
    const map = new Map<string, number>();
  
    expenses.forEach(({ type, amount }) => {
      console.log("Processing expense:", { type, amount }); // debug
      const key = type || "Other";
      // Ensure amount is number
      const amt = typeof amount === "string" ? parseFloat(amount) : amount;
      map.set(key, (map.get(key) ?? 0) + (amt || 0));
    });
  
    const result = Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || CATEGORY_COLORS["Other"],
    }));
    console.log("Aggregated expensesByCategory:", result); // debug
    return result;
  }, [expenses]);

  const totalExpenses = expensesByCategory.reduce(
    (sum, cat) => sum + cat.value,
    0
  );

  const topExpense = expensesByCategory.reduce(
    (max, cat) => (cat.value > max.value ? cat : max),
    { name: "N/A", value: 0, color: CATEGORY_COLORS["Other"] }
  );

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading expense summary...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">{error}</div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Expense by Category</CardTitle>
          <CardDescription>Distribution of expenses by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {expensesByCategory.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${value}`, ""]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">For the current month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Top Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topExpense.name}</div>
            <p className="text-xs text-muted-foreground">
              ₹{topExpense.value.toLocaleString()} (
              {totalExpenses
                ? ((topExpense.value / totalExpenses) * 100).toFixed(0)
                : 0}
              % of total)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
