
'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Printer } from 'lucide-react';

type PrintReportWrapperProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
  title: string;
};

const PrintReportWrapper: React.FC<PrintReportWrapperProps> = ({ trigger, children, title }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = reportRef.current;
    if (printContent) {
      const printSection = printContent.innerHTML;
      const originalContents = document.body.innerHTML;
      
      document.body.innerHTML = `
        <html>
          <head>
            <title>${title}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap');
              body { font-family: 'PT Sans', sans-serif; -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; font-size: 10px; }
              th, td { border: 1px solid #e5e7eb; padding: 6px; text-align: left; }
              th { background-color: #f3f4f6; font-weight: 600; }
              .no-print { display: none; }
              .print-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1.5rem; }
              .print-header img { max-width: 150px; }
              .print-header h1 { font-size: 1.5rem; font-weight: 700; margin: 0; }
              .print-header p { margin: 0; color: #6b7280; font-size: 0.875rem; }
              .font-semibold { font-weight: 600; }
              .font-medium { font-weight: 500; }
              .text-right { text-align: right; }
              .text-xs { font-size: 0.75rem; }
              .text-muted-foreground { color: #6b7280; }
              .font-mono { font-family: monospace; }
            </style>
          </head>
          <body>
            <div class="print-header">
                <div>
                    <img src="/my_logo.png" alt="Logo" />
                </div>
                <div style="text-align: right;">
                    <h1>${title}</h1>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                </div>
            </div>
            ${printSection}
          </body>
        </html>
      `;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div ref={reportRef} className="overflow-y-auto max-h-[70vh] p-1">
            {children}
        </div>
        <DialogFooter>
            <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print / Save as PDF</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrintReportWrapper;

    