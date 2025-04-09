import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
  color, 
  onChange, 
  label,
  className = ''
}) => {
  return (
    <div className={className}>
      {label && <Label className="text-gray-700 mb-1 block text-sm font-medium">{label}</Label>}
      <div className="flex items-center gap-2 mt-1.5">
        <div className="relative overflow-hidden rounded-md w-8 h-8">
          <input 
            type="color" 
            value={color} 
            onChange={(e) => onChange(e.target.value)}
            className="absolute w-10 h-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer border-0 p-0"
          />
        </div>
        <Input 
          value={color} 
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-8 text-sm font-mono"
        />
      </div>
    </div>
  );
};