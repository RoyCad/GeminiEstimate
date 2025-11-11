
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getMarketPrice, type GetMarketPriceOutput } from '@/ai/flows/real-time-market-analysis';
import { BarChart, Bot, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const materials = [
    { value: 'cement', label: 'Cement' },
    { value: 'rod', label: 'Rod/Steel' },
    { value: 'brick', label: 'Brick' },
    { value: 'sand', label: 'Sand' },
];

export default function MarketPriceAnalysis() {
  const [material, setMaterial] = useState('cement');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GetMarketPriceOutput | null>(null);
  const { toast } = useToast();

  const handleAnalysis = async () => {
    if (!material) {
      toast({
        title: 'Input Required',
        description: 'Please select a material.',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await getMarketPrice({ material });
      setResult(res);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not fetch the market price. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card h-full">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <BarChart className="w-6 h-6 text-primary" />
          <CardTitle>Market Analysis</CardTitle>
        </div>
        <CardDescription>
          Get real-time market prices for construction materials in Bangladesh.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="material-select" className="text-sm font-medium mb-2 block">
              Material Type
            </label>
            <div className="flex gap-2">
                <Select onValueChange={setMaterial} defaultValue={material}>
                    <SelectTrigger id="material-select">
                        <SelectValue placeholder="Select a material" />
                    </SelectTrigger>
                    <SelectContent>
                        {materials.map((item) => (
                            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              <Button onClick={handleAnalysis} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Fetch'}
              </Button>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {result && (
            <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-lg space-y-2">
                <div className='flex items-center gap-2'>
                    <Bot className='w-5 h-5 text-primary'/>
                    <h4 className="font-semibold text-lg text-primary capitalize">{material} Prices</h4>
                </div>
              
                {result.prices && result.prices.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Brand</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.prices.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.brand}</TableCell>
                          <TableCell className="text-right">{item.price} / {item.unit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No price information found for {material}.
                  </p>
                )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
