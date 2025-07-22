import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, Car, CreditCard, Wrench } from "lucide-react";

// Mock data - in a real application, this would come from your API
const performanceData = [
  { name: "Jan", revenue: 2400, expenses: 1398 },
  { name: "Feb", revenue: 1398, expenses: 980 },
  { name: "Mar", revenue: 3200, expenses: 2800 },
  { name: "Apr", revenue: 2780, expenses: 2500 },
  { name: "May", revenue: 1890, expenses: 1700 },
  { name: "Jun", revenue: 2390, expenses: 1500 },
];

const recentJobs = [
  {
    id: 1,
    customer: "Alex Johnson",
    vehicle: "Toyota Camry",
    service: "Oil Change",
    status: "Completed",
    amount: 120,
  },
  {
    id: 2,
    customer: "Sarah Williams",
    vehicle: "Honda Civic",
    service: "Brake Pad Replacement",
    status: "In Progress",
    amount: 350,
  },
  {
    id: 3,
    customer: "Michael Brown",
    vehicle: "Ford F-150",
    service: "Tire Rotation",
    status: "Pending",
    amount: 80,
  },
  {
    id: 4,
    customer: "Emily Davis",
    vehicle: "BMW X5",
    service: "Full Service",
    status: "Completed",
    amount: 560,
  },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Customers"
          value="124"
          description="+12% from last month"
          icon={<Users className="h-5 w-5" />}
          color="bg-blue-100"
        />
        <StatCard
          title="Vehicles"
          value="186"
          description="+8% from last month"
          icon={<Car className="h-5 w-5" />}
          color="bg-green-100"
        />
        <StatCard
          title="Revenue"
          value="$18,240"
          description="+16% from last month"
          icon={<CreditCard className="h-5 w-5" />}
          color="bg-amber-100"
        />
        <StatCard
          title="Job Cards"
          value="68"
          description="+4% from last month"
          icon={<Wrench className="h-5 w-5" />}
          color="bg-purple-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Performance</CardTitle>
            <CardDescription>
              Monthly revenue vs expenses overview
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#0D9488" name="Revenue" />
                <Bar dataKey="expenses" fill="#F59E0B" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Job Cards</CardTitle>
            <CardDescription>Latest service activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">Customer</th>
                    <th className="px-4 py-2">Vehicle</th>
                    <th className="px-4 py-2">Service</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentJobs.map((job) => (
                    <tr key={job.id} className="border-b">
                      <td className="px-4 py-3">{job.customer}</td>
                      <td className="px-4 py-3">{job.vehicle}</td>
                      <td className="px-4 py-3">{job.service}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            job.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : job.status === "In Progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        ${job.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  description,
  icon,
  color,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-full ${color}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
