import React, { useState } from 'react';
import BaseWidget from './BaseWidget';
import { Calendar, Clock, Settings } from 'lucide-react';
import { Widget } from '@/hooks/useWidgets';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface OptimalSendTimeWidgetProps {
  widget: Widget;
  onRemove: (id: string) => void;
  onConfig: (config: any) => void;
}

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const timeSlots = [
  '8am - 10am', '10am - 12pm', '12pm - 2pm', '2pm - 4pm', 
  '4pm - 6pm', '6pm - 8pm', '8pm - 10pm'
];

const OptimalSendTimeWidget: React.FC<OptimalSendTimeWidgetProps> = ({ 
  widget, 
  onRemove,
  onConfig 
}) => {
  const config = widget.config || {
    timezone: 'America/New_York',
    audience: 'Business',
    optimizedDay: 'Tuesday',
    optimizedTime: '10am - 12pm',
    engagementScore: 87
  };
  
  const [configOpen, setConfigOpen] = useState(false);
  const [audienceType, setAudienceType] = useState(config.audience);
  
  const handleSaveConfig = () => {
    onConfig({
      ...config,
      audience: audienceType
    });
    setConfigOpen(false);
  };

  // Get heat level for each day and time combination (would be from real data in production)
  const getHeatLevel = (day: string, time: string) => {
    if (day === config.optimizedDay && time === config.optimizedTime) {
      return 'bg-green-500'; // Best time
    }
    
    // Generate predictable "heat" levels
    const dayIndex = daysOfWeek.indexOf(day);
    const timeIndex = timeSlots.indexOf(time);
    
    const sum = dayIndex + timeIndex;
    
    if (sum % 8 === 0 || sum % 7 === 0) return 'bg-red-200'; // Very poor
    if (sum % 6 === 0) return 'bg-orange-200'; // Poor
    if (sum % 5 === 0) return 'bg-yellow-200'; // Fair
    if (sum % 4 === 0) return 'bg-lime-200'; // Good
    if (sum % 3 === 0) return 'bg-green-200'; // Very good
    
    return 'bg-gray-100'; // Neutral
  };

  return (
    <BaseWidget 
      widget={widget} 
      onRemove={onRemove}
      showSettings={true}
      onConfig={() => setConfigOpen(true)}
      icon={<Clock className="h-4 w-4 text-white" />}
      className="col-span-1 md:col-span-2"
    >
      <div className="pt-2">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-purple-800">Optimal Send Times</h3>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span>Audience:</span>
            <span className="font-medium">{config.audience}</span>
          </div>
        </div>
        
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-slate-700">Best day to send: {config.optimizedDay}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-slate-700">Best time: {config.optimizedTime}</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Engagement score: <span className="font-medium text-green-600">{config.engagementScore}%</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-8 gap-1 mb-1">
              <div className="col-span-1"></div>
              {daysOfWeek.map(day => (
                <div 
                  key={day} 
                  className="col-span-1 text-center text-xs font-medium text-slate-600 py-1"
                >
                  {day.slice(0, 3)}
                </div>
              ))}
            </div>
            
            {timeSlots.map(time => (
              <div key={time} className="grid grid-cols-8 gap-1 mb-1">
                <div className="col-span-1 text-xs text-slate-600 flex items-center">
                  {time}
                </div>
                {daysOfWeek.map(day => (
                  <div 
                    key={`${day}-${time}`} 
                    className={`col-span-1 h-6 rounded-sm ${getHeatLevel(day, time)} relative ${
                      day === config.optimizedDay && time === config.optimizedTime 
                        ? 'ring-2 ring-green-500 ring-offset-1' 
                        : ''
                    }`}
                  >
                    {day === config.optimizedDay && time === config.optimizedTime && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-green-700"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-xs text-slate-500 mt-2">
          Times shown in {config.timezone}
        </div>
      </div>

      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Optimal Send Times</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="audience-type">Audience Type</Label>
                <RadioGroup 
                  id="audience-type" 
                  value={audienceType} 
                  onValueChange={setAudienceType}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Business" id="business" />
                    <Label htmlFor="business">Business (B2B)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Consumer" id="consumer" />
                    <Label htmlFor="consumer">Consumer (B2C)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Mixed" id="mixed" />
                    <Label htmlFor="mixed">Mixed</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveConfig}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BaseWidget>
  );
};

export default OptimalSendTimeWidget;