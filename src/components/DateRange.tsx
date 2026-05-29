'use client';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Box, Button } from '@mui/material';
import dayjs, { type Dayjs } from 'dayjs';

interface DateRangeProps {
    startDate: Dayjs | null;
    endDate: Dayjs | null;
    onStartChange: (val: Dayjs | null) => void;
    onEndChange: (val: Dayjs | null) => void;
    onApply?: () => void;
    yearOnly?: boolean;
    minYear?: number;
    maxYear?: number;
}

export default function DateRange({
    startDate,
    endDate,
    onStartChange,
    onEndChange,
    onApply,
    yearOnly = false,
    minYear,
    maxYear,
}: DateRangeProps) {
    const minDate = minYear ? dayjs().year(minYear).startOf('year') : undefined;
    const maxDate = maxYear ? dayjs().year(maxYear).endOf('year') : undefined;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
            <DatePicker
                label="From"
                value={startDate}
                onChange={(val) => {
                    onStartChange(val);
                    if (endDate && val && val.isAfter(endDate)) onEndChange(null);
                }}
                minDate={minDate}
                maxDate={endDate ?? maxDate}
                views={yearOnly ? ['year'] : ['year', 'month', 'day']}
                openTo={yearOnly ? 'year' : 'day'}
                slotProps={{
                    textField: {
                        size: 'small',
                        sx: { width: yearOnly ? 100 : 160 },
                    },
                    popper: {
                        sx: {
                            '& .MuiDateCalendar-root': {
                                width: yearOnly ? 280 : undefined,
                                height: yearOnly ? 'auto' : undefined,
                                borderRadius: 2,
                            },
                            '& .MuiYearCalendar-root': {
                                width: yearOnly ? 280 : undefined,
                                paddingTop: 2,
                                paddingBottom: 2,
                            },
                        },
                    },
                }}
            />
            <DatePicker
                label="To"
                value={endDate}
                onChange={onEndChange}
                minDate={startDate ?? minDate}
                maxDate={maxDate}
                disabled={!startDate}
                views={yearOnly ? ['year'] : ['year', 'month', 'day']}
                openTo={yearOnly ? 'year' : 'day'}
                slotProps={{
                    textField: {
                        size: 'small',
                        sx: { width: yearOnly ? 100 : 160 },
                    },
                    popper: {
                        sx: {
                            '& .MuiDateCalendar-root': {
                                width: yearOnly ? 280 : undefined,
                                height: yearOnly ? 'auto' : undefined,
                                borderRadius: 2,
                            },
                            '& .MuiYearCalendar-root': {
                                width: yearOnly ? 280 : undefined,
                                paddingTop: 2,
                                paddingBottom: 2,
                            },
                        },
                    },
                }}
            />
            {onApply && (
                <Button variant="outlined" size="small" onClick={onApply}>
                    Apply
                </Button>
            )}
        </Box>
    );
}
