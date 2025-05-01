import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Users, 
  FileText, 
  BarChart,
  PlusCircle,
  UploadCloud,
  Award,
  Edit,
  ArrowRight,
  Sparkles,
  LineChart,
  Split
} from "lucide-react";
import { motion } from "framer-motion";

interface QuickActionsProps {
  onCreateEmail: () => void;
}

const QuickActions = ({ onCreateEmail }: QuickActionsProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Quick Actions</h3>
        <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50">
          <PlusCircle className="mr-1 h-4 w-4" />
          <span>Add Widget</span>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-none bg-gradient-to-br from-white to-gray-50 h-full group">
            <CardContent className="p-0">
              <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-br from-indigo-500/20 to-blue-400/10 rounded-bl-full opacity-40 transform translate-x-4 -translate-y-4 group-hover:opacity-60 transition-opacity"></div>
              
              <div className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 mb-4 shadow-sm border border-indigo-100 group-hover:border-indigo-200 transition-colors">
                  <Mail className="h-7 w-7 text-indigo-600 group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">Create Email</h4>
                <p className="text-gray-500 text-sm mb-5">Design and send a one-time email to your subscribers.</p>
                <Button 
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md group-hover:shadow-lg transition-all"
                  onClick={onCreateEmail}
                >
                  <Sparkles className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                  Create Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-none bg-gradient-to-br from-white to-gray-50 h-full group">
            <CardContent className="p-0">
              <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-br from-emerald-500/20 to-green-400/10 rounded-bl-full opacity-40 transform translate-x-4 -translate-y-4 group-hover:opacity-60 transition-opacity"></div>
              
              <div className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-50 to-green-50 mb-4 shadow-sm border border-emerald-100 group-hover:border-emerald-200 transition-colors">
                  <Users className="h-7 w-7 text-emerald-600 group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">Add Contacts</h4>
                <p className="text-gray-500 text-sm mb-5">Import or manually add new contacts to your lists.</p>
                <Button variant="outline" className="w-full group-hover:border-emerald-300 group-hover:text-emerald-700 transition-colors" asChild>
                  <Link href="/contacts" className="flex items-center justify-center">
                    <UploadCloud className="h-4 w-4 mr-2 group-hover:translate-y-[-2px] transition-transform" />
                    Manage Contacts
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-none bg-gradient-to-br from-white to-gray-50 h-full group">
            <CardContent className="p-0">
              <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-br from-violet-500/20 to-purple-400/10 rounded-bl-full opacity-40 transform translate-x-4 -translate-y-4 group-hover:opacity-60 transition-opacity"></div>
              
              <div className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-violet-50 to-purple-50 mb-4 shadow-sm border border-violet-100 group-hover:border-violet-200 transition-colors">
                  <FileText className="h-7 w-7 text-violet-600 group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-violet-700 transition-colors">Templates</h4>
                <p className="text-gray-500 text-sm mb-5">Create or modify email templates for campaigns.</p>
                <Button variant="outline" className="w-full group-hover:border-violet-300 group-hover:text-violet-700 transition-colors" asChild>
                  <Link href="/templates" className="flex items-center justify-center">
                    <Edit className="h-4 w-4 mr-2 group-hover:rotate-6 transition-transform" />
                    View Templates
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-none bg-gradient-to-br from-white to-gray-50 h-full group">
            <CardContent className="p-0">
              <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-br from-amber-500/20 to-yellow-400/10 rounded-bl-full opacity-40 transform translate-x-4 -translate-y-4 group-hover:opacity-60 transition-opacity"></div>
              
              <div className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 mb-4 shadow-sm border border-amber-100 group-hover:border-amber-200 transition-colors">
                  <LineChart className="h-7 w-7 text-amber-600 group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">Reports</h4>
                <p className="text-gray-500 text-sm mb-5">View detailed analytics and campaign reports.</p>
                <Button variant="outline" className="w-full group-hover:border-amber-300 group-hover:text-amber-700 transition-colors" asChild>
                  <Link href="/analytics" className="flex items-center justify-center">
                    <BarChart className="h-4 w-4 mr-2 group-hover:translate-y-[-2px] transition-transform" />
                    View Reports
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <div className="mt-8 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 rounded-lg border border-indigo-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg shadow-md flex items-center justify-center mr-4">
              <Split className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">A/B Testing Available</h3>
              <p className="text-sm text-gray-600">Test different email variations to maximize your campaign performance.</p>
            </div>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md min-w-[140px]">
            <span>Start Testing</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
