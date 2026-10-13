import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Leaf, LogOut, Plus, Search, Calendar, Scale, Minus } from 'lucide-react';
import ChatPanel from './chat-panel';

interface TeaEntry {
  id: string;
  date: string;
  supplierId: string;
  grossWeight: number;
  deductions: number;
  netWeight: number;
}

interface StaffDashboardProps {
  onLogout: () => void;
}

function getTodayDate() {
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

export default function StaffDashboard({ onLogout }: StaffDashboardProps) {
  // Load initial data from localStorage or use default mock data
  const [entries, setEntries] = useState<TeaEntry[]>(() => {
    const savedEntries = localStorage.getItem('teaEntries');
    if (savedEntries) {
      return JSON.parse(savedEntries);
    }
    return [
      {
        id: '1',
        date: '2026-01-07',
        supplierId: 'SUP001',
        grossWeight: 150.5,
        deductions: 5.2,
        netWeight: 145.3,
      },
      {
        id: '2',
        date: '2026-01-06',
        supplierId: 'SUP002',
        grossWeight: 200.0,
        deductions: 8.5,
        netWeight: 191.5,
      },
      {
        id: '3',
        date: '2026-01-06',
        supplierId: 'SUP003',
        grossWeight: 175.8,
        deductions: 6.3,
        netWeight: 169.5,
      },
      {
        id: '4',
        date: '2026-01-05',
        supplierId: 'SUP001',
        grossWeight: 160.2,
        deductions: 4.8,
        netWeight: 155.4,
      },
    ];
  });

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('teaEntries', JSON.stringify(entries));
  }, [entries]);

  const [formData, setFormData] = useState({
    supplierId: '',
    grossWeight: '',
    deductions: '',
  });

  const [entryDate, setEntryDate] = useState(getTodayDate);
  const [searchMode, setSearchMode] = useState<'supplier' | 'date'>('supplier');
  const [searchQuery, setSearchQuery] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const grossWeight = parseFloat(formData.grossWeight);
    const deductions = parseFloat(formData.deductions);
    const netWeight = grossWeight - deductions;

    const newEntry: TeaEntry = {
      id: Date.now().toString(),
      date: entryDate,
      supplierId: formData.supplierId.trim().toUpperCase(),
      grossWeight,
      deductions,
      netWeight,
    };

    setEntries([newEntry, ...entries]);
    
    // Reset form
    setFormData({
      supplierId: '',
      grossWeight: '',
      deductions: '',
    });
  };

  const filteredEntries = entries.filter(
    (entry) =>
      !searchQuery ||
      (searchMode === 'supplier'
        ? entry.supplierId.toLowerCase().includes(searchQuery.trim().toLowerCase())
        : entry.date === searchQuery)
  );

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
                <h1 className="text-2xl font-bold text-white">Staff Dashboard</h1>
                <p className="text-green-100 text-sm">කාර්ය මණ්ඩල පුවරුව</p>
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
        <Card className="mb-6 border-green-200 bg-gradient-to-r from-white to-green-50 shadow-md">
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-green-900">
                <Calendar className="h-5 w-5" />
                Delivery date | සැපයුම් දිනය
              </h2>
              <p className="mt-1 text-sm text-green-700">
                All supplier entries added below will use this date.
              </p>
            </div>
            <Input
              aria-label="Delivery date"
              type="date"
              value={entryDate}
              onChange={(event) => setEntryDate(event.target.value)}
              className="w-full border-green-200 sm:w-52"
              required
            />
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Side - Daily Tea Entry Form */}
          <Card className="shadow-xl border-green-100 h-fit">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Plus className="w-5 h-5" />
                Daily Tea Entry | දෛනික තේ ඇතුළත් කිරීම
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Supplier ID */}
                <div className="space-y-2">
                  <Label htmlFor="supplierId" className="text-green-900">
                    Supplier ID | සැපයුම්කරු හැඳුනුම්පත
                  </Label>
                  <Input
                    id="supplierId"
                    name="supplierId"
                    type="text"
                    placeholder="e.g., SUP001"
                    value={formData.supplierId}
                    onChange={handleInputChange}
                    className="border-green-200 focus:border-green-500"
                    required
                  />
                </div>

                {/* Gross Weight */}
                <div className="space-y-2">
                  <Label htmlFor="grossWeight" className="text-green-900 flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    Gross Weight (kg) | දළ බර (කි.ග්‍රෑ)
                  </Label>
                  <Input
                    id="grossWeight"
                    name="grossWeight"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={formData.grossWeight}
                    onChange={handleInputChange}
                    className="border-green-200 focus:border-green-500"
                    required
                  />
                </div>

                {/* Deductions */}
                <div className="space-y-2">
                  <Label htmlFor="deductions" className="text-green-900 flex items-center gap-2">
                    <Minus className="w-4 h-4" />
                    Deductions (kg) | අඩු කිරීම් (කි.ග්‍රෑ)
                  </Label>
                  <Input
                    id="deductions"
                    name="deductions"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={formData.deductions}
                    onChange={handleInputChange}
                    className="border-green-200 focus:border-green-500"
                    required
                  />
                </div>

                {/* Net Weight Display */}
                {formData.grossWeight && formData.deductions && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm text-green-700 mb-1">Net Weight | ශුද්ධ බර</div>
                    <div className="text-2xl font-bold text-green-900">
                      {(parseFloat(formData.grossWeight) - parseFloat(formData.deductions)).toFixed(1)} kg
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!entryDate}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry | ඇතුළත් කරන්න
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Right Side - Records Table */}
          <Card className="shadow-xl border-green-100">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-900">
                  Tea Records | තේ වාර්තා
                </CardTitle>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <Select
                    value={searchMode}
                    onValueChange={(value: 'supplier' | 'date') => {
                      setSearchMode(value);
                      setSearchQuery('');
                    }}
                  >
                    <SelectTrigger className="w-full border-green-200 sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supplier">Supplier ID</SelectItem>
                      <SelectItem value="date">Delivery date</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type={searchMode === 'date' ? 'date' : 'search'}
                    placeholder="Search supplier ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-green-200 focus:border-green-500"
                  />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-auto max-h-[600px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow className="bg-green-50 hover:bg-green-50">
                      <TableHead className="text-green-900">Date<br/>දිනය</TableHead>
                      <TableHead className="text-green-900">Supplier ID<br/>සැපයුම්කරු</TableHead>
                      <TableHead className="text-green-900 text-right">Gross (kg)<br/>දළ බර</TableHead>
                      <TableHead className="text-green-900 text-right">Deduct (kg)<br/>අඩු කිරීම්</TableHead>
                      <TableHead className="text-green-900 text-right">Net (kg)<br/>ශුද්ධ බර</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          No records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEntries.map((entry) => (
                        <TableRow key={entry.id} className="hover:bg-green-50/50">
                          <TableCell className="font-medium">{entry.date}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                              {entry.supplierId}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">{entry.grossWeight.toFixed(1)}</TableCell>
                          <TableCell className="text-right text-red-600">{entry.deductions.toFixed(1)}</TableCell>
                          <TableCell className="text-right font-semibold text-green-700">
                            {entry.netWeight.toFixed(1)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Panel */}
      <ChatPanel userRole="staff" userName="Staff Member" />
    </div>
  );
}