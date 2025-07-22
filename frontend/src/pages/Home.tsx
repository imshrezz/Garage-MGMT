import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router";
import {
  Car,
  FileText,
  Users,
  Wrench,
  BarChart,
  DollarSign,
} from "lucide-react";

export const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 md:p-8">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-garage-blue mb-4">
            Webg Garage Management System
          </h1>
          <p className="text-xl text-muted-foreground">
            Complete solution for car garage management with customer, job card,
            billing, and reporting capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Customers Module Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-garage-blue" />
                Customers
              </CardTitle>
              <CardDescription>
                Manage customers and their vehicles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-6">
                Add, update, and track customer information along with their
                vehicle details.
              </p>
              <Button asChild className="w-full">
                <Link to="/customers">Go to Customers</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Job Cards Module Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-6 w-6 text-garage-blue" />
                Job Cards
              </CardTitle>
              <CardDescription>Track service and repair jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-6">
                Create and manage job cards for vehicle services, repairs, and
                maintenance.
              </p>
              <Button asChild className="w-full">
                <Link to="/jobcards">Go to Job Cards</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Billing Module Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-garage-blue" />
                Billing
              </CardTitle>
              <CardDescription>Generate GST and Non-GST Bills</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-6">
                Create professional invoices with or without GST for your
                customers.
              </p>
              <Button asChild className="w-full">
                <Link to="/billing">Go to Billing</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Reports Module Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-6 w-6 text-garage-blue" />
                Reports
              </CardTitle>
              <CardDescription>Analyze garage performance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-6">
                Access various reports to analyze your business performance and
                metrics.
              </p>
              <Button asChild className="w-full">
                <Link to="/reports">Go to Reports</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Expenses Module Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-garage-blue" />
                Expenses
              </CardTitle>
              <CardDescription>Track garage operational costs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-6">
                Record and manage all your garage-related expenses and view
                summaries.
              </p>
              <Button asChild className="w-full">
                <Link to="/expenses">Go to Expenses</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-6 w-6 text-garage-blue" />
                Vehicle Management
              </CardTitle>
              <CardDescription>
                Track all vehicles in your garage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-6">
                View and manage all vehicles registered in your garage system.
              </p>
              <Button asChild className="w-full">
                <Link to="/vehicles">Go to Vehicles</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
