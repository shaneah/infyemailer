import React, { useState, useEffect } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format, subDays, isValid, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DateRangePickerProps {
  onChange: (startDate: Date, endDate: Date) => void;
  defaultDateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

type DatePreset = {
  name: string;
  label: string;
  getValue: () => { from: Date; to: Date };
};

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onChange,
  defaultDateRange,
}) => {
  // Initialize with default values or current date
  const [startDate, setStartDate] = useState<Date | undefined>(
    defaultDateRange?.startDate || subDays(new Date(), 7)
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    defaultDateRange?.endDate || new Date()
  );
  const [isSelectionMode, setIsSelectionMode] = useState<'start' | 'end'>('start');
  const [open, setOpen] = useState(false);

  // Presets for date selection
  const datePresets: DatePreset[] = [
    {
      name: 'last7days',
      label: 'Last 7 Days',
      getValue: () => ({
        from: subDays(new Date(), 7),
        to: new Date(),
      }),
    },
    {
      name: 'last14days',
      label: 'Last 14 Days',
      getValue: () => ({
        from: subDays(new Date(), 14),
        to: new Date(),
      }),
    },
    {
      name: 'last30days',
      label: 'Last 30 Days',
      getValue: () => ({
        from: subDays(new Date(), 30),
        to: new Date(),
      }),
    },
    {
      name: 'last90days',
      label: 'Last 90 Days',
      getValue: () => ({
        from: subDays(new Date(), 90),
        to: new Date(),
      }),
    },
  ];

  // When a date is selected in the calendar
  const handleDaySelect = (day: Date | undefined) => {
    if (!day) return;

    if (isSelectionMode === 'start') {
      // If selecting start date and it's after the current end date,
      // reset the end date
      setStartDate(day);
      setIsSelectionMode('end');
      if (endDate && day > endDate) {
        setEndDate(undefined);
      }
    } else {
      // Make sure end date is not before start date
      if (startDate && day < startDate) {
        setStartDate(day);
        setEndDate(startDate);
      } else {
        setEndDate(day);
        setIsSelectionMode('start');
        setOpen(false); // Close the popover after end date is selected
      }
    }
  };

  const handlePresetChange = (presetName: string) => {
    const preset = datePresets.find((p) => p.name === presetName);
    if (preset) {
      const { from, to } = preset.getValue();
      setStartDate(from);
      setEndDate(to);
      setIsSelectionMode('start');
    }
  };

  // Trigger onChange callback when dates change
  useEffect(() => {
    if (startDate && endDate) {
      onChange(startDate, endDate);
    }
  }, [startDate, endDate, onChange]);

  const formatDate = (date: Date | undefined) => {
    return date ? format(date, 'MMM dd, yyyy') : '';
  };

  const displayText = `${formatDate(startDate)} - ${formatDate(endDate)}`;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left sm:w-auto"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex w-auto flex-col space-y-2 p-2" align="start">
          <Select
            onValueChange={handlePresetChange}
            defaultValue="custom"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a preset" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="custom">Custom Range</SelectItem>
              {datePresets.map((preset) => (
                <SelectItem key={preset.name} value={preset.name}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center justify-center gap-2 pt-2">
            <div>
              <p className="mb-1 text-xs font-medium">Start Date</p>
              <div
                className={`rounded-md border p-1 ${
                  isSelectionMode === 'start' ? 'border-primary' : 'border-muted'
                }`}
              >
                <Button
                  variant="ghost"
                  className="h-auto p-1 text-xs"
                  onClick={() => setIsSelectionMode('start')}
                >
                  {formatDate(startDate)}
                </Button>
              </div>
            </div>
            <span className="text-muted-foreground">to</span>
            <div>
              <p className="mb-1 text-xs font-medium">End Date</p>
              <div
                className={`rounded-md border p-1 ${
                  isSelectionMode === 'end' ? 'border-primary' : 'border-muted'
                }`}
              >
                <Button
                  variant="ghost"
                  className="h-auto p-1 text-xs"
                  onClick={() => setIsSelectionMode('end')}
                >
                  {formatDate(endDate)}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Calendar
              mode="single"
              selected={isSelectionMode === 'start' ? startDate : endDate}
              onSelect={handleDaySelect}
              disabled={(date) => {
                // If selecting end date, disable dates before start date
                if (isSelectionMode === 'end' && startDate) {
                  return date < startDate;
                }
                // Add any other date constraints here
                return false;
              }}
              initialFocus
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangePicker;