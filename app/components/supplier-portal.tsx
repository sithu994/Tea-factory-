import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Leaf, LogOut, FileText, TrendingUp, Calendar } from 'lucide-react';
import ChatPanel from './chat-panel';

interface MonthlyRecord {
  id: string;
  date: string;
  supplierId: string;
  grossWeight: number;
  deductions: number;
  netWeight: number;
  rate: number;
  amount: number;
}

interface SupplierPortalProps {
  onLogout: () => void;
  supplierId?: string;
}

export default function SupplierPortal({ onLogout, supplierId = 'SUP001' }: SupplierPortalProps) {
  const currentDate = new Date();
  const [reportPeriod, setReportPeriod] = useState<'month' | 'year'>('month');
  const [selectedMonth, setSelectedMonth] = useState(
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`,
  );
  const [selectedYear, setSelectedYear] = useState(String(currentDate.getFullYear()));
  
  // Load records from localStorage (shared with staff dashboard)
  const [allEntries, setAllEntries] = useState<MonthlyRecord[]>([]);

  useEffect(() => {
    const savedEntries = localStorage.getItem('teaEntries');
    if (savedEntries) {
      const teaEntries = JSON.parse(savedEntries);
      // Convert tea entries to monthly records with rate and amount
      const monthlyRecords = teaEntries.map((entry: MonthlyRecord) => ({
        ...entry,
        rate: 120.0,
        amount: entry.netWeight * 120.0,
      }));
      setAllEntries(monthlyRecords);
      const latestRecord = [...monthlyRecords].sort((a, b) => b.date.localeCompare(a.date))[0];
      if (latestRecord) {
        setSelectedMonth(latestRecord.date.slice(0, 7));
        setSelectedYear(latestRecord.date.slice(0, 4));
      }
    } else {
      // Use mock data if no saved entries
      setAllEntries([
        {
          id: '1',
          date: '2026-01-07',
          supplierId: 'SUP001',
          grossWeight: 150.5,
          deductions: 5.2,
          netWeight: 145.3,
          rate: 120.0,
          amount: 17436.0,
        },
        {
          id: '2',
          date: '2026-01-06',
          supplierId: 'SUP001',
          grossWeight: 200.0,
          deductions: 8.5,
          netWeight: 191.5,
          rate: 120.0,
          amount: 22980.0,
        },
        {
          id: '3',
          date: '2026-01-05',
          supplierId: 'SUP001',
          grossWeight: 160.2,
          deductions: 4.8,
          netWeight: 155.4,
          rate: 120.0,
          amount: 18648.0,
        },
        {
          id: '4',
          date: '2026-01-04',
          supplierId: 'SUP001',
          grossWeight: 175.8,
          deductions: 6.3,
          netWeight: 169.5,
          rate: 120.0,
          amount: 20340.0,
        },
        {
          id: '5',
          date: '2026-01-03',
          supplierId: 'SUP001',
          grossWeight: 185.0,
          deductions: 7.0,
          netWeight: 178.0,
          rate: 120.0,
          amount: 21360.0,
        },
        {
          id: '6',
          date: '2026-01-02',
          supplierId: 'SUP001',
          grossWeight: 165.5,
          deductions: 5.5,
          netWeight: 160.0,
          rate: 120.0,
          amount: 19200.0,
        },
        {
          id: '7',
          date: '2026-01-01',
          supplierId: 'SUP001',
          grossWeight: 155.2,
          deductions: 4.2,
          netWeight: 151.0,
          rate: 120.0,
          amount: 18120.0,
        },
      ]);
      setSelectedMonth('2026-01');
      setSelectedYear('2026');
    }
  }, []);

  const supplierEntries = allEntries.filter(
    (record) => record.supplierId.toUpperCase() === supplierId.toUpperCase(),
  );
  const availableMonths = Array.from(new Set([
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`,
    ...supplierEntries.map((record) => record.date.slice(0, 7)),
  ])).sort((a, b) => b.localeCompare(a));
  const availableYears = Array.from(new Set([
    String(currentDate.getFullYear()),
    ...supplierEntries.map((record) => record.date.slice(0, 4)),
  ])).sort((a, b) => b.localeCompare(a));

  const reportRecords = allEntries.filter((record) =>
    record.supplierId.toUpperCase() === supplierId.toUpperCase() &&
    (reportPeriod === 'month'
      ? record.date.startsWith(selectedMonth)
      : record.date.startsWith(selectedYear))
  );

  const totalGrossWeight = reportRecords.reduce((sum, record) => sum + record.grossWeight, 0);
  const totalDeductions = reportRecords.reduce((sum, record) => sum + record.deductions, 0);
  const totalNetWeight = reportRecords.reduce((sum, record) => sum + record.netWeight, 0);
  const totalAmount = reportRecords.reduce((sum, record) => sum + record.amount, 0);
  const monthlyGroups = Array.from(
    reportRecords.reduce((groups, record) => {
      const month = record.date.slice(0, 7);
      const group = groups.get(month) ?? [];
      group.push(record);
      groups.set(month, group);
      return groups;
    }, new Map<string, MonthlyRecord[]>()),
  ).sort(([firstMonth], [secondMonth]) => firstMonth.localeCompare(secondMonth));
  const reportLabel = reportPeriod === 'month'
    ? new Date(`${selectedMonth}-01T00:00:00`).toLocaleDateString('en', { month: 'long', year: 'numeric' })
    : selectedYear;
  const formatMonth = (month: string) =>
    new Date(`${month}-01T00:00:00`).toLocaleDateString('en', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Supplier Portal</h1>
                <p className="text-green-100 text-sm">
                  Supplier ID: {supplierId} | සැපයුම්කරු පෝටලය
                </p>
              </div>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg border-green-100 bg-gradient-to-br from-white to-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 mb-1">Total Net Weight</p>
                  <p className="text-xs text-green-600 mb-2">මුළු ශුද්ධ බර</p>
                  <p className="text-3xl font-bold text-green-900">{totalNetWeight.toFixed(1)}</p>
                  <p className="text-sm text-green-700">kg</p>
                </div>
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-green-100 bg-gradient-to-br from-white to-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-700 mb-1">Total Deliveries</p>
                  <p className="text-xs text-emerald-600 mb-2">මුළු බෙදාහැරීම්</p>
                  <p className="text-3xl font-bold text-emerald-900">{reportRecords.length}</p>
                  <p className="text-sm text-emerald-700">entries</p>
                </div>
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                  <FileText className="w-7 h-7 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-green-100 bg-gradient-to-br from-white to-teal-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-teal-700 mb-1">Total Amount</p>
                  <p className="text-xs text-teal-600 mb-2">මුළු මුදල</p>
                  <p className="text-3xl font-bold text-teal-900">
                    {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-teal-700">LKR</p>
                </div>
                <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-teal-600">₨</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Supplier Pay Sheet */}
        <Card className="shadow-xl border-green-100">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle className="flex items-center gap-2 text-green-900">
                <FileText className="w-5 h-5" />
                Pay Sheet | ගෙවීම් වාර්තාව
              </CardTitle>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select
                  value={reportPeriod}
                  onValueChange={(value: 'month' | 'year') => setReportPeriod(value)}
                >
                  <SelectTrigger className="w-full border-green-200 sm:w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="year">Annual</SelectItem>
                  </SelectContent>
                </Select>
                {reportPeriod === 'month' ? (
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-full border-green-200 sm:w-48">
                      <Calendar className="mr-2 h-4 w-4 text-green-700" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMonths.map((month) => (
                        <SelectItem key={month} value={month}>
                          {new Date(`${month}-01T00:00:00`).toLocaleDateString('en', {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-full border-green-200 sm:w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="border-b border-green-100 py-3 text-sm text-green-800">
              Supplier ID: <span className="font-semibold">{supplierId}</span>
              <span className="mx-2">·</span>
              {reportLabel}
            </p>
            <div className="overflow-auto max-h-[500px]">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow className="bg-green-50 hover:bg-green-50">
                    <TableHead className="text-green-900">Date<br/>දිනය</TableHead>
                    <TableHead className="text-green-900 text-right">Gross Weight (kg)<br/>දළ බර</TableHead>
                    <TableHead className="text-green-900 text-right">Deductions (kg)<br/>අඩු කිරීම්</TableHead>
                    <TableHead className="text-green-900 text-right">Net Weight (kg)<br/>ශුද්ධ බර</TableHead>
                    <TableHead className="text-green-900 text-right">Rate (LKR/kg)<br/>අනුපාතය</TableHead>
                    <TableHead className="text-green-900 text-right">Amount (LKR)<br/>මුදල</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportRecords.length > 0 ? (
                    reportPeriod === 'year'
                      ? monthlyGroups.map(([month, records]) => {
                          const monthGross = records.reduce((sum, record) => sum + record.grossWeight, 0);
                          const monthDeductions = records.reduce((sum, record) => sum + record.deductions, 0);
                          const monthNet = records.reduce((sum, record) => sum + record.netWeight, 0);
                          const monthAmount = records.reduce((sum, record) => sum + record.amount, 0);

                          return [
                            <TableRow key={`${month}-heading`} className="bg-green-100 hover:bg-green-100">
                              <TableCell colSpan={6} className="py-3 font-bold text-green-900">
                                {formatMonth(month)}
                              </TableCell>
                            </TableRow>,
                            ...records.map((record) => (
                              <TableRow key={record.id} className="hover:bg-green-50/50">
                                <TableCell className="font-medium">{record.date}</TableCell>
                                <TableCell className="text-right">{record.grossWeight.toFixed(1)}</TableCell>
                                <TableCell className="text-right text-red-600">{record.deductions.toFixed(1)}</TableCell>
                                <TableCell className="text-right font-semibold text-green-700">
                                  {record.netWeight.toFixed(1)}
                                </TableCell>
                                <TableCell className="text-right">{record.rate.toFixed(2)}</TableCell>
                                <TableCell className="text-right font-semibold">
                                  {record.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </TableCell>
                              </TableRow>
                            )),
                            <TableRow key={`${month}-subtotal`} className="bg-gray-50 font-semibold">
                              <TableCell>Monthly total</TableCell>
                              <TableCell className="text-right">{monthGross.toFixed(1)}</TableCell>
                              <TableCell className="text-right text-red-600">{monthDeductions.toFixed(1)}</TableCell>
                              <TableCell className="text-right text-green-700">{monthNet.toFixed(1)}</TableCell>
                              <TableCell />
                              <TableCell className="text-right">
                                {monthAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </TableCell>
                            </TableRow>,
                          ];
                        })
                      : reportRecords.map((record) => (
                          <TableRow key={record.id} className="hover:bg-green-50/50">
                            <TableCell className="font-medium">{record.date}</TableCell>
                            <TableCell className="text-right">{record.grossWeight.toFixed(1)}</TableCell>
                            <TableCell className="text-right text-red-600">{record.deductions.toFixed(1)}</TableCell>
                            <TableCell className="text-right font-semibold text-green-700">
                              {record.netWeight.toFixed(1)}
                            </TableCell>
                            <TableCell className="text-right">{record.rate.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-semibold">
                              {record.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                        No deliveries found for {supplierId} in {reportLabel}.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Summary Section */}
            <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 p-6 shadow-md">
              <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {reportPeriod === 'month' ? 'Monthly Summary' : 'Annual Summary'} | සාරාංශය
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
                  <p className="text-sm text-green-700 mb-1">Total Gross Weight</p>
                  <p className="text-xs text-green-600 mb-2">මුළු දළ බර</p>
                  <p className="text-2xl font-bold text-green-900">{totalGrossWeight.toFixed(1)} kg</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-red-100">
                  <p className="text-sm text-red-700 mb-1">Total Deductions</p>
                  <p className="text-xs text-red-600 mb-2">මුළු අඩු කිරීම්</p>
                  <p className="text-2xl font-bold text-red-900">{totalDeductions.toFixed(1)} kg</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
                  <p className="text-sm text-green-700 mb-1">Total Net Weight</p>
                  <p className="text-xs text-green-600 mb-2">මුළු ශුද්ධ බර</p>
                  <p className="text-2xl font-bold text-green-900">{totalNetWeight.toFixed(1)} kg</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-teal-100">
                  <p className="text-sm text-teal-700 mb-1">Total Amount</p>
                  <p className="text-xs text-teal-600 mb-2">මුළු මුදල</p>
                  <p className="text-2xl font-bold text-teal-900">
                    ₨ {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Panel */}
      <ChatPanel userRole="supplier" userName={`Supplier ${supplierId}`} />
    </div>
  );
}