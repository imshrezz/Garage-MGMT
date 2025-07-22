import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Invoices = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            View and manage all invoices generated from billing
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Management</CardTitle>
          <CardDescription>This feature is coming soon</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-20">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Invoice Management</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            This feature is under development. You'll soon be able to view all
            invoices, track payment status, and generate reports.
          </p>
          <Button asChild>
            <a href="/billing">Go to Billing</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;
