import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as XLSX from 'xlsx';

// UI Components
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  FileUp, 
  FileDown, 
  Download, 
  Upload, 
  Plus, 
  UserPlus, 
  RefreshCw,
  Loader2,
  User,
  UserCog,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Trash2,
  Users,
  X
} from "lucide-react";

// Contact Row Component
interface ContactRowProps {
  contact: any;
  onUpdate: (data: any) => void;
  onDelete: () => void;
}

function ContactTableRow({ contact, onUpdate, onDelete }: ContactRowProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Create a form instance for this contact
  const editForm = useForm({
    defaultValues: {
      name: contact.name || '',
      email: contact.email,
      status: contact.status?.value || 'active'
    }
  });
  
  return (
    <TableRow>
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
            contact.lists.map((list: any) => (
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
                onUpdate(data);
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
                    onDelete();
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
}

// Main Contacts Component
const contactFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  list: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function Contacts() {
  // State
  const [open, setOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
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
  
  // Types for API data
  interface Contact {
    id: number;
    name: string;
    email: string;
    status?: {
      label: string;
      color: string;
      value: string;
    };
    lists?: Array<{
      id: number;
      name: string;
    }>;
    addedOn?: string;
  }

  interface List {
    id: number | string;
    name: string;
    count?: number;
    lastUpdated?: string;
  }

  // Queries
  const { data: contacts = [], isLoading: isLoadingContacts } = useQuery<Contact[]>({
    queryKey: ['/api/contacts'],
  });
  
  const { data: lists = [], isLoading: isLoadingLists } = useQuery<List[]>({
    queryKey: ['/api/lists'],
  });
  
  // Forms
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      list: "_none",
    },
  });
  
  // Modified type to handle the optional list field
  type ContactSubmitValues = {
    name: string;
    email: string;
    list?: string;
  };

  // Mutations
  const addContactMutation = useMutation({
    mutationFn: (values: ContactSubmitValues) => {
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
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to add contact: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Import contacts mutation
  const importContactsMutation = useMutation({
    mutationFn: async (data: { 
      emails: string[]; 
      contacts?: Array<{email: string, name?: string}>;
      format: string; 
      listId?: string 
    }) => {
      return apiRequest("POST", "/api/contacts/import", data);
    },
    onSuccess: (data: any) => {
      // Force a refresh of the contacts list
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      
      // Update the results display
      setImportResults({
        total: data.total || 0,
        valid: data.valid || 0,
        invalid: data.invalid || 0,
        duplicates: data.duplicates || 0,
        details: data.details || []
      });
      
      // Complete the import process
      setImportProcessing(false);
      setProcessProgress(100);
      
      console.log("Import completed with results:", data);
      
      // Show success notification
      toast({
        title: "Import completed",
        description: `Successfully imported ${data.valid} contacts.`,
      });
    },
    onError: (error: any) => {
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
    onSuccess: (data: any) => {
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
    onError: (error: any) => {
      toast({
        title: "Export failed",
        description: `Failed to export contacts: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Update and delete contact mutations
  const updateContactMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => {
      return apiRequest("PATCH", `/api/contacts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      toast({
        title: "Contact updated",
        description: "Contact has been updated successfully.",
      });
    }
  });
  
  const deleteContactMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest("DELETE", `/api/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      toast({
        title: "Contact deleted",
        description: "Contact has been deleted successfully.",
      });
    }
  });
  
  // Create list mutation
  const createListMutation = useMutation({
    mutationFn: (values: { name: string; description?: string }) => {
      return apiRequest("POST", "/api/lists", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lists'] });
      toast({
        title: "List created",
        description: "The contact list has been created successfully.",
      });
      setListDialogOpen(false);
      setNewListName('');
      setNewListDescription('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create list: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Helper functions
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
    
    // Handle Excel files separately
    if (extension === 'xlsx' || extension === 'xls') {
      setImportFormat('xlsx');
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first worksheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // Extract emails from the data - look for email column or first column
          let contacts: Array<{email: string, name?: string}> = [];
          
          if (jsonData.length > 0) {
            // Try to find an email column
            const firstRow = jsonData[0] as any;
            const emailColumn = Object.keys(firstRow).find(key => 
              key.toLowerCase().includes('email') || 
              key.toLowerCase() === 'e-mail' ||
              key.toLowerCase() === 'mail'
            );
            
            // Try to find name column
            const nameColumn = Object.keys(firstRow).find(key => 
              key.toLowerCase().includes('name') || 
              key.toLowerCase() === 'contact name' ||
              key.toLowerCase() === 'full name' ||
              key.toLowerCase() === 'first name'
            );
            
            if (emailColumn) {
              // Process rows and extract both email and name if available
              contacts = jsonData
                .map((row: any) => {
                  const email = row[emailColumn]?.toString()?.trim();
                  if (!email) return null;
                  
                  const contact: {email: string, name?: string} = { email };
                  
                  // Add name if name column exists
                  if (nameColumn && row[nameColumn]) {
                    contact.name = row[nameColumn].toString().trim();
                  }
                  
                  return contact;
                })
                .filter((item): item is {email: string, name?: string} => item !== null);
            } else {
              // Use the first column as email
              const firstColumn = Object.keys(firstRow)[0];
              
              contacts = jsonData
                .map((row: any) => {
                  const email = row[firstColumn]?.toString()?.trim();
                  if (!email) return null;
                  
                  const contact: {email: string, name?: string} = { email };
                  
                  // Add name if name column exists
                  if (nameColumn && row[nameColumn]) {
                    contact.name = row[nameColumn].toString().trim();
                  }
                  
                  return contact;
                })
                .filter((item): item is {email: string, name?: string} => item !== null);
            }
          }
          
          // Set as JSON for processing
          setImportText(JSON.stringify(contacts));
          toast({
            title: "Excel file loaded",
            description: `Found ${contacts.length} email addresses in the file.`,
          });
        } catch (error) {
          toast({
            title: "Error parsing Excel file",
            description: "Could not extract data from the Excel file. Please check the format.",
            variant: "destructive",
          });
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (extension === 'csv' || extension === 'json' || extension === 'txt') {
      setImportFormat(extension);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setImportText(content || '');
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Unsupported file format",
        description: "Please upload a file in Excel (.xlsx, .xls), CSV, JSON, or TXT format.",
        variant: "destructive",
      });
    }
  }

  function handleImport() {
    setImportProcessing(true);
    setProcessProgress(10);
    
    // Parse the import text based on format
    let emails: string[] = [];
    let contactData: Array<{email: string, name?: string}> = [];
    
    try {
      if (importFormat === 'json') {
        try {
          const parsed = JSON.parse(importText);
          if (Array.isArray(parsed)) {
            // Handle array of items
            contactData = parsed.map((item: any) => {
              if (typeof item === 'string') {
                return { email: item };
              } else if (item && typeof item === 'object' && item.email) {
                return { 
                  email: item.email,
                  name: item.name || undefined
                };
              }
              return null;
            }).filter((item): item is {email: string, name?: string} => item !== null);
            
            // Extract just emails for backward compatibility
            emails = contactData.map(item => item.email);
          } else {
            // Handle object
            contactData = Object.values(parsed).map((item: any) => {
              if (typeof item === 'string') {
                return { email: item };
              } else if (item && typeof item === 'object' && item.email) {
                return { 
                  email: item.email,
                  name: item.name || undefined
                };
              }
              return null;
            }).filter((item): item is {email: string, name?: string} => item !== null);
            
            // Extract just emails for backward compatibility
            emails = contactData.map(item => item.email);
          }
        } catch (e) {
          throw new Error('Invalid JSON format');
        }
      } else if (importFormat === 'csv') {
        // For CSV, we try to extract both email and name
        const lines = importText.split('\n').filter(Boolean);
        contactData = lines.map(line => {
          const parts = line.split(',').map(part => part.trim());
          if (parts.length >= 1 && parts[0]) {
            const contact: {email: string, name?: string} = {
              email: parts[0]
            };
            
            if (parts.length >= 2 && parts[1]) {
              contact.name = parts[1];
            }
            
            return contact;
          }
          return null;
        }).filter((item): item is {email: string, name?: string} => item !== null);
        
        // Extract just emails for backward compatibility
        emails = contactData.map(item => item.email);
      } else if (importFormat === 'xlsx') {
        // For Excel files, the JSON data was already prepared by the file reader
        try {
          contactData = JSON.parse(importText);
          emails = contactData.map(item => item.email);
        } catch (e) {
          throw new Error('Invalid Excel data format');
        }
      } else {
        // Default to TXT format - one email per line
        emails = importText
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean);
          
        // Create basic contact data with just emails
        contactData = emails.map(email => ({ email }));
      }
      
      setProcessProgress(50);
      
      // Call API to process emails
      const listId = form.getValues().list;
      importContactsMutation.mutate({ 
        emails, 
        contacts: contactData,
        format: importFormat,
        listId: listId && listId !== "_none" ? listId : undefined
      });
      
    } catch (error: any) {
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

  function onSubmit(values: ContactFormValues) {
    // If list is _none, we don't need to send it to the server
    const submitValues = {
      ...values,
      list: values.list === "_none" ? undefined : values.list
    };
    addContactMutation.mutate(submitValues);
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
                  Import contacts from a file. Supported formats: Excel, CSV, JSON, TXT.
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
                          <SelectItem value="xlsx">Excel - Spreadsheet</SelectItem>
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
                          <SelectItem value="_none">None</SelectItem>
                          {lists?.map((list: any) => (
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
                          accept=".csv,.txt,.json,.xlsx,.xls" 
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
                        placeholder={
                          importFormat === 'txt' ? 'email1@example.com\nemail2@example.com' : 
                          importFormat === 'csv' ? 'email1@example.com,Name1\nemail2@example.com,Name2' : 
                          importFormat === 'xlsx' ? 'For Excel files, please use the file upload above instead of pasting content here.' :
                          '[{"email":"email1@example.com"},{"email":"email2@example.com"}]'
                        }
                        className="min-h-[120px]"
                        disabled={importFormat === 'xlsx'}
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
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <div className="space-y-1 bg-slate-50 p-3 rounded-md">
                          <p className="text-sm text-muted-foreground">Total Contacts</p>
                          <p className="text-2xl font-semibold">{importResults.total}</p>
                        </div>
                        <div className="space-y-1 bg-green-50 p-3 rounded-md">
                          <p className="text-sm text-muted-foreground">Successfully Imported</p>
                          <p className="text-2xl font-semibold text-green-600">{importResults.valid}</p>
                        </div>
                        <div className="space-y-1 bg-red-50 p-3 rounded-md">
                          <p className="text-sm text-muted-foreground">Invalid Emails</p>
                          <p className="text-2xl font-semibold text-red-600">{importResults.invalid}</p>
                        </div>
                        <div className="space-y-1 bg-amber-50 p-3 rounded-md">
                          <p className="text-sm text-muted-foreground">Duplicates Skipped</p>
                          <p className="text-2xl font-semibold text-amber-600">{importResults.duplicates}</p>
                        </div>
                      </div>
                      
                      {importResults.details && importResults.details.length > 0 && (
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
                      <SelectItem value="json">JSON - Detailed contact data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleExport}>
                  <FileDown size={16} className="mr-2" />
                  Export Contacts
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus size={16} />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
                <DialogDescription>
                  Add a new contact to your list. Fill in the details below.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a list" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="_none">None</SelectItem>
                            {lists?.map((list: any) => (
                              <SelectItem key={list.id} value={list.id.toString()}>
                                {list.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Contact</Button>
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
            <Dialog open={listDialogOpen} onOpenChange={setListDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2" onClick={() => setListDialogOpen(true)}>
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
                    <Input 
                      id="name" 
                      placeholder="My Awesome List" 
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea 
                      id="description" 
                      placeholder="A brief description of this list..."
                      className="min-h-[80px]"
                      value={newListDescription}
                      onChange={(e) => setNewListDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setListDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => {
                      if (!newListName.trim()) {
                        toast({
                          title: "Error",
                          description: "List name is required",
                          variant: "destructive",
                        });
                        return;
                      }
                      createListMutation.mutate({
                        name: newListName.trim(),
                        description: newListDescription.trim() || undefined
                      });
                    }}
                    disabled={createListMutation.isPending}
                  >
                    {createListMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : "Create List"}
                  </Button>
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
              lists?.map((list: any) => (
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
                contacts.map((contact: any) => (
                  <ContactTableRow 
                    key={contact.id} 
                    contact={contact} 
                    onUpdate={(data) => {
                      updateContactMutation.mutate({
                        id: contact.id,
                        data
                      });
                    }}
                    onDelete={() => {
                      deleteContactMutation.mutate(contact.id);
                    }}
                  />
                ))
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