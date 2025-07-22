import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DateRange } from "react-day-picker";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Mock data for the revenue chart
const data = [
  { name: "Jan", gst: 4000, nongst: 2400 },
  { name: "Feb", gst: 3000, nongst: 1398 },
  { name: "Mar", gst: 2000, nongst: 9800 },
  { name: "Apr", gst: 2780, nongst: 3908 },
  { name: "May", gst: 1890, nongst: 4800 },
  { name: "Jun", gst: 2390, nongst: 3800 },
  { name: "Jul", gst: 3490, nongst: 4300 },
  { name: "Aug", gst: 4000, nongst: 2400 },
  { name: "Sep", gst: 3000, nongst: 1398 },
  { name: "Oct", gst: 2000, nongst: 9800 },
  { name: "Nov", gst: 2780, nongst: 3908 },
  { name: "Dec", gst: 1890, nongst: 4800 },
];

// Add total property to each data entry
const chartData = data.map((entry) => ({
  ...entry,
  total: entry.gst + entry.nongst,
}));

// Calculate total revenue
const totalRevenue = chartData.reduce((sum, entry) => sum + entry.total, 0);
const gstRevenue = chartData.reduce((sum, entry) => sum + entry.gst, 0);
const nonGstRevenue = chartData.reduce((sum, entry) => sum + entry.nongst, 0);

interface RevenueReportProps {
  dateRange: DateRange;
}

export const RevenueReport = ({ dateRange }: RevenueReportProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              For the selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">GST Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{gstRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {((gstRevenue / totalRevenue) * 100).toFixed(1)}% of total revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">
              Non-GST Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{nonGstRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {((nonGstRevenue / totalRevenue) * 100).toFixed(1)}% of total
              revenue
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
          <CardDescription>
            Monthly revenue breakdown by billing type
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[400px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`₹${value}`, ""]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Bar
                  dataKey="gst"
                  name="GST Revenue"
                  fill="#4f46e5"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="nongst"
                  name="Non-GST Revenue"
                  fill="#6ee7b7"
                  radius={[4, 4, 0, 0]}
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
