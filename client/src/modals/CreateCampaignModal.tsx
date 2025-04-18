import React, { useState } from 'react';
import { X, Mail, Send, Clock, Calendar, Users, FileText, Zap } from 'lucide-react';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [campaignType, setCampaignType] = useState<string | null>(null);
  
  if (!isOpen) return null;

  const campaignTypes = [
    { id: 'newsletter', name: 'Newsletter', icon: <Mail />, description: 'Regular updates to your subscribers', color: 'bg-purple-600' },
    { id: 'promotional', name: 'Promotional', icon: <Zap />, description: 'Special offers and marketing campaigns', color: 'bg-indigo-600' },
    { id: 'announcement', name: 'Announcement', icon: <Send />, description: 'Important announcements to your audience', color: 'bg-blue-600' },
    { id: 'automated', name: 'Automated Series', icon: <Clock />, description: 'Sequence of automated emails', color: 'bg-violet-600' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto animate-fadeIn">
        {/* Header with gradient background */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-5 flex justify-between items-center text-white rounded-t-xl z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur-sm">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Create New Campaign</h2>
              <p className="text-xs text-white/80">Design a perfect email campaign</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Progress indicator */}
        <div className="px-6 pt-6">
          <div className="w-full bg-gray-100 h-1.5 rounded-full mb-6">
            <div 
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mb-6">
            <div className={`flex flex-col items-center ${step >= 1 ? 'text-indigo-600 font-medium' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>1</div>
              <span>Type</span>
            </div>
            <div className={`flex flex-col items-center ${step >= 2 ? 'text-indigo-600 font-medium' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>2</div>
              <span>Details</span>
            </div>
            <div className={`flex flex-col items-center ${step >= 3 ? 'text-indigo-600 font-medium' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>3</div>
              <span>Review</span>
            </div>
          </div>
        </div>
        
        <div className="p-6 pt-0">
          {step === 1 && (
            <div className="animate-fadeIn">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Select Campaign Type</h3>
              <p className="text-gray-500 mb-6">Choose the type of campaign you want to create</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {campaignTypes.map(type => (
                  <div 
                    key={type.id}
                    onClick={() => setCampaignType(type.id)}
                    className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      campaignType === type.id 
                        ? 'border-indigo-300 bg-indigo-50 shadow-md' 
                        : 'border-gray-200 hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-lg ${type.color} text-white`}>
                        {type.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{type.name}</h4>
                        <p className="text-sm text-gray-500">{type.description}</p>
                      </div>
                      {campaignType === type.id && (
                        <div className="ml-auto">
                          <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fadeIn">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Campaign Details</h3>
              <p className="text-gray-500 mb-6">Enter the details for your campaign</p>
              
              <form className="space-y-5">
                <div>
                  <label htmlFor="campaign-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Name <span className="text-indigo-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      id="campaign-name"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Monthly Newsletter - April 2025"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject-line" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Line <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject-line"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter email subject line"
                    required
                  />
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 w-1/3 bg-red-400 rounded-full"></div>
                    <span className="text-xs text-gray-500">Subject line strength: Weak</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="sender-name" className="block text-sm font-medium text-gray-700 mb-1">
                      From Name <span className="text-indigo-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="sender-name"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Company Name or Your Name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="reply-to" className="block text-sm font-medium text-gray-700 mb-1">
                      Reply-to Email <span className="text-indigo-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="reply-to"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="recipient-list" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Recipients <span className="text-indigo-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Users className="h-4 w-4" />
                    </div>
                    <select
                      id="recipient-list"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                      required
                    >
                      <option value="">Select a list</option>
                      <option value="1">Newsletter Subscribers (1240 contacts)</option>
                      <option value="2">VIP Customers (156 contacts)</option>
                      <option value="3">Webinar Attendees (435 contacts)</option>
                      <option value="4">Product Launch Interests (890 contacts)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Template
                  </label>
                  <select
                    id="template"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                  >
                    <option value="">Use blank template</option>
                    <option value="1">Monthly Newsletter</option>
                    <option value="2">Product Announcement</option>
                    <option value="3">Seasonal Promotion</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Scheduling Options
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="border border-gray-200 rounded-lg p-3 flex items-center hover:border-indigo-300 cursor-pointer">
                      <input
                        id="send-now"
                        name="schedule"
                        type="radio"
                        value="now"
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        defaultChecked
                      />
                      <label htmlFor="send-now" className="ml-3 block cursor-pointer">
                        <div className="text-sm font-medium text-gray-700 flex items-center">
                          <Send className="h-4 w-4 mr-2 text-indigo-500" />
                          Send immediately
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Send as soon as campaign is ready</p>
                      </label>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-3 flex items-center hover:border-indigo-300 cursor-pointer">
                      <input
                        id="schedule-later"
                        name="schedule"
                        type="radio"
                        value="later"
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <label htmlFor="schedule-later" className="ml-3 block cursor-pointer">
                        <div className="text-sm font-medium text-gray-700 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
                          Schedule for later
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Pick a date and time to send</p>
                      </label>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}
          
          {step === 3 && (
            <div className="animate-fadeIn">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Review Your Campaign</h3>
              <p className="text-gray-500 mb-6">Review your campaign details before proceeding</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Campaign Type</p>
                    <p className="text-sm font-medium text-gray-800">
                      {campaignType === 'newsletter' && 'Newsletter'}
                      {campaignType === 'promotional' && 'Promotional'}
                      {campaignType === 'announcement' && 'Announcement'}
                      {campaignType === 'automated' && 'Automated Series'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Campaign Name</p>
                    <p className="text-sm font-medium text-gray-800">Monthly Newsletter - April 2025</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Subject Line</p>
                    <p className="text-sm font-medium text-gray-800">Latest Updates and Exclusive Offers</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">From</p>
                    <p className="text-sm font-medium text-gray-800">Infinity Tech</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Recipients</p>
                    <p className="text-sm font-medium text-gray-800">Newsletter Subscribers (1240 contacts)</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Send Time</p>
                    <p className="text-sm font-medium text-gray-800">Immediately after creation</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-2 text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-indigo-800">Next Steps</h4>
                    <p className="text-xs text-indigo-600 mt-0.5">After creating this campaign, you'll proceed to the email editor where you can design your email content.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className={`mt-8 flex ${step === 1 ? 'justify-end' : 'justify-between'}`}>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Back
              </button>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && !campaignType}
                  className={`px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-md hover:shadow-lg ${
                    step === 1 && !campaignType ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Create & Proceed to Editor
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignModal;