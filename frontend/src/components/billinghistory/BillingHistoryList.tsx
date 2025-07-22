// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "@/lib/axios";
// import { toast } from "sonner";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { format } from "date-fns";

// type Customer = {
//   _id: string;
//   name: string;
//   mobile: string;
//   address?: string;
//   gstin?: string;
// };

// type JobCard = {
//   _id: string;
//   vehicleNumber: string;
//   kmIn: number;
//   kmOut: number;
//   status: string;
//   createdAt: string;
//   items: Array<{
//     description: string;
//     quantity: number;
//     rate: number;
//   }>;
//   totalAmount: number;
//   mechanicCharge: number;
// };

// type GstBill = {
//   _id: string;
//   invoiceNo: string;
//   invoiceDate: string;
//   items: Array<{
//     description: string;
//     quantity: number;
//     rate: number;
//     gstPercent: number;
//   }>;
//   totalAmount: number;
//   mechanicCharge: number;
// };

// type NonGstBill = {
//   _id: string;
//   invoiceNo: string;
//   invoiceDate: string;
//   items: Array<{
//     description: string;
//     quantity: number;
//     rate: number;
//   }>;
//   totalAmount: number;
//   mechanicCharge: number;
// };

// type ServiceHistory = {
//   jobCards: Array<{
//     date: string;
//     type: string;
//     vehicleNumber: string;
//     kmReading: number;
//     services: string[];
//     totalAmount: number;
//     mechanicCharge: number;
//   }>;
//   gstBills: Array<{
//     date: string;
//     type: string;
//     invoiceNo: string;
//     items: string[];
//     totalAmount: number;
//     mechanicCharge: number;
//   }>;
//   nonGstBills: Array<{
//     date: string;
//     type: string;
//     invoiceNo: string;
//     items: string[];
//     totalAmount: number;
//     mechanicCharge: number;
//   }>;
// };

// const BillingHistoryList = () => {
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
//   const [serviceHistory, setServiceHistory] = useState<ServiceHistory | null>(null);
//   const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     fetchCustomers();
//   }, []);

//   const fetchCustomers = async () => {
//     try {
//       setIsLoading(true);
//       const response = await api.get("/customers/with-jobcards");
//       setCustomers(response.data.customers || []);
//     } catch (error) {
//       console.error("Error fetching customers:", error);
//       toast.error("Failed to fetch customers");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchServiceHistory = async (customerId: string) => {
//     try {
//       setIsLoading(true);
//       const response = await api.get(`/customers/${customerId}/service-history`);
//       setServiceHistory(response.data);
//     } catch (error) {
//       console.error("Error fetching service history:", error);
//       toast.error("Failed to fetch service history");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCustomerClick = async (customer: Customer) => {
//     setSelectedCustomer(customer);
//     await fetchServiceHistory(customer._id);
//     setIsHistoryModalOpen(true);
//   };

//   const filteredCustomers = customers.filter((customer) =>
//     customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     customer.mobile.includes(searchTerm)
//   );

//   const formatDate = (dateString: string) => {
//     return format(new Date(dateString), "dd/MM/yyyy");
//   };

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//     }).format(amount);
//   };

//   return (
//     <div className="container mx-auto py-6 space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold">Billing History</h1>
//         <div className="w-72">
//           <Input
//             placeholder="Search customers..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//       </div>

//       <div className="border rounded-lg">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Customer Name</TableHead>
//               <TableHead>Mobile</TableHead>
//               <TableHead>GSTIN</TableHead>
//               <TableHead>Address</TableHead>
//               <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {filteredCustomers.map((customer) => (
//               <TableRow key={customer._id}>
//                 <TableCell className="font-medium">{customer.name}</TableCell>
//                 <TableCell>{customer.mobile}</TableCell>
//                 <TableCell>{customer.gstin || "N/A"}</TableCell>
//                 <TableCell>{customer.address || "N/A"}</TableCell>
//                 <TableCell className="text-right">
//                   <Button
//                     variant="outline"
//                     onClick={() => handleCustomerClick(customer)}
//                   >
//                     View History
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>

//       <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
//         <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>
//               Service History - {selectedCustomer?.name}
//             </DialogTitle>
//           </DialogHeader>

//           {isLoading ? (
//             <div className="flex justify-center items-center h-40">
//               Loading...
//             </div>
//           ) : (
//             <div className="space-y-6">
//               {/* Job Cards */}
//               {serviceHistory?.jobCards.length ? (
//                 <div>
//                   <h3 className="text-lg font-semibold mb-3">Job Cards</h3>
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Date</TableHead>
//                         <TableHead>Vehicle</TableHead>
//                         <TableHead>KM Reading</TableHead>
//                         <TableHead>Services</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {serviceHistory.jobCards.map((job, index) => (
//                         <TableRow key={index}>
//                           <TableCell>{formatDate(job.date)}</TableCell>
//                           <TableCell>{job.vehicleNumber}</TableCell>
//                           <TableCell>{job.kmReading}</TableCell>
//                           <TableCell>
//                             {job.services.join(", ")}
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//               ) : null}

//               {/* GST Bills */}
//               {serviceHistory?.gstBills.length ? (
//                 <div>
//                   <h3 className="text-lg font-semibold mb-3">GST Bills</h3>
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Date</TableHead>
//                         <TableHead>Invoice No</TableHead>
//                         <TableHead>Items</TableHead>
//                         <TableHead className="text-right">Amount</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {serviceHistory.gstBills.map((bill, index) => (
//                         <TableRow key={index}>
//                           <TableCell>{formatDate(bill.date)}</TableCell>
//                           <TableCell>{bill.invoiceNo}</TableCell>
//                           <TableCell>
//                             {bill.items.join(", ")}
//                           </TableCell>
//                           <TableCell className="text-right">
//                             {formatCurrency(bill.totalAmount)}
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//               ) : null}

//               {/* Non-GST Bills */}
//               {serviceHistory?.nonGstBills.length ? (
//                 <div>
//                   <h3 className="text-lg font-semibold mb-3">Non-GST Bills</h3>
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Date</TableHead>
//                         <TableHead>Invoice No</TableHead>
//                         <TableHead>Items</TableHead>
//                         <TableHead className="text-right">Amount</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {serviceHistory.nonGstBills.map((bill, index) => (
//                         <TableRow key={index}>
//                           <TableCell>{formatDate(bill.date)}</TableCell>
//                           <TableCell>{bill.invoiceNo}</TableCell>
//                           <TableCell>
//                             {bill.items.join(", ")}
//                           </TableCell>
//                           <TableCell className="text-right">
//                             {formatCurrency(bill.totalAmount)}
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//               ) : null}

//               {!serviceHistory?.jobCards.length &&
//                 !serviceHistory?.gstBills.length &&
//                 !serviceHistory?.nonGstBills.length && (
//                   <div className="text-center text-gray-500 py-4">
//                     No service history found
//                   </div>
//                 )}
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default BillingHistoryList;
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

type Customer = {
  _id: string;
  name: string;
  mobile: string;
  address?: string;
  gstin?: string;
};

type ServiceHistory = {
  jobCards: Array<{
    date: string;
    type: string;
    vehicleNumber: string;
    kmReading: number;
    services: string[];
    totalAmount: number;
    mechanicCharge: number;
  }>;
  gstBills: Array<{
    date: string;
    type: string;
    invoiceNo: string;
    items: string[];
    totalAmount: number;
    mechanicCharge: number;
  }>;
  nonGstBills: Array<{
    date: string;
    type: string;
    invoiceNo: string;
    items: string[];
    totalAmount: number;
    mechanicCharge: number;
  }>;
};

const BillingHistoryList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/customers/with-jobcards");
      setCustomers(response.data.customers || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to fetch customers");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServiceHistory = async (customerId: string) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/customers/${customerId}/service-history`);
      setServiceHistory(response.data);
    } catch (error) {
      console.error("Error fetching service history:", error);
      toast.error("Failed to fetch service history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerClick = async (customer: Customer) => {
    setSelectedCustomer(customer);
    await fetchServiceHistory(customer._id);
    setIsHistoryModalOpen(true);
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.mobile.includes(searchTerm)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Billing History</h1>
        <div className="w-72">
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>GSTIN</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCustomers.map((customer) => (
              <TableRow key={customer._id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.mobile}</TableCell>
                <TableCell>{customer.gstin || "N/A"}</TableCell>
                <TableCell>{customer.address || "N/A"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    onClick={() => handleCustomerClick(customer)}
                  >
                    View History
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 p-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Service History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Service History - {selectedCustomer?.name}
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              Loading...
            </div>
          ) : (
            <div className="space-y-6">
              {/* Job Cards */}
              {serviceHistory?.jobCards.length ? (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Job Cards</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>KM Reading</TableHead>
                        <TableHead>Services</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {serviceHistory.jobCards.map((job, index) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(job.date)}</TableCell>
                          <TableCell>{job.vehicleNumber}</TableCell>
                          <TableCell>{job.kmReading}</TableCell>
                          <TableCell>
                            {job.services.join(", ")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : null}

              {/* GST Bills */}
              {serviceHistory?.gstBills.length ? (
                <div>
                  <h3 className="text-lg font-semibold mb-3">GST Bills</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Invoice No</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {serviceHistory.gstBills.map((bill, index) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(bill.date)}</TableCell>
                          <TableCell>{bill.invoiceNo}</TableCell>
                          <TableCell>
                            {bill.items.join(", ")}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(bill.totalAmount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : null}

              {/* Non-GST Bills */}
              {serviceHistory?.nonGstBills.length ? (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Non-GST Bills</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Invoice No</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {serviceHistory.nonGstBills.map((bill, index) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(bill.date)}</TableCell>
                          <TableCell>{bill.invoiceNo}</TableCell>
                          <TableCell>
                            {bill.items.join(", ")}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(bill.totalAmount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : null}

              {!serviceHistory?.jobCards.length &&
                !serviceHistory?.gstBills.length &&
                !serviceHistory?.nonGstBills.length && (
                  <div className="text-center text-gray-500 py-4">
                    No service history found
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillingHistoryList;
