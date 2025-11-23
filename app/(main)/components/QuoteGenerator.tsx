"use client";

import { useState } from "react";
// 1. Import the new libraries
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

// (Your Type definitions for QuoteItem and QuoteGeneratorProps are perfect)
type QuoteItem = {
  product_id: number;
  quantity: number;
  name: string;
  image_url: string | null;
  price: number;
  itemTotal: number;
};
type QuoteGeneratorProps = {
  items: QuoteItem[];
  subtotal: number;
  userName: string;
};

export default function QuoteGenerator({
  items,
  subtotal,
  userName,
}: QuoteGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const today = new Date().toLocaleDateString();

  // 2. The NEW Download Handler
  const handleDownload = () => {
    setIsLoading(true);
    
    // Create a new PDF document
    const doc = new jsPDF();

    // --- 3. Add Content to the PDF ---
    
    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Ravi Variety", 20, 30);

    // Subtitle
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Product Quote", 20, 38);

    // Info
    doc.setFontSize(10);
    doc.text(`Quote For: ${userName}`, 20, 50);
    doc.text(`Date: ${today}`, 20, 56);

    // --- 4. Create the Table Data ---
    const tableHead = [["Item", "Qty", "Unit Price", "Total"]];
    const tableBody = items.map((item) => [
      item.name,
      item.quantity,
      `Rs. ${item.price.toFixed(2)}`,
      `Rs. ${item.itemTotal.toFixed(2)}`,
    ]);

    // --- 5. Add the Table using autoTable ---
    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      startY: 70, // Where to start the table
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [34, 34, 34] }, // Dark header

      columnStyles: {
        // 0: { halign: 'left' }, // 'Item' column (index 0)
        1: { halign: 'center' }, // 'Qty' column (index 1)
        2: { halign: 'right' },  // 'Unit Price' column (index 2)
        3: { halign: 'right' }   // 'Total' column (index 3)
      }
    });

    // --- 6. Add the Total ---
    // autoTable gives us the final Y position
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Total:", 150, finalY + 15, { align: "right" });
    doc.text(`Rs. ${subtotal.toFixed(2)}`, 190, finalY + 15, { align: "right" });
    doc.text("Tax: TBD", 190, finalY + 22, { align: "right" });

    // --- 7. Save the PDF ---
    doc.save(`quote-ravi-variety-${today}.pdf`);
    
    setIsLoading(false);
  };

  // --- 8. The UI (No more ref) ---
  // This is just the on-screen display. We've removed the `ref`
  // and fixed the table wrapper div to solve the hydration error.
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generate Your Quote</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Your cart has been converted into a quote. You can download the
            PDF below to share with us.
          </p>
          <Button
            onClick={handleDownload}
            disabled={isLoading}
            size="lg"
            className="mt-4"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download as PDF
          </Button>
        </CardContent>
      </Card>

      {/* --- This is just for on-screen display --- */}
      <div
        className="bg-white p-8 sm:p-12 border rounded-lg"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ravi Variety</h1>
          <span className="text-xl font-medium text-gray-500">QUOTE</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <h4 className="text-sm text-gray-500 font-semibold">Quote For</h4>
            <p className="font-medium text-gray-900">{userName}</p>
          </div>
          <div className="text-right">
            <h4 className="text-sm text-gray-500 font-semibold">Date</h4>
            <p className="font-medium text-gray-900">{today}</p>
          </div>
        </div>

        {/* --- 9. Hydration Fix ---
            The <div> wrapper around the <Table> was causing the
            hydration error. We'll put the Table component back to
            how it was. It might overflow on small screens, but it
            won't break the page, and the PDF will be perfect.
        */}
        <Table className="mb-8">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60%]">Item</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.product_id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">
                  ₹{item.price.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ₹{item.itemTotal.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">TBD</span>
            </div>
            <Separator />
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Thank you for your business!</p>
          <p>This is a quote, not a final invoice.</p>
        </div>
      </div>
    </div>
  );
}