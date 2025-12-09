"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onScan: (decodedText: string) => void;
  onClose: () => void;
  fullScreen?: boolean; 
};

export default function BaseScanner({ onScan, onClose, fullScreen = true }: Props) {
  const [loading, setLoading] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionId = "html5-qrcode-reader";
  const isScanning = useRef(false);

  useEffect(() => {
    const startScanner = async () => {
      try {
        if (scannerRef.current) return;

        // --- FIX: Pass formatsToSupport HERE in the constructor ---
        scannerRef.current = new Html5Qrcode(regionId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
          ],
          verbose: false
        });
        
        await scannerRef.current.start(
          { facingMode: "environment" }, 
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            // formatsToSupport REMOVED from here
          },
          (decodedText) => {
            onScan(decodedText);
          },
          (errorMessage) => {
            // ignore scan errors
          }
        );
        isScanning.current = true;
        setLoading(false);
      } catch (err) {
        console.error("Scanner Error", err);
        setLoading(false);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && isScanning.current) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
          isScanning.current = false;
        }).catch(console.error);
      }
    };
  }, [onScan]);

  const containerClass = fullScreen 
    ? "fixed inset-0 z-[60] bg-black flex flex-col" 
    : "relative w-full aspect-square bg-black rounded-lg overflow-hidden";

  return (
    <div className={containerClass}>
      {fullScreen && (
        <div className="absolute top-4 right-4 z-20">
          <Button variant="secondary" size="icon" onClick={onClose} className="rounded-full bg-black/50 text-white hover:bg-black/70 border-none">
            <X className="w-6 h-6" />
          </Button>
        </div>
      )}

      <div className="relative flex-1 flex items-center justify-center">
        {loading && <Loader2 className="w-10 h-10 text-white animate-spin absolute z-10" />}
        <div id={regionId} className="w-full h-full" />
      </div>
    </div>
  );
}