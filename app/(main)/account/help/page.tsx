import BackButton from "@/app/(main)/components/BackButton"; // Ensure you have this shared component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Phone, Mail, MapPin } from "lucide-react";

export default function HelpCenterPage() {
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-20">
      
      <div className="mb-6">
        <BackButton href="/account" label="Back to Account" />
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Help Center</h1>
      </div>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Customer Support</p>
              <p className="text-sm text-gray-600">+91 96937 49835</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Email Support</p>
              <p className="text-sm text-gray-600">support@ravivariety.in</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Head Office</p>
              <p className="text-sm text-gray-600">Rajrappa project, Ramgarh, jharkhand</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQs */}
      <h2 className="text-lg font-bold text-gray-900 pt-4">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full bg-white rounded-lg border px-4">
        <AccordionItem value="item-1">
          <AccordionTrigger>How do I check my order status?</AccordionTrigger>
          <AccordionContent>
            You can check the status of your order by visiting the &quot;My Orders&quot; section in your account dashboard. We update the status as soon as it is approved or shipped.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Why can&apos;t I see wholesale prices?</AccordionTrigger>
          <AccordionContent>
            Wholesale pricing is only available to approved Wholesaler accounts. If you believe your account role is incorrect, please contact support.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>What is the minimum order quantity?</AccordionTrigger>
          <AccordionContent>
            The minimum order quantity depends on the specific product. You can see the bulk tiers on the product detail page.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>Can I cancel my order?</AccordionTrigger>
          <AccordionContent>
            Yes, you can cancel your order within 1 hour of placing it, provided it has not yet been approved by the admin. Go to Order Details to find the Cancel button.
          </AccordionContent>
        </AccordionItem>
      </Accordion>

    </div>
  );
}