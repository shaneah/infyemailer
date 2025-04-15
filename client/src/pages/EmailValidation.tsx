import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Info, FileText, Upload as UploadIcon, Star, CheckCircle2, Cloud } from "lucide-react";
import { SiDropbox, SiGoogledrive, SiOneplus, SiAmazon } from "react-icons/si";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const EmailValidation = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Validate</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-medium">8,181 credits</span>
            <Info className="h-4 w-4 text-gray-400" />
          </div>
          <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">Buy Credits</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Individual Email Validation */}
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 rounded-lg p-2">
                <Mail className="text-purple-600 h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-1">Individual Email Validation</h3>
                <p className="text-gray-500 text-sm mb-8">Verify up to 25 emails at a time. 1 credit per email.</p>
                <Button className="bg-purple-700 hover:bg-purple-800">Get Started</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Upload File Section */}
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Upload your file</h3>
            <p className="text-gray-500 text-sm mb-4">Supports: CSV, TXT, XLS, or XLSX</p>
            
            <div className="flex mb-4 gap-2">
              <div className="flex items-center">
                <RadioGroup defaultValue="single" className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single">Single</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="multiple" id="multiple" />
                    <Label htmlFor="multiple">Multiple</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="text-purple-600 mb-2">
                  <UploadIcon className="h-8 w-8" />
                </div>
                <p className="text-gray-500 text-sm mb-1">Drag and drop your files here</p>
                <p className="text-gray-500 text-sm mb-4">or <span className="text-blue-500 hover:underline cursor-pointer">Browse Files</span> on your computer</p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-gray-700 font-medium mb-2">Connect to your cloud based files</p>
              <div className="grid grid-cols-5 gap-2">
                <Button variant="outline" className="flex flex-col items-center justify-center py-4 h-auto">
                  <SiDropbox className="h-6 w-6 text-blue-500 mb-1" />
                  <span className="text-xs">Dropbox</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center justify-center py-4 h-auto">
                  <SiGoogledrive className="h-6 w-6 text-blue-500 mb-1" />
                  <span className="text-xs">Google Drive</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center justify-center py-4 h-auto">
                  <Cloud className="h-6 w-6 text-blue-500 mb-1" />
                  <span className="text-xs">Microsoft OneDrive</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center justify-center py-4 h-auto">
                  <SiAmazon className="h-6 w-6 text-orange-500 mb-1" />
                  <span className="text-xs">Amazon S3</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center justify-center py-4 h-auto">
                  <FileText className="h-6 w-6 text-blue-500 mb-1" />
                  <span className="text-xs">SFTP/FTP</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Integration Section */}
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Add an Integration</h3>
            
            <div className="flex space-x-2 mb-4 border-b">
              <Button variant="ghost" className="text-xs px-2 py-1 h-auto">ALL</Button>
              <Button variant="ghost" className="text-xs px-2 py-1 h-auto">OFFICIAL</Button>
              <Button variant="ghost" className="text-xs px-2 py-1 h-auto">3RD PARTY</Button>
              <Button variant="ghost" className="text-xs px-2 py-1 h-auto">ZAPIER</Button>
              <Button variant="ghost" className="text-xs px-2 py-1 h-auto">IFTT/APP.IO</Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-full p-1">
                    <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-white">
                      <span className="text-xs font-bold">AC</span>
                    </div>
                  </div>
                  <span>ActiveCampaign</span>
                </div>
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              </div>
              
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-full p-1">
                    <div className="bg-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-white">
                      <span className="text-xs font-bold">AM</span>
                    </div>
                  </div>
                  <span>Adobe Marketo</span>
                </div>
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              </div>
              
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-full p-1">
                    <div className="bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-white">
                      <span className="text-xs font-bold">AW</span>
                    </div>
                  </div>
                  <span>AWeber</span>
                </div>
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              </div>
              
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-full p-1">
                    <div className="bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-white">
                      <span className="text-xs font-bold">BC</span>
                    </div>
                  </div>
                  <span>BigCommerce</span>
                </div>
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              </div>
              
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-full p-1">
                    <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-white">
                      <span className="text-xs font-bold">CC</span>
                    </div>
                  </div>
                  <span>ConstantContact</span>
                </div>
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              </div>
              
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 rounded-full p-1">
                    <div className="bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center text-white">
                      <span className="text-xs font-bold">D</span>
                    </div>
                  </div>
                  <span>Drip</span>
                </div>
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              </div>
              
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-full p-1">
                    <div className="bg-gray-500 rounded-full w-6 h-6 flex items-center justify-center text-white">
                      <span className="text-xs font-bold">G</span>
                    </div>
                  </div>
                  <span>Ghost</span>
                </div>
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Setup Email Validation Rules */}
          <Card className="border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-gray-100 rounded-lg p-2">
                  <Mail className="text-purple-600 h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-1">Setup Email Validation Rules</h3>
                  <p className="text-gray-500 text-sm">Allow or block specific emails, email domains, TLD or mx records.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Need More Credits */}
          <Card className="border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-gray-100 rounded-lg p-2">
                  <CheckCircle2 className="text-purple-600 h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-1">Need more credits?</h3>
                  <p className="text-gray-500 text-sm">Let's go</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailValidation;