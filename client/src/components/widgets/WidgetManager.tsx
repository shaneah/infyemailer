import React, { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, Undo2 } from 'lucide-react';
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

const WidgetManager: React.FC = () => {
  const { widgets, addWidget, resetToDefault } = useWidgets();
  const [dialogOpen, setDialogOpen] = useState(false);
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

  return (
    <div className="flex gap-2">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-purple-600 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
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
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddWidget} 
              disabled={!selectedWidget}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Add Widget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        variant="outline"
        size="sm"
        className="gap-1 text-purple-600 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
        onClick={() => resetToDefault()}
      >
        <Undo2 className="h-4 w-4" />
        <span>Reset Layout</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="gap-1 text-purple-600 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
        onClick={() => {/* Open layout editor */}}
      >
        <LayoutGrid className="h-4 w-4" />
        <span>Edit Layout</span>
      </Button>
    </div>
  );
};

export default WidgetManager;