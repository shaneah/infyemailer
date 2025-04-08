import React from 'react';
import { X } from 'lucide-react';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Create New Template</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <form>
            <div className="space-y-4">
              <div>
                <label htmlFor="template-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="template-name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="e.g., Monthly Newsletter"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Newsletter">Newsletter</option>
                  <option value="Promotional">Promotional</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Events">Events</option>
                  <option value="Engagement">Engagement</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Add a description for this template"
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
                  placeholder="e.g., Newsletter, Professional, Monthly"
                />
              </div>
              
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-3">
                  Starting Point
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-primary relative">
                    <input 
                      type="radio" 
                      id="blank-template" 
                      name="starting-point" 
                      className="sr-only"
                      defaultChecked
                    />
                    <label htmlFor="blank-template" className="cursor-pointer block">
                      <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        <div className="mt-2 font-medium">Blank Template</div>
                        <p className="text-xs text-gray-500 mt-1">Start from scratch</p>
                      </div>
                    </label>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-primary relative">
                    <input 
                      type="radio" 
                      id="existing-template" 
                      name="starting-point" 
                      className="sr-only" 
                    />
                    <label htmlFor="existing-template" className="cursor-pointer block">
                      <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <div className="mt-2 font-medium">Existing Template</div>
                        <p className="text-xs text-gray-500 mt-1">Duplicate and modify</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Create & Open Editor
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTemplateModal;