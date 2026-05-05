'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { RiCalendarLine as CalendarIcon } from '@remixicon/react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function DatePicker({ value, onChange, placeholder = '选择日期', className }: DatePickerProps) {
    const [date, setDate] = React.useState<Date | undefined>(
        value ? new Date(value) : undefined
    );

    React.useEffect(() => {
        setDate(value ? new Date(value) : undefined);
    }, [value]);

    const handleSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        if (onChange) {
            if (selectedDate) {
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                onChange(`${year}-${month}-${day}`);
            } else {
                onChange('');
            }
        }
    };

    return (
        <Popover>
            <PopoverTrigger render={
                <Button
                    variant="outline"
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground',
                        className,
                    )}
                />
            }>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'yyyy年MM月dd日', { locale: zhCN }) : placeholder}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleSelect}
                    locale={zhCN}
                    captionLayout="dropdown"
                    fromYear={1940}
                    toYear={new Date().getFullYear()}
                    defaultMonth={date || new Date(2000, 0)}
                />
            </PopoverContent>
        </Popover>
    );
}
