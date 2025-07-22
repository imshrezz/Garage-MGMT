import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Phone, Mail, History, Gift, Bell, Clock } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ServiceHistoryItem {
  date: string;
  type: string;
  vehicleNumber: string;
  description: string;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  lastServiceDate: string;
  lastServiceType: string;
  vehicleNumber: string;
  totalServices: number;
  serviceHistory: ServiceHistoryItem[];
}

const CustomerServiceHistory: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [offerDetails, setOfferDetails] = useState("");
  const [bulkOfferOpen, setBulkOfferOpen] = useState(false);
  const [bulkOfferDetails, setBulkOfferDetails] = useState("");
  const [sendingBulkOffer, setSendingBulkOffer] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingOffer, setSendingOffer] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [testingReminder, setTestingReminder] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/mail/service-history?page=${currentPage}&limit=${pageSize}`);
      
      // Initialize with empty array to prevent undefined errors
      let customersData = [];
      let totalPagesCount = 1;

      if (response.data) {
        if (Array.isArray(response.data)) {
          customersData = response.data;
          totalPagesCount = Math.ceil(response.data.length / pageSize);
        } else if (response.data.customers) {
          customersData = response.data.customers;
          totalPagesCount = response.data.totalPages || Math.ceil(response.data.customers.length / pageSize);
        }
      }

      setCustomers(customersData);
      setTotalPages(totalPagesCount);
    } catch (err: any) {
      console.error("Error fetching customers:", err);
      setError(err.response?.data?.message || "Failed to fetch customers");
      setCustomers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage]);

  const handleSendEmail = async () => {
    if (!selectedCustomer) return;
    try {
      setSendingEmail(true);
      await api.post("/mail/send", {
        to: selectedCustomer.email,
        subject: emailSubject,
        text: emailBody,
      });
      toast.success("Email sent successfully");
      setEmailOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendOffer = async () => {
    if (!selectedCustomer) return;
    try {
      setSendingOffer(true);
      await api.post("/mail/send-offer", {
        to: selectedCustomer.email,
        offerDetails,
        customerName: selectedCustomer.name,
      });
      toast.success("Offer sent successfully");
      setOfferOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send offer");
    } finally {
      setSendingOffer(false);
    }
  };

  const handleSendReminder = async () => {
    if (!selectedCustomer) return;
    try {
      setSendingReminder(true);
      await api.post("/mail/send-reminder", {
        customerId: selectedCustomer._id,
        vehicleNumber: selectedCustomer.vehicleNumber,
        lastServiceDate: selectedCustomer.lastServiceDate,
        serviceType: selectedCustomer.lastServiceType,
      });
      toast.success("Service reminder sent successfully");
      setReminderOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send service reminder");
    } finally {
      setSendingReminder(false);
    }
  };

  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleSendBulkOffer = async () => {
    if (!bulkOfferDetails.trim()) {
      toast.error("Please enter offer details");
      return;
    }

    try {
      setSendingBulkOffer(true);
      const response = await api.post("/mail/send-bulk-offer", {
        offerDetails: bulkOfferDetails
      });
      
      // Show detailed summary
      const { summary } = response.data;
      toast.success(
        <div>
          <p>Offer sending completed!</p>
          <p>Successfully sent: {summary.successCount}</p>
          <p>Failed: {summary.failureCount}</p>
          {summary.failedEmails.length > 0 && (
            <p>Failed emails: {summary.failedEmails.join(", ")}</p>
          )}
        </div>
      );
      
      setBulkOfferOpen(false);
      setBulkOfferDetails("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send bulk offer");
    } finally {
      setSendingBulkOffer(false);
    }
  };

  const diwaliOfferTemplate = `🎉 Diwali Special Offer! 🎉

Dear Valued Customer,

We are delighted to bring you our exclusive Diwali Special Service Package!

🌟 Special Diwali Offer:
• 20% OFF on all general services
• Free car wash with every service
• Free interior cleaning
• Free wheel alignment check
• Free battery health check

📅 Valid until: November 15, 2024

