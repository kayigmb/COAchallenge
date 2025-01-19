"use client";

import React, { useEffect, useRef } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormControl } from "@/components/ui/form";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";

// @ts-ignore
const CalendarPicker = ({ field }) => {
  const today = new Date().toISOString().split("T")[0];
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      // @ts-ignore
      inputRef?.current?.focus();
      // @ts-ignore
      inputRef?.current?.click();
    }
  }, []);

  // @ts-ignore
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    const dateObject = new Date(selectedDate);
    // @ts-ignore
    if (!isNaN(dateObject)) {
      field.onChange(dateObject);
    } else {
      console.error("Invalid date selected.");
    }
  };

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
        <Input
          type="date"
          {...field}
          min={today}
          ref={inputRef}
          onChange={handleDateChange}
        />
      </PopoverContent>
    </Popover>
  );
};

export default CalendarPicker;
