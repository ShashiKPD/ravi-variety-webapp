"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings, Save, Loader2, Info } from "lucide-react";
// Ensure this path matches your file structure. 
// It might be "@/app/actions/settings" or "@/app/admin/settings/actions" depending on where you put it.
import { updateAppSetting } from "@/app/actions/settings"; 
import { toast } from "sonner";

type Setting = {
  key: string;
  value: string;
  description: string | null;
};

export default function AppSettingsCard({ settings }: { settings: Setting[] }) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const handleUpdate = async (formData: FormData) => {
    const key = formData.get("key") as string;
    setLoadingKey(key);
    
    try {
      const res = await updateAppSetting(formData);
      
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Setting updated successfully");
      }
    } catch (err) {
      toast.error("Failed to update setting");
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
        <Settings className="w-4 h-4 text-gray-500" />
        <h2 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Global Variables
        </h2>
      </div>
      
      {/* Settings List */}
      <div className="divide-y divide-gray-100">
        {settings.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            No settings found in the database.
          </div>
        ) : (
          settings.map((setting) => (
            <div key={setting.key} className="p-4 sm:p-6 group hover:bg-gray-50/30 transition-colors">
              <form action={handleUpdate} className="flex flex-col sm:flex-row gap-4 sm:items-start">
                <input type="hidden" name="key" value={setting.key} />
                
                <div className="flex-1 space-y-1.5 w-full">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={setting.key} className="text-sm font-medium text-gray-700 capitalize">
                       {/* Humanize key: 'new_arrivals_days' -> 'New Arrivals Days' */}
                       {setting.key.replace(/_/g, ' ')}
                    </Label>
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1 rounded sm:hidden">
                      {setting.key}
                    </span>
                  </div>
                  
                  <Input 
                    id={setting.key}
                    name="value" 
                    defaultValue={setting.value} 
                    className="bg-white h-10 w-full"
                  />
                  
                  {setting.description && (
                    <div className="flex items-start gap-1.5 text-xs text-gray-500 mt-1">
                      <Info className="w-3 h-3 mt-0.5 text-blue-500 shrink-0" />
                      <span className="leading-snug">{setting.description}</span>
                    </div>
                  )}
                </div>

                <div className="sm:mt-7 shrink-0">
                  <Button 
                    type="submit" 
                    size="sm" 
                    className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white active:scale-95 transition-all min-w-[80px]"
                    disabled={loadingKey === setting.key}
                  >
                    {loadingKey === setting.key ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" /> Save
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}