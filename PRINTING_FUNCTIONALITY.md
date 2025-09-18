# Printing Functionality Documentation

## Overview

The LodgeFlow admin system now includes comprehensive printing functionality for booking details with PDF export capabilities. This feature allows administrators to print booking information in multiple formats.

## Features

### 1. Print Options
- **Print Booking**: Opens a print-optimized window with just the booking details
- **Download as PDF**: Generates and downloads a PDF file of the booking details
- **Browser Print**: Uses the browser's native print functionality

### 2. Components

#### BookingPDFTemplate
A specialized component that formats booking details for printing and PDF generation.

**Location**: `components/BookingDetails/BookingPDFTemplate.tsx`

**Features**:
- Clean, professional layout optimized for printing
- Includes all essential booking information
- Responsive design that adapts to different paper sizes
- Print-friendly styling with proper contrast and spacing

#### usePrintBooking Hook
A custom hook that handles all printing and PDF generation logic.

**Location**: `hooks/usePrintBooking.ts`

**Methods**:
- `handlePrint(elementId: string)`: Opens a new window with print-optimized content
- `handleDownloadPDF(elementId: string, options?)`: Generates and downloads a PDF
- `handleBrowserPrint()`: Triggers browser's native print dialog

**States**:
- `isPrinting`: Boolean indicating if print operation is in progress
- `isGeneratingPDF`: Boolean indicating if PDF generation is in progress

#### Enhanced QuickActionsCard
The QuickActionsCard component now includes a dropdown menu for printing options.

**Location**: `components/BookingDetails/QuickActionsCard.tsx`

**New Features**:
- Print dropdown with multiple options
- Print preview modal
- Loading states during operations
- Error handling with toast notifications

## Usage

### For Developers

#### Using the Print Hook
```typescript
import { usePrintBooking } from '@/hooks/usePrintBooking';

const MyComponent = ({ booking }: { booking: PopulatedBooking }) => {
  const {
    isPrinting,
    isGeneratingPDF,
    handlePrint,
    handleDownloadPDF,
    handleBrowserPrint,
  } = usePrintBooking(booking);

  const handlePrintClick = async () => {
    try {
      await handlePrint('my-print-element');
    } catch (error) {
      console.error('Print failed:', error);
    }
  };

  return (
    <div>
      <div id="my-print-element">
        {/* Content to print */}
      </div>
      <button onClick={handlePrintClick} disabled={isPrinting}>
        {isPrinting ? 'Printing...' : 'Print'}
      </button>
    </div>
  );
};
```

#### Using the PDF Template
```typescript
import BookingPDFTemplate from '@/components/BookingDetails/BookingPDFTemplate';

const MyPrintComponent = ({ booking }: { booking: PopulatedBooking }) => {
  return (
    <BookingPDFTemplate
      booking={booking}
      id="unique-print-id"
      className="custom-styling"
    />
  );
};
```

### For End Users

#### Accessing Print Options
1. Navigate to any booking details page
2. Look for the "Print Booking Details" button in the Quick Actions card
3. Click the button to open the dropdown menu
4. Choose from the available options:
   - **Print Booking**: Opens a print preview and print dialog
   - **Download as PDF**: Immediately downloads a PDF file
   - **Browser Print**: Opens the browser's print dialog

#### Print Preview
- The print preview modal shows exactly how the document will look when printed
- Use the "Print" button to proceed with printing
- Use the "Download PDF" button to save as a PDF file
- The preview is optimized for A4 paper size

#### PDF Features
- Automatically named with booking ID and guest name
- High-quality rendering suitable for official documents
- Includes all relevant booking information
- Professional formatting with proper margins and spacing

## Technical Details

### Dependencies
- `jspdf`: PDF generation library
- `html2canvas`: HTML to canvas conversion for high-quality rendering

### Browser Compatibility
- Modern browsers with ES6+ support
- PDF generation requires Canvas API support
- Print functionality works in all major browsers

### Performance Considerations
- PDF generation uses canvas rendering which may take a few seconds for complex layouts
- Large images or complex styling may affect generation time
- Print preview loads instantly as it uses native browser capabilities

### Error Handling
- Network failures during PDF generation are handled gracefully
- User feedback provided through toast notifications
- Loading states prevent multiple concurrent operations

## Troubleshooting

### Common Issues

1. **PDF Generation Fails**
   - Check browser console for errors
   - Ensure the element with the specified ID exists
   - Verify Canvas API support in browser

2. **Print Quality Issues**
   - Ensure proper CSS print media queries
   - Check image resolution and sizing
   - Verify color settings for print

3. **Layout Problems**
   - Test with different paper sizes
   - Adjust margins and padding for print media
   - Consider page break locations

### Debugging Tips
- Use browser developer tools to inspect print styles
- Test print preview in different browsers
- Check network tab during PDF generation
- Verify element IDs are unique and accessible

## Future Enhancements

### Planned Features
- Custom paper size selection
- Batch printing for multiple bookings
- Email integration for sending PDFs
- Print templates customization
- Printer-specific optimizations

### Configuration Options
- Default file naming patterns
- Print quality settings
- Paper size preferences
- Custom styling options
