'use client';
import React from 'react';
import Image from 'next/image';
import { ProjectData } from '@/app/dashboard/projects/[id]/page';
import { Button } from './ui/button';
import { ArrowRight, Printer } from 'lucide-react';
import { PaymentTransaction, ProjectService } from '@/lib/types';
import { format } from 'date-fns';
import { Separator } from './ui/separator';

interface InvoiceProps {
  project: ProjectData;
  transactions: PaymentTransaction[];
}

const InvoiceOfferLetter: React.FC<{ project: ProjectData }> = ({ project }) => {
    const {
        services,
        termsAndConditions
    } = project;

    const defaultScope = [
        "Consultation: We will meet with you to discuss your design needs, goals, and budget.",
        "Conceptualizations: We will create a design plan that incorporates your preferences and style, while also ensuring functionality and efficiency.",
        "3D Rendering: We will provide a 3D rendering of the proposed design to help you visualize the final result.",
        "Execution: We will oversee the project from start to finish, ensuring that the design is executed according to plan."
    ];
    
    // Split terms by newline to create a list
    const termsList = termsAndConditions?.split('\n') || [];

    return (
        <div className="offer-letter-container">
            {/* Header */}
            <header className="flex justify-between items-start pb-6">
                <div>
                     <Image src="/my_logo.png" alt="Company Logo" width={180} height={45} className="mb-2" />
                     <p className="text-sm font-bold text-muted-foreground mt-2">YOU THINK IT, WE BUILD IT</p>
                </div>
                <div className="text-right text-xs">
                    <p className="font-bold">Kotalipara Rajoir Bus Stand</p>
                    <p>Kotalipara, Gopalganj-8110</p>
                    <p>Email: royconstruction000@gmail.com</p>
                    <p>Phone: +88 01977-525823</p>
                </div>
            </header>
            
            <Separator className="my-8" />

            <main>
                <p className="mb-4">Dear Sir,</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    We are thrilled to extend an offer to you for our home design services. We are dedicated to creating personalized and functional spaces that meet the unique needs of you. Our services include a full range of home design options from conceptualization to execution which includes:
                </p>

                <div className="my-6 ml-4">
                    <ol className="list-decimal list-inside space-y-1 font-semibold">
                         {services.map((service, index) => (
                            <li key={service.id}>{service.label}</li>
                         ))}
                    </ol>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-lg">Scope of Services:</h3>
                    <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
                        {defaultScope.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
                
                 <div className="mt-6 space-y-4">
                    <h3 className="font-bold text-lg">Terms of Offer:</h3>
                     <ul className="space-y-2 text-sm text-muted-foreground">
                        {termsList.map((term, index) => (
                           <li key={index} className="flex items-start">
                               <ArrowRight className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-primary"/>
                               <span>{term}</span>
                           </li>
                        ))}
                    </ul>
                </div>
                
                <p className="mt-8 text-sm font-semibold">
                    We are excited about the opportunity to work with you and create a space that you will love. Please let us know if you have any questions or concerns. We look forward to hearing from you soon.
                </p>

            </main>
            
             <footer className="mt-16 flex justify-between items-end pt-6">
                <div>
                     {/* Intentionally left blank */}
                </div>
                <div className="text-center">
                    <div className="w-48 h-12 mb-1 flex items-center justify-center">
                        {/* Placeholder for signature image */}
                         <p className="font-handwriting text-4xl">Roy Shaon</p>
                    </div>
                    <p className="font-bold border-t pt-1">ENGR. SHAON ROY</p>
                    <p className="text-xs text-muted-foreground">B.Sc. in Engineering (Civil)</p>
                </div>
            </footer>
        </div>
    )
}


export const Invoice: React.FC<InvoiceProps> = ({ project, transactions }) => {
  const { 
    projectName, 
    projectNumber, 
    clientName, 
    clientAddress, 
    clientPhone, 
    services, 
    createdAt,
    termsAndConditions
  } = project;

  const invoiceRef = React.useRef<HTMLDivElement>(null);

  const totalCharges = services.reduce((acc, service) => acc + (service.charge || 0), 0);
  const totalPaid = transactions
    .filter(t => t.type === 'Payment')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalDue = totalCharges - totalPaid;

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    if (printContent) {
      const originalContents = document.body.innerHTML;
      const printSection = printContent.innerHTML;
      document.body.innerHTML = `
        <html>
          <head>
            <title>Invoice - ${projectName}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap');
              @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
              
              body { font-family: 'PT Sans', sans-serif; -webkit-print-color-adjust: exact !important; color-adjust: exact !important; background-color: white; }
              .invoice-container, .offer-letter-container { max-width: 800px; margin: auto; padding: 2rem; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; font-size: 14px; }
              th, td { padding: 8px; text-align: left; }
              .services-table th, .services-table td { border-bottom: 1px solid #e5e7eb; }
              .services-table th { background-color: #f3f4f6; }
              .no-print { display: none; }
              .text-right { text-align: right; }
              .font-bold { font-weight: 700; }
              .text-muted-foreground { color: #6b7280; }
              .paid-stamp {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-15deg);
                font-size: 5rem;
                color: #22c55e;
                border: 8px solid #22c55e;
                border-radius: 9999px;
                padding: 1rem 2rem;
                opacity: 0.15;
                font-weight: 800;
                z-index: 10;
              }
              .page-break { page-break-before: always; }
              .font-handwriting { font-family: 'Dancing Script', cursive; }
            </style>
          </head>
          <body>${printSection}</body>
        </html>
      `;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };


  return (
    <div className="bg-background rounded-lg p-4">
      <div ref={invoiceRef}>
        <div className="invoice-container bg-card p-8 rounded-lg shadow-sm">
          {/* Header */}
          <header className="flex justify-between items-start pb-6 border-b">
            <div>
              <Image src="/my_logo.png" alt="Company Logo" width={180} height={45} />
              <p className="text-sm text-muted-foreground mt-2">YOU THINK IT, WE BUILD IT</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold uppercase text-primary">Invoice</h2>
              <p className="text-muted-foreground">Project ID: {projectNumber}</p>
              <p className="text-muted-foreground">Date: {createdAt ? format(new Date(createdAt.seconds * 1000), 'dd/MM/yyyy') : 'N/A'}</p>
            </div>
          </header>

          {/* Bill To */}
          <section className="mt-8">
            <h3 className="text-sm font-semibold text-muted-foreground">BILL TO:</h3>
            <p className="font-bold text-lg">{clientName}</p>
            <p>{clientAddress}</p>
            <p>{clientPhone}</p>
          </section>

          {/* Services Table */}
          <section className="mt-8 relative">
            {totalDue <= 0 && <div className="paid-stamp">PAID</div>}
            <table className="w-full services-table">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-3 font-semibold">SERVICES</th>
                  <th className="p-3 font-semibold">REMARKS</th>
                  <th className="p-3 font-semibold text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td className="p-3">{service.label}</td>
                    <td className="p-3 text-muted-foreground">{service.remarks}</td>
                    <td className="p-3 text-right">{new Intl.NumberFormat('en-IN').format(service.charge || 0)} TK</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Totals Section */}
          <section className="flex justify-end mt-4">
            <div className="w-full md:w-1/2 lg:w-1/3">
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">Total</span>
                <span>{new Intl.NumberFormat('en-IN').format(totalCharges)} TK</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">Paid</span>
                <span>{new Intl.NumberFormat('en-IN').format(totalPaid)} TK</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-lg text-primary">
                <span>Due</span>
                <span>{new Intl.NumberFormat('en-IN').format(totalDue)} TK</span>
              </div>
            </div>
          </section>
          
          {/* Payment Details */}
          {transactions.filter(t => t.type === 'Payment').length > 0 && (
              <section className="mt-8">
                  <h3 className="font-semibold mb-2">PAYMENT'S DETAIL'S</h3>
                  <table className="w-full md:w-1/2 lg:w-1/3 services-table">
                      <thead>
                          <tr className="bg-muted/50">
                              <th className="p-2">Date</th>
                              <th className="p-2">Description</th>
                              <th className="p-2 text-right">Amount</th>
                          </tr>
                      </thead>
                      <tbody>
                          {transactions.filter(t => t.type === 'Payment').map(t => (
                              <tr key={t.id}>
                                  <td className="p-2 text-sm">{t.date ? format(new Date(t.date.seconds * 1000), 'dd/MM/yy') : 'N/A'}</td>
                                  <td className="p-2 text-sm text-muted-foreground">{t.description}</td>
                                  <td className="p-2 text-right">{new Intl.NumberFormat('en-IN').format(t.amount)} TK</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </section>
          )}

          {/* Footer */}
          <footer className="mt-16 flex justify-between items-end pt-6 border-t">
            <div>
              <p className="text-sm font-semibold">NOTE:</p>
              <p className="text-sm text-muted-foreground">No Charge for Site Visit.</p>
            </div>
            <div className="text-center">
              <div className="w-48 h-12 mb-1 flex items-center justify-center">
                  <p className="font-handwriting text-4xl">Roy Shaon</p>
              </div>
              <p className="font-bold border-t pt-1">ENGR. SHAON ROY</p>
              <p className="text-xs text-muted-foreground">B.Sc. in Engineering (Civil)</p>
            </div>
          </footer>
        </div>
        
        {/* --- Page 2: Offer Letter --- */}
        <div className="page-break"></div>
        <div className="bg-card p-8 rounded-lg shadow-sm">
             <InvoiceOfferLetter project={project} />
        </div>

      </div>
      <div className="mt-4 text-center no-print">
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" /> Print Invoice
        </Button>
      </div>
    </div>
  );
};

    