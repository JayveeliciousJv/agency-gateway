import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface KioskProgressProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

const KioskProgress = ({ currentStep, totalSteps, labels }: KioskProgressProps) => {
  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="flex items-center justify-between">
        {labels.map((label, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          return (
            <div key={i} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {i > 0 && (
                  <div className={cn(
                    'h-0.5 flex-1 transition-colors duration-300',
                    isCompleted || isActive ? 'bg-primary' : 'bg-border'
                  )} />
                )}
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shrink-0',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isActive && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                  !isCompleted && !isActive && 'bg-muted text-muted-foreground border border-border'
                )}>
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                {i < totalSteps - 1 && (
                  <div className={cn(
                    'h-0.5 flex-1 transition-colors duration-300',
                    isCompleted ? 'bg-primary' : 'bg-border'
                  )} />
                )}
              </div>
              <span className={cn(
                'text-[10px] mt-1.5 text-center leading-tight',
                isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
              )}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KioskProgress;
