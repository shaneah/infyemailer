import React from 'react';
import { X } from 'lucide-react';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Create New Email Campaign</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <form>
            <div className="space-y-6">
              <div>
                <label htmlFor="campaign-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="campaign-name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="e.g., Monthly Newsletter - April 2025"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="subject-line" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Line <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject-line"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Enter email subject line"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="sender-name" className="block text-sm font-medium text-gray-700 mb-1">
                  From Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="sender-name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="e.g., Company Name or Your Name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="reply-to" className="block text-sm font-medium text-gray-700 mb-1">
                  Reply-to Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="reply-to"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="email@example.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="recipient-list" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Recipients <span className="text-red-500">*</span>
                </label>
                <select
                  id="recipient-list"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  required
                >
                  <option value="">Select a list</option>
                  <option value="1">Newsletter Subscribers (1240 contacts)</option>
                  <option value="2">VIP Customers (156 contacts)</option>
                  <option value="3">Webinar Attendees (435 contacts)</option>
                  <option value="4">Product Launch Interests (890 contacts)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Template
                </label>
                <select
                  id="template"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
                  <option value="">Use blank template</option>
                  <option value="1">Monthly Newsletter</option>
                  <option value="2">Product Announcement</option>
                  <option value="3">Seasonal Promotion</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduling Options
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      id="send-now"
                      name="schedule"
                      type="radio"
                      value="now"
                      className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                      defaultChecked
                    />
                    <label htmlFor="send-now" className="ml-2 block text-sm text-gray-700">
                      Send immediately
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="schedule-later"
                      name="schedule"
                      type="radio"
                      value="later"
                      className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <label htmlFor="schedule-later" className="ml-2 block text-sm text-gray-700">
                      Schedule for later
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
                Create & Proceed to Editor
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignModal;