import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DateRange } from "react-day-picker";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Mock data for jobs by status
const jobsByStatus = [
  { name: "Completed", value: 120 },
  { name: "In Progress", value: 35 },
  { name: "Pending", value: 20 },
  { name: "Delivered", value: 180 },
];

// Mock data for jobs by service type
const jobsByServiceType = [
  { name: "General", count: 150 },
  { name: "Engine", count: 80 },
  { name: "Electrical", count: 65 },
  { name: "AC", count: 45 },
  { name: "Other", count: 15 },
];

// Colors for the pie chart
const COLORS = ["#4f46e5", "#06b6d4", "#f59e0b", "#10b981"];

// Calculate total jobs
const totalJobs = jobsByStatus.reduce((sum, entry) => sum + entry.value, 0);

interface JobsReportProps {
  dateRange: DateRange;
}

export const JobsReport = ({ dateRange }: JobsReportProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              For the selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">
              Completed Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobsByStatus[0].value}</div>
            <p className="text-xs text-muted-foreground">
              {((jobsByStatus[0].value / totalJobs) * 100).toFixed(1)}%
              completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobsByStatus[1].value}</div>
            <p className="text-xs text-muted-foreground">
              {((jobsByStatus[1].value / totalJobs) * 100).toFixed(1)}% of total
              jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobsByStatus[2].value}</div>
            <p className="text-xs text-muted-foreground">
              {((jobsByStatus[2].value / totalJobs) * 100).toFixed(1)}% of total
              jobs
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Jobs by Status</CardTitle>
            <CardDescription>
              Distribution of jobs by their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={jobsByStatus}
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
                    {jobsByStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} jobs`, ""]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jobs by Service Type</CardTitle>
            <CardDescription>
              Number of jobs by service category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={jobsByServiceType}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
