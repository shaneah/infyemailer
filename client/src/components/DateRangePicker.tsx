import * as React from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  from?: Date;
  to?: Date;
  onFromChange: (date?: Date) => void;
  onToChange: (date?: Date) => void;
  className?: string;
}

export function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
  className,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(
    from || to
      ? {
          from: from || undefined,
          to: to || undefined,
        }
      : undefined
  );

  // Update the parent component when the date range changes
  React.useEffect(() => {
    if (date?.from !== from) {
      onFromChange(date?.from);
    }
    if (date?.to !== to) {
      onToChange(date?.to);
    }
  }, [date, from, to, onFromChange, onToChange]);

  // Update internal state when props change
  React.useEffect(() => {
    if (from !== date?.from || to !== date?.to) {
      setDate({
        from: from || undefined,
        to: to || undefined,
      });
    }
  }, [from, to]);

  const clearDates = () => {
    setDate(undefined);
    onFromChange(undefined);
    onToChange(undefined);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              "Pick a date range"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Select Range</h4>
              {date && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearDates}
                  className="h-7 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="flex mt-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  const today = new Date();
                  const from = addDays(today, -7);
                  setDate({ from, to: today });
                }}
              >
                Last 7 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  const today = new Date();
                  const from = addDays(today, -30);
                  setDate({ from, to: today });
                }}
              >
                Last 30 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  const today = new Date();
                  const from = addDays(today, -90);
                  setDate({ from, to: today });
                }}
              >
                Last 90 days
              </Button>
            </div>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}