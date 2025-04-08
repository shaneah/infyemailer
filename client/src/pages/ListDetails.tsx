import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { 
  AlertCircle, 
  ArrowLeft, 
  Download, 
  FileDown, 
  Loader2, 
  Search, 
  Trash2, 
  Upload, 
  UserPlus 
} from "lucide-react";

// UI Components
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Define TypeScript interfaces for our data
interface Contact {
  id: number;
  name?: string;
  email: string;
  status: {
    value: string;
    label: string;
    color: string;
  };
  addedOn: string;
}

interface List {
  id: number;
  name: string;
  description?: string;
  contactCount: number;
}

interface ListDetailsData {
  list: List;
  contacts: Contact[];
}

export default function ListDetails() {
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch list details and contacts
  const { data, isLoading, error } = useQuery<ListDetailsData>({
    queryKey: [`/api/lists/${id}/contacts`],
    retry: false
  });
  
  // Bulk delete contacts from list
  const bulkRemoveContactsMutation = useMutation({
    mutationFn: async (contactIds: number[]) => {
      console.log("Removing contacts:", contactIds, "from list:", id);
      try {
        const response = await apiRequest("POST", `/api/lists/${id}/remove-contacts`, { contactIds });
        console.log("Remove contacts response:", response);
        return response;
      } catch (error) {
        console.error("Error removing contacts:", error);
        throw error;
      }
    },
    onSuccess: () => {
      setSelectedContacts([]);
      setSelectAll(false);
      setBulkDeleteDialogOpen(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/lists/${id}/contacts`] });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      
      toast({
        title: "Contacts removed",
        description: `Successfully removed ${selectedContacts.length} contacts from this list.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove contacts from list. Please try again.",
        variant: "destructive",
      });
      console.error("Bulk delete error:", error);
    }
  });

  // Filter contacts based on search term and status
  const filteredContacts = data?.contacts
    ? data.contacts.filter((contact: Contact) => {
        const matchesSearch = searchTerm 
          ? (contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
             contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
          : true;
          
        const matchesStatus = statusFilter !== 'all' 
          ? contact.status.value === statusFilter 
          : true;
          
        return matchesSearch && matchesStatus;
      })
    : [];

  // Handle errors
  if (error) {
    return (
      <div className="py-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Link href="/contacts">
              <Button variant="outline" size="icon" className="mr-2">
                <ArrowLeft size={16} />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">List Not Found</h1>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center p-6">
              <div className="rounded-full bg-red-100 p-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                  <path d="M12 9v4"></path>
                  <path d="M12 17h.01"></path>
                  <path d="M3.58 17.36a9 9 0 1 0 16.84 0A9 9 0 0 0 3.58 17.36z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold">Error Loading List</h2>
              <p className="text-muted-foreground mt-2 mb-4">
                There was a problem loading this contact list. The list may not exist or has been deleted.
              </p>
              <Link href="/contacts">
                <Button>
                  Return to Contacts
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Header with back button and list name */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Link href="/contacts">
            <Button variant="outline" size="icon" className="mr-2">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          {isLoading ? (
            <Skeleton className="h-9 w-48" />
          ) : (
            <h1 className="text-3xl font-bold">{data?.list?.name || 'List'}</h1>
          )}
          {data?.list?.contactCount && data.list.contactCount > 0 && (
            <Badge variant="outline" className="ml-2 text-sm">
              {data.list.contactCount} contacts
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <FileDown size={16} />
            Export
          </Button>
          <Button className="flex items-center gap-2">
            <UserPlus size={16} />
            Add Contact
          </Button>
        </div>
      </div>
      
      {/* Description if available */}
      {data?.list?.description && (
        <div className="text-muted-foreground mb-6">
          {data.list.description}
        </div>
      )}
      
      <Card>
        <CardHeader className="p-4 pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="font-medium">Contacts in this list</div>
              {selectedContacts.length > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => setBulkDeleteDialogOpen(true)}
                  className="ml-2"
                >
                  <Trash2 size={16} className="mr-2" />
                  Remove Selected ({selectedContacts.length})
                </Button>
              )}
            </div>
            <div className="flex gap-2 w-full md:w-auto flex-col md:flex-row">
              <div className="relative max-w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search..." 
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                <TableHead className="w-[40px]">
                  <Checkbox 
                    checked={selectAll}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        // Select all contacts
                        setSelectAll(true);
                        setSelectedContacts(filteredContacts.map((c: Contact) => c.id));
                      } else {
                        // Deselect all contacts
                        setSelectAll(false);
                        setSelectedContacts([]);
                      }
                    }}
                    aria-label="Select all contacts"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeletons
                [...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredContacts.length > 0 ? (
                // Contacts table
                filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedContacts([...selectedContacts, contact.id]);
                          } else {
                            setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                            setSelectAll(false);
                          }
                        }}
                        aria-label={`Select contact ${contact.email}`}
                      />
                    </TableCell>
                    <TableCell>{contact.name || '-'}</TableCell>
                    <TableCell className="font-medium">{contact.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        contact.status.color === 'success' ? 'bg-green-100 text-green-800' :
                        contact.status.color === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        contact.status.color === 'danger' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {contact.status.label}
                      </span>
                    </TableCell>
                    <TableCell>{contact.addedOn}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                            <path d="m15 5 4 4"/>
                          </svg>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => {
                            // Remove contact from list
                            bulkRemoveContactsMutation.mutate([contact.id]);
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                // Empty state
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
                      {searchTerm || statusFilter !== 'all' ? (
                        <p className="mb-4">Try adjusting your search or filter criteria.</p>
                      ) : (
                        <p className="mb-4">Add contacts to this list to get started.</p>
                      )}
                      <Button className="flex items-center gap-2">
                        <UserPlus size={16} className="mr-2" />
                        Add Contact
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bulk Delete Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Contacts from List</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedContacts.length} selected contacts from this list? The contacts will remain in your database but will no longer be part of this list.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="border rounded-md p-4 bg-muted/50">
              <p className="text-sm mb-2">{selectedContacts.length} contacts selected for removal</p>
              <Progress value={(selectedContacts.length / (filteredContacts?.length || 1)) * 100} className="h-2" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                bulkRemoveContactsMutation.mutate(selectedContacts);
              }}
              disabled={bulkRemoveContactsMutation.isPending}
            >
              {bulkRemoveContactsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Contacts
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}