import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newList: any) => void;
}

const CreateListModal: React.FC<CreateListModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [addContacts, setAddContacts] = useState(false);
  const [doubleOptIn, setDoubleOptIn] = useState(false);
  const [welcomeEmail, setWelcomeEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Missing information",
        description: "List name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Process tags
      const tagList = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      // Create list data
      const listData = {
        name: name.trim(),
        description: description.trim(),
        metadata: {
          tags: tagList,
          doubleOptIn,
          welcomeEmail
        }
      };

      console.log('Creating list with data:', listData);
      
      // Submit to API
      const response = await apiRequest('POST', '/api/lists', listData);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create list');
      }
      
      const newList = await response.json();
      
      toast({
        title: "Success",
        description: `List "${name}" has been created`,
      });
      
      // Reset form
      setName('');
      setDescription('');
      setTags('');
      setAddContacts(false);
      setDoubleOptIn(false);
      setWelcomeEmail(false);
      
      // Notify parent component and close
      if (onSuccess) onSuccess(newList);
      onClose();
    } catch (error) {
      console.error('Error creating list:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create list",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Create New List</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="e.g., Newsletter Subscribers"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Add a description for this list"
                  disabled={isSubmitting}
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="e.g., Newsletter, Important, Marketing"
                  disabled={isSubmitting}
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
                          checked={addContacts}
                          onChange={(e) => setAddContacts(e.target.checked)}
                          className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                          disabled={isSubmitting}
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
                      type="checkbox"
                      checked={doubleOptIn}
                      onChange={(e) => setDoubleOptIn(e.target.checked)}
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="double-optin" className="ml-2 block text-sm text-gray-700">
                      Require double opt-in for new subscribers
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="welcome-email"
                      type="checkbox"
                      checked={welcomeEmail}
                      onChange={(e) => setWelcomeEmail(e.target.checked)}
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      disabled={isSubmitting}
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
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center gap-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create List</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateListModal;