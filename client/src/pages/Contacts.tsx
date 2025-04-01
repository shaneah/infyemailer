import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  
  function onSubmit(values: z.infer<typeof contactFormSchema>) {
    addContactMutation.mutate(values);
  }

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Contacts</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <div className="btn-group me-2">
            <button type="button" className="btn btn-sm btn-outline-secondary">
              <i className="bi bi-upload me-1"></i> Import
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary">
              <i className="bi bi-download me-1"></i> Export
            </button>
          </div>
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
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Contact Lists</h5>
            <button className="btn btn-sm btn-outline-primary">
              <i className="bi bi-plus-lg me-1"></i> New List
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="row g-3">
            {isLoadingLists ? (
              [...Array(4)].map((_, index) => (
                <div className="col-md-3" key={index}>
                  <div className="card">
                    <div className="card-body">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-6 w-16 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              lists?.map((list) => (
                <div className="col-md-3" key={list.id}>
                  <div className="card hover-card">
                    <div className="card-body">
                      <h6 className="card-title">{list.name}</h6>
                      <div className="fs-4 fw-bold mb-1">{list.count}</div>
                      <small className="text-muted">Last updated: {list.lastUpdated}</small>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">All Contacts</h5>
            <div className="d-flex">
              <Input 
                type="search" 
                placeholder="Search contacts..." 
                className="mr-2 w-64"
              />
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
                <TableHead>Actions</TableHead>
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
                contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>
                      <span className={`badge bg-${contact.status.color}`}>
                        {contact.status.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      {contact.lists.map((list, i) => (
                        <span key={list.id} className="badge bg-secondary me-1">
                          {list.name}
                        </span>
                      ))}
                    </TableCell>
                    <TableCell>{contact.addedOn}</TableCell>
                    <TableCell>
                      <div className="btn-group">
                        <button type="button" className="btn btn-sm btn-outline-secondary">Edit</button>
                        <button type="button" className="btn btn-sm btn-outline-secondary dropdown-toggle dropdown-toggle-split">
                          <span className="visually-hidden">Toggle Dropdown</span>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    <div className="text-muted">
                      <i className="bi bi-people fs-2 mb-2"></i>
                      <p>No contacts found. Add contacts to get started.</p>
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
