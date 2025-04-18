import React, { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, Undo2, Sparkles, Lightbulb, Brain } from 'lucide-react';
import { 
  WidgetType, useWidgets, availableWidgets, widgetTitles 
} from '@/hooks/useWidgets';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import WidgetRecommendations from './WidgetRecommendations';

interface WidgetManagerProps {
  clientData?: any;
}

const WidgetManager: React.FC<WidgetManagerProps> = ({ clientData = null }) => {
  const { widgets, addWidget, resetToDefault } = useWidgets();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<WidgetType | ''>('');

  // Filter out already visible widgets
  const visibleWidgetTypes = widgets.filter(w => w.visible).map(w => w.type);
  const availableWidgetOptions = availableWidgets.filter(type => !visibleWidgetTypes.includes(type));

  const handleAddWidget = () => {
    if (selectedWidget) {
      addWidget(selectedWidget as WidgetType);
      setSelectedWidget('');
      setDialogOpen(false);
    }
  };

  const handleResetLayout = () => {
    try {
      // Use the resetToDefault function which handles both local and server storage
      resetToDefault();
      
      // Show success message using toast
      toast({
        title: "Dashboard reset",
        description: "Your dashboard layout has been reset to default.",
      });
    } catch (error) {
      console.error('Error resetting layout:', error);
      toast({
        title: "Reset failed",
        description: "Failed to reset dashboard layout. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addAIWidgets = () => {
    let widgetsAdded = 0;
    
    if (!visibleWidgetTypes.includes('aiRecommendations')) {
      addWidget('aiRecommendations');
      widgetsAdded++;
    }
    if (!visibleWidgetTypes.includes('campaignPerformanceAnalyzer')) {
      addWidget('campaignPerformanceAnalyzer');
      widgetsAdded++;
    }
    if (!visibleWidgetTypes.includes('userJourney')) {
      addWidget('userJourney');
      widgetsAdded++;
    }
    
    // Show success message using toast
    if (widgetsAdded > 0) {
      toast({
        title: "AI Widgets Added",
        description: `${widgetsAdded} advanced AI ${widgetsAdded === 1 ? 'widget has' : 'widgets have'} been added to your dashboard.`,
      });
    } else {
      toast({
        title: "No New Widgets",
        description: "All AI widgets are already on your dashboard.",
        variant: "default"
      });
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1 text-[#d4af37] border-[#d4af37]/30 hover:border-[#d4af37]/50 hover:bg-[#d4af37]/10 bg-[#0a1929]/50"
          onClick={() => setRecommendationsOpen(true)}
        >
          <Lightbulb className="h-4 w-4" />
          <span>Get Recommendations</span>
        </Button>
        
        <Button
          variant="default"
          size="sm"
          className="gap-1 bg-[#d4af37] hover:bg-[#d4af37]/80 text-[#0a1929]"
          onClick={addAIWidgets}
        >
          <Brain className="h-4 w-4" />
          <span>Add AI Widgets</span>
        </Button>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-[#d4af37] border-[#d4af37]/30 hover:border-[#d4af37]/50 hover:bg-[#d4af37]/10 bg-[#0a1929]/50"
            >
              <Plus className="h-4 w-4" />
              <span>Add Widget</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Widget</DialogTitle>
              <DialogDescription>
                Select a widget to add to your dashboard.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Label htmlFor="widget-type" className="block mb-2">Widget Type</Label>
              <Select value={selectedWidget} onValueChange={(value) => setSelectedWidget(value as WidgetType)}>
                <SelectTrigger id="widget-type">
                  <SelectValue placeholder="Select Widget Type" />
                </SelectTrigger>
                <SelectContent>
                  {availableWidgetOptions.length === 0 ? (
                    <SelectItem value="none" disabled>All widgets are already displayed</SelectItem>
                  ) : (
                    availableWidgetOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {widgetTitles[type]}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button 
                variant="ghost" 
                onClick={() => setDialogOpen(false)}
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddWidget} 
                disabled={!selectedWidget}
                className="bg-[#d4af37] hover:bg-[#d4af37]/80 text-[#0a1929]"
              >
                Add Widget
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          size="sm"
          className="gap-1 text-[#d4af37] border-[#d4af37]/30 hover:border-[#d4af37]/50 hover:bg-[#d4af37]/10 bg-[#0a1929]/50"
          onClick={handleResetLayout}
        >
          <Undo2 className="h-4 w-4" />
          <span>Reset Layout</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="gap-1 text-[#d4af37] border-[#d4af37]/30 hover:border-[#d4af37]/50 hover:bg-[#d4af37]/10 bg-[#0a1929]/50"
          onClick={() => {/* Open layout editor */}}
        >
          <LayoutGrid className="h-4 w-4" />
          <span>Edit Layout</span>
        </Button>
      </div>

      {/* Widget Recommendations Dialog */}
      <WidgetRecommendations 
        clientData={clientData}
        open={recommendationsOpen}
        onOpenChange={setRecommendationsOpen}
      />
    </>
  );
};

export default WidgetManager;