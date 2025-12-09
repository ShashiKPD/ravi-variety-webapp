"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScanBarcode } from "lucide-react";
import BaseScanner from "./BaseScanner";

type Props = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
};

export default function AdminScannerInput({ value, onChange, placeholder, className }: Props) {
  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className="relative">
      <Input 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        className={`${className} pr-10`} // Make room for icon
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setShowScanner(true)}
        className="absolute right-0 top-0 h-full w-10 text-gray-500 hover:text-blue-600"
      >
        <ScanBarcode className="w-4 h-4" />
      </Button>

      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black">
          <BaseScanner 
            onScan={(code) => {
              onChange(code);
              setShowScanner(false);
            }} 
            onClose={() => setShowScanner(false)} 
          />
        </div>
      )}
    </div>
  );
}