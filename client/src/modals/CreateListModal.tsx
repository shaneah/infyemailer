import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ListFormData {
  name: string;
  description: string;
  tags: string;
  requireDoubleOptIn: boolean;
  sendWelcomeEmail: boolean;
}

const CreateListModal: React.FC<CreateListModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ListFormData>({
    name: '',
    description: '',
    tags: '',
    requireDoubleOptIn: false,
    sendWelcomeEmail: false,
  });

  const createListMutation = useMutation({
    mutationFn: async (data: Omit<ListFormData, 'tags'> & { tags: string[] }) => {
      console.log('Creating list with data:', data);
      try {
        // First get the client ID from the session
        const sessionResponse = await fetch('/api/client/session');
        const session = await sessionResponse.json();
        console.log('Session for list creation:', session);
        if (!session.user?.clientId) {
          throw new Error('Client not authenticated');
        }
        // Ensure clientId is included in the request body as well
        const payload = { ...data, clientId: session.user.clientId };
        const response = await apiRequest('POST', `/api/client/lists?clientId=${session.user.clientId}`, payload);
        const result = await response.json();
        console.log('List created successfully:', result);
        return result;
      } catch (error) {
        console.error('Error in createListMutation:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Mutation success, invalidating queries');
      // Invalidate both the lists query and any list count queries
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/client/lists'] }),
        queryClient.invalidateQueries({ queryKey: ['lists'] }),
        queryClient.invalidateQueries({ queryKey: ['listCounts'] })
      ]).then(() => {
        console.log('Queries invalidated successfully');
        toast({
          title: 'List created',
          description: 'Your contact list has been created successfully.',
          variant: 'default',
        });
        onClose();
      }).catch(error => {
        console.error('Error invalidating queries:', error);
        toast({
          title: 'List created',
          description: 'Your contact list has been created, but there was an issue refreshing the list.',
          variant: 'default',
        });
        onClose();
      });
    },
    onError: (error: Error) => {
      console.error('Error in createListMutation onError:', error);
      toast({
        title: 'Error creating list',
        description: error.message || 'Failed to create list. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'List name is required',
        variant: 'destructive',
      });
      return;
    }

    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    // Get client ID from session first
    fetch('/api/client/session')
      .then(response => response.json())
      .then(session => {
        if (!session.user?.clientId) {
          throw new Error('Client not authenticated');
        }
        
        // Include clientId in the list data
        const listData = {
          ...formData,
          tags: tagsArray,
          clientId: session.user.clientId
        };

        createListMutation.mutate(listData);
      })
      .catch(error => {
        console.error('Error getting client session:', error);
        toast({
          title: 'Error',
          description: 'Failed to get client session. Please try again.',
          variant: 'destructive',
        });
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Create New List</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="list-name" className="block text-sm font-medium text-gray-700 mb-1">
                  List Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="list-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="e.g., Newsletter Subscribers"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Add a description for this list"
                ></textarea>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="e.g., Newsletter, Important, Marketing"
                />
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">
                  Add Contacts
                </span>
                <div className="mt-1 border border-gray-300 rounded-md p-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="add-contacts"
                          name="add-contacts"
                          type="checkbox"
                          className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="add-contacts" className="font-medium text-gray-700">
                          Add contacts to this list now
                        </label>
                        <p className="text-gray-500">
                          You can select existing contacts or import new ones
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  List Options
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="double-optin"
                      name="requireDoubleOptIn"
                      type="checkbox"
                      checked={formData.requireDoubleOptIn}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="double-optin" className="ml-2 block text-sm text-gray-700">
                      Require double opt-in for new subscribers
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="welcome-email"
                      name="sendWelcomeEmail"
                      type="checkbox"
                      checked={formData.sendWelcomeEmail}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="welcome-email" className="ml-2 block text-sm text-gray-700">
                      Send welcome email to new subscribers
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center"
                disabled={createListMutation.isPending}
              >
                {createListMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : 'Create List'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateListModal;