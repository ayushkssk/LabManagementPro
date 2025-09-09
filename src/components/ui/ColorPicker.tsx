import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const COLORS = [
  '#000000', '#ffffff', '#e53935', '#d81b60', '#8e24aa', '#5e35b1', 
  '#3949ab', '#1e88e5', '#039be5', '#00acc1', '#00897b', '#43a047', 
  '#7cb342', '#c0ca33', '#fdd835', '#ffb300', '#fb8c00', '#f4511e'
];

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export function ColorPicker({ 
  color, 
  onChange, 
  className,
  children 
}: ColorPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [customColor, setCustomColor] = React.useState(color);

  React.useEffect(() => {
    setCustomColor(color);
  }, [color]);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomColor(value);
    if (isValidHexColor(value)) {
      onChange(value);
    }
  };

  const handleColorSelect = (selectedColor: string) => {
    onChange(selectedColor);
    setCustomColor(selectedColor);
    setOpen(false);
  };

  const isValidHexColor = (color: string) => {
    return /^#([0-9A-F]{3}){1,2}$/i.test(color) || 
           /^#([0-9A-F]{4}){1,2}$/i.test(color) ||
           /^#([0-9A-F]{6})$/i.test(color) ||
           /^#([0-9A-F]{8})$/i.test(color);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children || (
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'w-[120px] justify-start text-left font-normal',
              !color && 'text-muted-foreground',
              className
            )}
          >
            <div className="w-4 h-4 mr-2 rounded-full border" style={{ backgroundColor: color }} />
            {color || 'Pick a color'}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4">
        <div className="grid grid-cols-6 gap-2 mb-4">
          {COLORS.map((c) => (
            <button
              key={c}
              className="w-6 h-6 rounded-full border border-muted cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-primary"
              style={{ backgroundColor: c }}
              onClick={() => handleColorSelect(c)}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            value={customColor}
            onChange={handleCustomColorChange}
            placeholder="#RRGGBB"
            className="flex-1 h-8"
          />
          <div 
            className="w-8 h-8 rounded border" 
            style={{ backgroundColor: isValidHexColor(customColor) ? customColor : 'transparent' }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
