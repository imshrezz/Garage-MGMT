import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Vehicles = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Vehicle Management
          </h1>
          <p className="text-muted-foreground">
            Track and manage all vehicles registered in your garage
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicles</CardTitle>
          <CardDescription>This feature is coming soon</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-20">
          <Car className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Vehicle Management</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            This feature is under development. You'll soon be able to manage
            vehicles independently of customers, track service history, and
            more.
          </p>
          <Button>Back to Dashboard</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Vehicles;
