import { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { Box } from '@mui/material';

// The date range is a premium MUIx component, so this is a combination of two date pickers to make a date range
export default function DateRangeHack() {
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);


  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Start date"
          value={startDate}
          onChange={(val) => {
            setStartDate(val);
            // Clear end if it's now before the new start
            if (endDate && val && val.isAfter(endDate)) setEndDate(null);
          }}
          maxDate={endDate ?? undefined}
        />

        <DatePicker
          label="End date"
          value={endDate}
          onChange={setEndDate}
          minDate={startDate ?? undefined}
          disabled={!startDate}
        />
      </LocalizationProvider>
    </Box>
  );
}
