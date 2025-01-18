"use client";

import React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormControl } from "@/components/ui/form";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const CalendarPicker = ({ field }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            className={cn(
              "w-full flex items-center justify-between px-3 py-2",
              !field.value && "text-muted-foreground",
            )}
          >
            <span className="truncate">
              {field.value ? format(field.value, "PPP") : "Pick a date"}
            </span>
            <CalendarIcon className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto" align="start">
        <Calendar
          mode="single"
          selected={field.value}
          onSelect={field.onChange}
          disabled={(date) => date < new Date()}
          initialFocus
          className="rounded-md border shadow-sm"
        />
      </PopoverContent>
    </Popover>
  );
};

export default CalendarPicker;