🎁 Additional Benefits:
• Free pick-up and drop service
• Complimentary Diwali gift hamper
• Priority service during festival season

💫 Book your service now and drive into the festive season with a perfectly maintained vehicle!

To avail this offer, simply mention "DIWALI2024" when booking your service.

Best regards,
Your Auto Service Team`;

  const monsoonServiceTemplate = `🌧️ Monsoon Special Service Package! 🌧️

Dear Valued Customer,

Prepare your vehicle for the monsoon season with our exclusive Monsoon Care Package!

🔧 Monsoon Special Services:
• Complete brake system check
• Wiper blade replacement at 30% OFF
• Waterproofing treatment
• AC system check and service
• Undercarriage rust protection

💰 Special Pricing:
• 15% OFF on all monsoon-related services
• Free water leak check
• Free electrical system check

⏰ Limited Time Offer:
Valid until the end of monsoon season

🚗 Book your monsoon service now and drive safely through the rains!

To avail this offer, mention "MONSOON2024" when booking your service.

Best regards,
Your Auto Service Team`;

  const newYearTemplate = `🎊 New Year Special Offer! 🎊

Dear Valued Customer,

Start your new year with a perfectly maintained vehicle!

🌟 New Year Special Package:
• 25% OFF on complete car service
• Free detailing and polish
• Free engine tune-up
• Free battery check
• Free tire rotation and balancing

🎁 Additional Benefits:
• Free pick-up and drop service
• Complimentary car wash
• Priority service booking

📅 Valid until: January 31, 2024

💫 Make your first resolution count - keep your vehicle in top condition!

To avail this offer, mention "NEWYEAR2024" when booking your service.

Best regards,
Your Auto Service Team`;

  const summerServiceTemplate = `☀️ Summer Special Service Package! ☀️

Dear Valued Customer,

Beat the heat with our exclusive Summer Care Package!

🔧 Summer Special Services:
• Complete AC system check and service
• Coolant system flush and refill
• Battery health check
• Tire pressure check and rotation
• Engine cooling system check

💰 Special Pricing:
• 20% OFF on AC services
• Free coolant top-up
• Free battery terminal cleaning

⏰ Limited Time Offer:
Valid until the end of summer

🚗 Keep your cool this summer with our specialized services!

To avail this offer, mention "SUMMER2024" when booking your service.

Best regards,
Your Auto Service Team`;

  const loyaltyTemplate = `🎯 Loyalty Rewards Program! 🎯

Dear Valued Customer,

Thank you for being a loyal customer! We're excited to introduce our new Loyalty Rewards Program.

🌟 Exclusive Benefits:
• Earn points on every service
• Priority service scheduling
• 10% OFF on all services
• Free car wash with every service
• Birthday month special discount

💎 Current Loyalty Status:
• Points earned: [Points]
• Available discounts: [Discounts]
• Next service due: [Date]

🎁 Special Offer:
Book your next service within 30 days and get double loyalty points!

To avail these benefits, simply mention "LOYALTY2024" when booking your service.

Best regards,
Your Auto Service Team`;

  const handleTemplateSelect = (template: string) => {
    switch (template) {
      case 'diwali':
        setBulkOfferDetails(diwaliOfferTemplate);
        break;
      case 'monsoon':
        setBulkOfferDetails(monsoonServiceTemplate);
        break;
      case 'newyear':
        setBulkOfferDetails(newYearTemplate);
        break;
      case 'summer':
        setBulkOfferDetails(summerServiceTemplate);
        break;
      case 'loyalty':
        setBulkOfferDetails(loyaltyTemplate);
        break;
      default:
        setBulkOfferDetails('');
    }
  };

  const handleTestAutomaticReminder = async () => {
    try {
      setTestingReminder(true);
      const response = await api.post("/mail/test-automatic-reminder");
      toast.success(response.data.message || "Automatic service reminder test completed");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to test automatic service reminder");
    } finally {
      setTestingReminder(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customer Service History</h1>
        <div className="flex gap-4">
          <Button 
            onClick={handleTestAutomaticReminder}
            disabled={testingReminder}
            variant="outline"
            className="flex items-center gap-2"
          >
            {testingReminder ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Clock className="h-4 w-4" />
                Test Auto Reminders
              </>
            )}
          </Button>
          <Button 
            onClick={() => setBulkOfferOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Send Offer to All Customers
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Name</TableHead>
              <TableHead>Vehicle Number</TableHead>
              <TableHead>Last Service</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Total Services</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.vehicleNumber}</TableCell>
                  <TableCell>
                    {format(new Date(customer.lastServiceDate), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{customer.lastServiceType}</TableCell>
                  <TableCell>{customer.totalServices}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleCall(customer.mobile)}>
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedCustomer(customer);
                        setEmailOpen(true);
                      }}>
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedCustomer(customer);
                        setReminderOpen(true);
                      }} title="Send Service Reminder">
                        <Bell className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedCustomer(customer);
                        setOfferOpen(true);
                      }} title="Send Special Offer">
                        <Gift className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Email Dialog */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>To</Label>
                <Input value={selectedCustomer.email} disabled />
              </div>
              <div className="grid gap-2">
                <Label>Subject</Label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Message</Label>
                <Textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={5}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEmailOpen(false)} disabled={sendingEmail}>
                  Cancel
                </Button>
                <Button onClick={handleSendEmail} disabled={sendingEmail}>
                  {sendingEmail ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send"
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Offer Dialog */}
      <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Special Offer</DialogTitle>
            <DialogDescription>
              Create a personalized offer for {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>To</Label>
                <Input value={selectedCustomer.email} disabled />
              </div>
              <div className="grid gap-2">
                <Label>Offer Details</Label>
                <Textarea
                  value={offerDetails}
                  onChange={(e) => setOfferDetails(e.target.value)}
                  rows={5}
                  placeholder="Enter your special offer details here..."
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOfferOpen(false)} disabled={sendingOffer}>
                  Cancel
                </Button>
                <Button onClick={handleSendOffer} disabled={sendingOffer}>
                  {sendingOffer ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Offer"
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Service Reminder Dialog */}
      <Dialog open={reminderOpen} onOpenChange={setReminderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Service Reminder</DialogTitle>
            <DialogDescription>
              Send a service reminder to {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Customer</Label>
                <Input value={selectedCustomer.name} disabled />
              </div>
              <div className="grid gap-2">
                <Label>Vehicle Number</Label>
                <Input value={selectedCustomer.vehicleNumber} disabled />
              </div>
              <div className="grid gap-2">
                <Label>Last Service</Label>
                <Input 
                  value={`${format(new Date(selectedCustomer.lastServiceDate), 'dd/MM/yyyy')} - ${selectedCustomer.lastServiceType}`} 
                  disabled 
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setReminderOpen(false)} disabled={sendingReminder}>
                  Cancel
                </Button>
                <Button onClick={handleSendReminder} disabled={sendingReminder}>
                  {sendingReminder ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reminder"
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Offer Dialog */}
      <Dialog open={bulkOfferOpen} onOpenChange={setBulkOfferOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Offer to All Customers</DialogTitle>
            <DialogDescription>
              This will send the offer to all customers with valid email addresses.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label>Offer Details</Label>
                <Select onValueChange={handleTemplateSelect}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diwali">Diwali Special</SelectItem>
                    <SelectItem value="monsoon">Monsoon Service</SelectItem>
                    <SelectItem value="newyear">New Year Special</SelectItem>
                    <SelectItem value="summer">Summer Service</SelectItem>
                    <SelectItem value="loyalty">Loyalty Program</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                value={bulkOfferDetails}
                onChange={(e) => setBulkOfferDetails(e.target.value)}
                rows={12}
                placeholder="Enter your special offer details here..."
                className="font-mono min-h-[300px] resize-y"
                disabled={sendingBulkOffer}
              />
            </div>
            <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
              <Button variant="outline" onClick={() => setBulkOfferOpen(false)} disabled={sendingBulkOffer}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendBulkOffer}
                disabled={sendingBulkOffer}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {sendingBulkOffer ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send to All Customers"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerServiceHistory;
