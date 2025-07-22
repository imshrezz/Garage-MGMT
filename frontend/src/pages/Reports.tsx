import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart, Download, Calendar } from "lucide-react";
import { RevenueReport } from "@/components/reports/RevenueReport";
import { JobsReport } from "@/components/reports/JobsReport";
import { PendingJobsReport } from "@/components/reports/PendingJobsReport";
import { DateRangePicker } from "@/components/ui/date-range-picker";

export const Reports = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(1)), // First day of current month
    to: new Date(), // Today
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            View and analyze garage performance and metrics
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <DateRangePicker date={dateRange} onDateChange={setDateRange} />

          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList className="mb-4 w-full grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="pending">Pending Jobs</TabsTrigger>
          <TabsTrigger value="customers">Customer Report</TabsTrigger>
          <TabsTrigger value="mechanics">Mechanic Performance</TabsTrigger>
          <TabsTrigger value="expenses">Expenses vs Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <RevenueReport dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="jobs">
          <JobsReport dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="pending">
          <PendingJobsReport />
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Report</CardTitle>
              <CardDescription>
                Service history and revenue by customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-60">
                <p className="text-muted-foreground">
                  Customer report functionality will be implemented soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mechanics">
          <Card>
            <CardHeader>
              <CardTitle>Mechanic Performance</CardTitle>
              <CardDescription>
                Jobs completed and efficiency by mechanic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-60">
                <p className="text-muted-foreground">
                  Mechanic performance report functionality will be implemented
                  soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Expenses vs Revenue</CardTitle>
              <CardDescription>
                Compare monthly expenses against revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-60">
                <p className="text-muted-foreground">
                  Expenses vs Revenue report functionality will be implemented
                  soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
