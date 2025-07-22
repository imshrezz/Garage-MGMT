import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GSTBillingForm from "@/components/billing/GSTBillingForm";
import NonGSTBillingForm from "@/components/billing/NonGSTBillingForm";

const Billing = () => {
  const [activeTab, setActiveTab] = useState<string>("gst");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create New Bill</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-[400px] mb-6">
              <TabsTrigger value="gst">GST Bill</TabsTrigger>
              <TabsTrigger value="non-gst">Non-GST Bill</TabsTrigger>
            </TabsList>

            <TabsContent value="gst">
              <GSTBillingForm />
            </TabsContent>

            <TabsContent value="non-gst">
              <NonGSTBillingForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;
