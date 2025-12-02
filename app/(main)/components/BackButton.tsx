"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  label?: string;
  className?: string;
};

export default function BackButton({ href, label = "Back", className }: Props) {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      asChild 
      className={cn("-ml-2 pl-2 gap-2 text-gray-500 hover:text-gray-900 w-fit mb-2", className)}
    >
      <Link href={href}>
        <ArrowLeft className="w-4 h-4" />
        {label}
      </Link>
    </Button>
  );
}