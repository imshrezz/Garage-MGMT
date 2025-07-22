import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JobCardList } from "@/components/jobcards/JobCardList";
import { AddJobCardDialog } from "@/components/jobcards/AddJobCardDialog";

export const JobCards = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const handleRefresh = () => {
    setRefreshTrigger(prev => !prev);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Job Card Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage service jobs for vehicles
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Job Card
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Job Cards</CardTitle>
          <CardDescription>
            View and manage all your service jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search job cards, vehicles, or customers..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>

          <JobCardList 
            searchQuery={searchQuery} 
            refreshTrigger={refreshTrigger}
            onDeletedOrAdded={handleRefresh}
          />
        </CardContent>
      </Card>

      <AddJobCardDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleRefresh}
      />
    </div>
  );
};

export default JobCards;
