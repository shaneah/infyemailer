import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  FileUp, 
  FileDown, 
  Download, 
  Upload, 
  Plus, 
  UserPlus, 
  RefreshCw 
} from "lucide-react";

const contactFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  list: z.string().min(1, {
    message: "Please select a list.",
  }),
});

export default function Contacts() {
  const [open, setOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importFormat, setImportFormat] = useState('txt');
  const [exportFormat, setExportFormat] = useState('txt');
  const [importProcessing, setImportProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    total: number;
    valid: number;
    invalid: number;
    duplicates: number;
    details: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { data: contacts, isLoading: isLoadingContacts } = useQuery({
    queryKey: ['/api/contacts'],
  });
  
  const { data: lists, isLoading: isLoadingLists } = useQuery({
    queryKey: ['/api/lists'],
  });
  
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      list: "",
    },
  });
  
  const addContactMutation = useMutation({
    mutationFn: (values: z.infer<typeof contactFormSchema>) => {
      return apiRequest("POST", "/api/contacts", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      toast({
        title: "Contact added",
        description: "The contact has been added successfully.",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add contact: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Import contacts mutation
  const importContactsMutation = useMutation({
    mutationFn: async (data: { emails: string[]; format: string; listId?: string }) => {
      return apiRequest("POST", "/api/contacts/import", data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      setImportResults({
        total: data.total || 0,
        valid: data.valid || 0,
        invalid: data.invalid || 0,
        duplicates: data.duplicates || 0,
        details: data.details || []
      });
      setImportProcessing(false);
      setProcessProgress(100);
      toast({
        title: "Import completed",
        description: `Successfully imported ${data.valid} contacts.`,
      });
    },
    onError: (error) => {
      setImportProcessing(false);
      setProcessProgress(0);
      toast({
        title: "Import failed",
        description: `Failed to import contacts: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Export contacts mutation
  const exportContactsMutation = useMutation({
    mutationFn: async (format: string) => {
      return apiRequest("GET", `/api/contacts/export?format=${format}`);
    },
    onSuccess: (data) => {
      // Create and download file
      const blob = new Blob([data.content], { type: getContentType(exportFormat) });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts-export-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setExportDialogOpen(false);
      toast({
        title: "Export completed",
        description: `Successfully exported ${data.count} contacts.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Export failed",
        description: `Failed to export contacts: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  function getContentType(format: string): string {
    switch (format) {
      case 'csv': return 'text/csv';
      case 'json': return 'application/json';
      default: return 'text/plain';
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Detect format from file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'csv' || extension === 'json' || extension === 'txt') {
      setImportFormat(extension);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportText(content || '');
    };
    reader.readAsText(file);
  }

  function handleImport() {
    setImportProcessing(true);
    setProcessProgress(10);
    
    // Parse the import text based on format
    let emails: string[] = [];
    
    try {
      if (importFormat === 'json') {
        try {
          const parsed = JSON.parse(importText);
          emails = Array.isArray(parsed) 
            ? parsed.map(item => typeof item === 'string' ? item : item.email || '') 
            : Object.values(parsed).map(item => typeof item === 'string' ? item : (item as any).email || '');
        } catch (e) {
          throw new Error('Invalid JSON format');
        }
      } else if (importFormat === 'csv') {
        emails = importText
          .split('\n')
          .map(line => line.split(',')[0]?.trim())
          .filter(Boolean);
      } else {
        // Default to TXT format - one email per line
        emails = importText
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean);
      }
      
      setProcessProgress(50);
      
      // Call API to process emails
      importContactsMutation.mutate({ 
        emails, 
        format: importFormat,
        listId: form.getValues().list || undefined
      });
      
    } catch (error) {
      setImportProcessing(false);
      setProcessProgress(0);
      toast({
        title: "Import failed",
        description: `Error processing file: ${error.message}`,
        variant: "destructive",
      });
    }
  }

  function handleExport() {
    exportContactsMutation.mutate(exportFormat);
  }

  function onSubmit(values: z.infer<typeof contactFormSchema>) {
    addContactMutation.mutate(values);
  }

  return (
    <>
      <div className="flex justify-between items-center py-4">
        <h1 className="text-3xl font-bold">Contacts</h1>
        <div className="flex gap-2">
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Upload size={16} />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Import Contacts</DialogTitle>
                <DialogDescription>
                  Import contacts from a file. Supported formats: CSV, JSON, TXT.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                {!importProcessing && !importResults ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="import-format">Import Format</Label>
                      <Select value={importFormat} onValueChange={setImportFormat}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="txt">TXT - One email per line</SelectItem>
                          <SelectItem value="csv">CSV - Comma-separated values</SelectItem>
                          <SelectItem value="json">JSON - Array of emails or objects</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="list-select">Add to List (Optional)</Label>
                      <Select value={form.getValues().list} onValueChange={(value) => form.setValue('list', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a list" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {lists?.map((list) => (
                            <SelectItem key={list.id} value={list.id.toString()}>
                              {list.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Upload File</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="file" 
                          ref={fileInputRef} 
                          accept=".csv,.txt,.json" 
                          onChange={handleFileUpload} 
                          className="flex-1"
                        />
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                          <FileUp size={16} className="mr-2" />
                          Browse
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="import-text">Or Paste Emails</Label>
                      <Textarea 
                        id="import-text" 
                        value={importText} 
                        onChange={(e) => setImportText(e.target.value)} 
                        placeholder={importFormat === 'txt' ? 'email1@example.com\nemail2@example.com' : 
                          importFormat === 'csv' ? 'email1@example.com,Name1\nemail2@example.com,Name2' : 
                          '[{"email":"email1@example.com"},{"email":"email2@example.com"}]'}
                        className="min-h-[120px]"
                      />
                    </div>
                  </>
                ) : importProcessing ? (
                  <div className="space-y-4 py-4">
                    <div className="text-center">
                      <RefreshCw size={36} className="mx-auto animate-spin text-primary" />
                      <h3 className="mt-4 text-lg font-medium">Processing Contacts</h3>
                      <p className="text-sm text-muted-foreground">
                        This may take a few moments depending on the number of contacts...
                      </p>
                    </div>
                    <Progress value={processProgress} className="w-full" />
                  </div>
                ) : importResults ? (
                  <div className="space-y-4 py-4">
                    <div className="rounded-lg border p-4">
                      <h3 className="text-lg font-medium">Import Results</h3>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Total Contacts</p>
                          <p className="text-xl font-medium">{importResults.total}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Successfully Imported</p>
                          <p className="text-xl font-medium text-green-600">{importResults.valid}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Invalid Emails</p>
                          <p className="text-xl font-medium text-red-600">{importResults.invalid}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Duplicates Skipped</p>
                          <p className="text-xl font-medium text-amber-600">{importResults.duplicates}</p>
                        </div>
                      </div>
                      
                      {importResults.details.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <Label>Details</Label>
                          <div className="max-h-[150px] overflow-y-auto rounded border bg-muted p-2 text-sm">
                            {importResults.details.map((detail, index) => (
                              <div key={index} className="py-1">
                                {detail}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
              
              <DialogFooter>
                {!importProcessing && !importResults ? (
                  <>
                    <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleImport} 
                      disabled={!importText.trim()}
                    >
                      <Upload size={16} className="mr-2" />
                      Import Contacts
                    </Button>
                  </>
                ) : importResults ? (
                  <>
                    <Button variant="outline" onClick={() => {
                      setImportResults(null);
                      setImportText('');
                      setImportDialogOpen(false);
                    }}>
                      Close
                    </Button>
                    <Button onClick={() => {
                      setImportResults(null);
                      setImportText('');
                    }}>
                      Import More
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => {
                    setImportProcessing(false);
                    setProcessProgress(0);
                  }}>
                    Cancel
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Download size={16} />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Export Contacts</DialogTitle>
                <DialogDescription>
                  Download your contacts in your preferred format.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="export-format">Export Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="txt">TXT - One email per line</SelectItem>
                      <SelectItem value="csv">CSV - Comma-separated values</SelectItem>
                      <SelectItem value="json">JSON - Complete contact data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleExport}
                  disabled={exportContactsMutation.isPending}
                >
                  {exportContactsMutation.isPending ? (
                    <>
                      <RefreshCw size={16} className="mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download size={16} className="mr-2" />
                      Export
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button type="button" className="btn btn-sm btn-primary">
                <i className="bi bi-plus-lg me-1"></i> Add Contact
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
                <DialogDescription>
                  Add a new contact to your mailing list.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="list"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>List</FormLabel>
                        <FormControl>
                          <select 
                            className="form-select" 
                            {...field}
                            disabled={isLoadingLists}
                          >
                            <option value="">Select a list</option>
                            {lists?.map((list) => (
                              <option key={list.id} value={list.id}>
                                {list.name} ({list.count})
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={addContactMutation.isPending}
                    >
                      {addContactMutation.isPending ? 'Adding...' : 'Add Contact'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h5 className="text-lg font-medium">Contact Lists</h5>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus size={16} />
                  New List
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New List</DialogTitle>
                  <DialogDescription>
                    Create a new list to organize your contacts.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">List Name</Label>
                    <Input id="name" placeholder="My Awesome List" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea 
                      id="description" 
                      placeholder="A brief description of this list..."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create List</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoadingLists ? (
              [...Array(4)].map((_, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-6 w-16 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))
            ) : (
              lists?.map((list) => (
                <div key={list.id} className="border rounded-lg p-4 hover:bg-accent transition-colors">
                  <div className="flex justify-between items-start">
                    <h6 className="font-medium">{list.name}</h6>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <FileDown size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <UserPlus size={16} />
                      </Button>
                    </div>
                  </div>
                  <div className="text-2xl font-bold mt-2">{list.count}</div>
                  <div className="text-sm text-muted-foreground mt-1">Last updated: {list.lastUpdated}</div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h5 className="text-lg font-medium">All Contacts</h5>
            <div className="flex gap-2 w-full md:w-auto flex-col md:flex-row">
              <Input 
                type="search" 
                placeholder="Search contacts..." 
                className="max-w-64"
              />
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="bounced">Bounced</SelectItem>
                  <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lists</TableHead>
                <TableHead>Added On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingContacts ? (
                [...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : contacts?.length ? (
                contacts.map((contact) => {
                  const [editDialogOpen, setEditDialogOpen] = useState(false);
                  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
                  
                  // Create a form instance for this contact
                  const editForm = useForm({
                    defaultValues: {
                      name: contact.name || '',
                      email: contact.email,
                      status: contact.status?.value || 'active'
                    }
                  });
                  
                  return (
                    <TableRow key={contact.id}>
                      <TableCell>{contact.name || '-'}</TableCell>
                      <TableCell className="font-medium">{contact.email}</TableCell>
                      <TableCell>
                        {contact.status?.label ? (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            contact.status.color === 'success' ? 'bg-green-100 text-green-800' :
                            contact.status.color === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            contact.status.color === 'danger' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {contact.status.label}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {contact.lists?.length ? 
                            contact.lists.map((list, i) => (
                              <span key={list.id} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
                                {list.name}
                              </span>
                            )) : 
                            <span className="text-muted-foreground text-sm">No lists</span>
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        {contact.addedOn || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          {/* Edit Dialog */}
                          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
                                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                  <path d="m15 5 4 4"/>
                                </svg>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Contact</DialogTitle>
                                <DialogDescription>
                                  Update the contact information below.
                                </DialogDescription>
                              </DialogHeader>
                              <form onSubmit={editForm.handleSubmit(data => {
                                // Call update API
                                toast({
                                  title: "Contact updated",
                                  description: `${contact.email} has been updated.`
                                });
                                setEditDialogOpen(false);
                              })}>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" {...editForm.register('name')} />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" {...editForm.register('email')} disabled />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select 
                                      defaultValue={editForm.getValues().status}
                                      onValueChange={value => editForm.setValue('status', value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="bounced">Bounced</SelectItem>
                                        <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" type="button" onClick={() => setEditDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button type="submit">Save Changes</Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>
                          
                          {/* Delete Dialog */}
                          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
                                  <path d="M3 6h18"/>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                  <line x1="10" x2="10" y1="11" y2="17"/>
                                  <line x1="14" x2="14" y1="11" y2="17"/>
                                </svg>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Contact</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete this contact? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="border rounded-md p-4">
                                  <p className="text-sm font-medium">{contact.name}</p>
                                  <p className="text-sm">{contact.email}</p>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={() => {
                                    // Call delete API
                                    toast({
                                      title: "Contact deleted",
                                      description: `${contact.email} has been deleted.`
                                    });
                                    setDeleteDialogOpen(false);
                                  }}
                                >
                                  Delete Contact
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      <p className="text-lg font-medium mb-2">No contacts found</p>
                      <p className="mb-4">Add or import contacts to get started.</p>
                      <div className="flex gap-2">
                        <Button onClick={() => setOpen(true)}>
                          <UserPlus size={16} className="mr-2" />
                          Add Contact
                        </Button>
                        <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
                          <Upload size={16} className="mr-2" />
                          Import Contacts
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
