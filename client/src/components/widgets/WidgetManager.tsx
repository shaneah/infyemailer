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
      // Let's do a more aggressive approach
      localStorage.removeItem('dashboard-widgets');
      // Force a page reload after clearing localStorage
      window.location.reload();
    } catch (error) {
      console.error('Error resetting layout:', error);
      alert('Failed to reset layout. Please try refreshing the page.');
    }
  };

  const addAIWidgets = () => {
    if (!visibleWidgetTypes.includes('aiRecommendations')) {
      addWidget('aiRecommendations');
    }
    if (!visibleWidgetTypes.includes('campaignPerformanceAnalyzer')) {
      addWidget('campaignPerformanceAnalyzer');
    }
    if (!visibleWidgetTypes.includes('userJourney')) {
      addWidget('userJourney');
    }
    // Show success message
    alert('Advanced AI widgets have been added to your dashboard!');
  };

  return (
    <>
      <div className="flex gap-2">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-blue-700 border-slate-200 hover:border-blue-200 hover:bg-blue-50 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Widget</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-blue-900">Add Widget</DialogTitle>
              <DialogDescription>
                Select a widget to add to your dashboard.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Label htmlFor="widget-type" className="block mb-2 text-blue-800">Widget Type</Label>
              <Select value={selectedWidget} onValueChange={(value) => setSelectedWidget(value as WidgetType)}>
                <SelectTrigger id="widget-type" className="border-slate-200 focus:ring-blue-500">
                  <SelectValue placeholder="Select Widget Type" />
                </SelectTrigger>
                <SelectContent>
                  {availableWidgetOptions.length === 0 ? (
                    <SelectItem value="none" disabled>All widgets are already displayed</SelectItem>
                  ) : (
                    availableWidgetOptions.filter(type => 
                      !type.toLowerCase().includes('ai') && 
                      !type.includes('recommendations')
                    ).map((type) => (
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
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddWidget} 
                disabled={!selectedWidget}
                className="bg-blue-800 hover:bg-blue-900 text-white shadow-sm"
              >
                Add Widget
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          size="sm"
          className="gap-1 text-blue-700 border-slate-200 hover:border-blue-200 hover:bg-blue-50 shadow-sm"
          onClick={handleResetLayout}
        >
          <Undo2 className="h-4 w-4" />
          <span>Reset Layout</span>
        </Button>
      </div>
    </>
  );
};

export default WidgetManager;