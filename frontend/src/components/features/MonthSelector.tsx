import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { Button } from '@/components/ui/Button';

export interface MonthSelectorProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  className?: string;
}

export function MonthSelector({
  selectedDate,
  onChange,
  className,
}: MonthSelectorProps) {
  const handlePrevious = () => {
    onChange(subMonths(selectedDate, 1));
  };

  const handleNext = () => {
    onChange(addMonths(selectedDate, 1));
  };

  const handleToday = () => {
    onChange(new Date());
  };

  const isCurrentMonth =
    format(selectedDate, 'yyyy-MM') === format(new Date(), 'yyyy-MM');

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          icon={<ChevronLeft size={16} />}
          onClick={handlePrevious}
          aria-label="Previous month"
        />

        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {format(selectedDate, 'MMMM yyyy')}
          </h2>
          {!isCurrentMonth && (
            <Button variant="ghost" size="sm" onClick={handleToday}>
              Today
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          icon={<ChevronRight size={16} />}
          onClick={handleNext}
          aria-label="Next month"
        />
      </div>
    </div>
  );
}
