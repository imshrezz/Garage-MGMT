import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock data for pending jobs
const pendingJobs = [
  {
    id: "JOB-0005",
    customerName: "Arjun Sharma",
    vehicleNumber: "DL05GH7890",
    jobInDate: "2023-05-19",
    estimatedDelivery: "2023-05-22",
    serviceType: "Engine",
    status: "Pending",
    daysOverdue: 0,
    assignedMechanic: "Raj Kumar",
  },
  {
    id: "JOB-0008",
    customerName: "Priya Patel",
    vehicleNumber: "MH02JK5678",
    jobInDate: "2023-05-17",
    estimatedDelivery: "2023-05-20",
    serviceType: "General",
    status: "In Progress",
    daysOverdue: 2,
    assignedMechanic: "Ankit Sharma",
  },
  {
    id: "JOB-0010",
    customerName: "Vikram Singh",
    vehicleNumber: "UP16LM9012",
    jobInDate: "2023-05-15",
    estimatedDelivery: "2023-05-18",
    serviceType: "Electrical",
    status: "In Progress",
    daysOverdue: 4,
    assignedMechanic: "Vinay Patel",
  },
  {
    id: "JOB-0012",
    customerName: "Neha Gupta",
    vehicleNumber: "HR26NP3456",
    jobInDate: "2023-05-10",
    estimatedDelivery: "2023-05-15",
    serviceType: "AC",
    status: "In Progress",
    daysOverdue: 7,
    assignedMechanic: "Raj Kumar",
  },
  {
    id: "JOB-0015",
    customerName: "Rohit Verma",
    vehicleNumber: "KA04QR7890",
    jobInDate: "2023-05-07",
    estimatedDelivery: "2023-05-12",
    serviceType: "Engine",
    status: "In Progress",
    daysOverdue: 10,
    assignedMechanic: "Ankit Sharma",
  },
];

// Status badge color helper
const getStatusColorClass = (status: string, daysOverdue: number) => {
  if (status === "Pending")
    return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
  if (daysOverdue > 7) return "bg-red-100 text-red-800 hover:bg-red-200";
  if (daysOverdue > 3)
    return "bg-orange-100 text-orange-800 hover:bg-orange-200";
  return "bg-blue-100 text-blue-800 hover:bg-blue-200";
};

export const PendingJobsReport = () => {
  // Calculate metrics
  const totalPending = pendingJobs.length;
  const overdue = pendingJobs.filter((job) => job.daysOverdue > 0).length;
  const criticalOverdue = pendingJobs.filter(
    (job) => job.daysOverdue > 7
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">
              Total Pending Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Overdue Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdue}</div>
            <p className="text-xs text-muted-foreground">
              {((overdue / totalPending) * 100).toFixed(0)}% of pending jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">
              Critical Overdue (&gt;7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalOverdue}</div>
            <p className="text-xs text-muted-foreground">
              {((criticalOverdue / totalPending) * 100).toFixed(0)}% of pending
              jobs
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Job Cards</CardTitle>
          <CardDescription>
            Jobs that are pending or in progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Vehicle
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Service Type
                  </TableHead>
                  <TableHead>Est. Delivery</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.id}</TableCell>
                    <TableCell>{job.customerName}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {job.vehicleNumber}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {job.serviceType}
                    </TableCell>
                    <TableCell>{job.estimatedDelivery}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${getStatusColorClass(
                          job.status,
                          job.daysOverdue
                        )} border-none`}
                      >
                        {job.status}
                        {job.daysOverdue > 0 &&
                          ` (${job.daysOverdue} days overdue)`}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
