'use client';

import { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  pdfBasedEstimation,
  type PdfBasedEstimationOutput,
} from '@/ai/flows/pdf-based-estimation';
import { Bot, FileText, Loader2, Upload, Coins, Building, FileCheck, Phone } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function PdfEstimationTool() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PdfBasedEstimationOutput | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a PDF, JPG, or PNG file.',
          variant: 'destructive',
        });
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: 'File too large',
          description: 'Please upload a file smaller than 10MB.',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleEstimation = async () => {
    if (!file) {
      toast({ title: 'No file selected', description: 'Please upload a file first.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const fileDataUri = await fileToDataUri(file);
      const res = await pdfBasedEstimation({ fileDataUri });
      setResult(res);
    } catch (error) {
      console.error(error);
      toast({ title: 'Estimation Failed', description: 'Could not analyze the file. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(value);
  }

  const estimationResults = result ? [
    { icon: <Coins className="w-5 h-5 text-primary" />, label: "Total Estimated Cost", value: formatCurrency(result.totalEstimatedCost) },
    { icon: <Building className="w-5 h-5 text-primary" />, label: "Estimated Cost Per Floor", value: result.costPerFloor },
  ] : [];

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
            <Bot className="w-6 h-6 text-primary" />
            <CardTitle>AI Cost Estimator</CardTitle>
        </div>
        <CardDescription>
          Upload your structural plan (PDF, JPG, PNG) to get an instant, AI-powered cost estimation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="application/pdf,image/jpeg,image/png"
          />
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
              {file ? <FileCheck className="w-8 h-8 text-primary" /> : <Upload className="w-8 h-8" /> }
              <p className="font-medium">
                  {file ? 'File Selected!' : 'Click to upload or drag & drop'}
              </p>
              <p className="text-xs">{file ? file.name : 'PDF, JPG, PNG (max 10MB)'}</p>
          </div>
        </div>
        <Button onClick={handleEstimation} disabled={!file || loading} className="w-full">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Bot className="mr-2 h-4 w-4" />
          )}
          {loading ? 'Estimating...' : 'Generate Estimate'}
        </Button>
        {loading && (
            <div className="flex flex-col items-center justify-center h-24 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">Analyzing file...</p>
            </div>
          )}
        {result && (
            <div className='space-y-4 pt-4'>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-right">Estimated Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {estimationResults.map(item => (
                    <TableRow key={item.label}>
                        <TableCell className="font-medium flex items-center gap-2">
                        {item.icon}
                        {item.label}
                        </TableCell>
                        <TableCell className='font-semibold text-right'>{item.value}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
                 <Card className='bg-muted/50'>
                    <CardHeader className="p-4">
                        <CardTitle className='text-base flex items-center gap-2'>
                            <FileText className='w-4 h-4' />
                            Analysis Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <p className='text-muted-foreground text-xs'>{result.analysisSummary}</p>
                    </CardContent>
                </Card>
                <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                  <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertTitle className="text-blue-800 dark:text-blue-300">Professional Consultation</AlertTitle>
                  <AlertDescription className="text-blue-700 dark:text-blue-400">
                    The results are for estimation purposes only. For professional consulting, please call or WhatsApp us at: <strong>01977525823</strong>.
                  </AlertDescription>
                </Alert>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
