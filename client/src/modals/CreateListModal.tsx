import React from 'react';
import { X } from 'lucide-react';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateListModal: React.FC<CreateListModalProps> = ({ isOpen, onClose }) => {
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
          <form>
            <div className="space-y-4">
              <div>
                <label htmlFor="list-name" className="block text-sm font-medium text-gray-700 mb-1">
                  List Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="list-name"
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
                      type="checkbox"
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="double-optin" className="ml-2 block text-sm text-gray-700">
                      Require double opt-in for new subscribers
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="welcome-email"
                      type="checkbox"
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
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Create List
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateListModal;