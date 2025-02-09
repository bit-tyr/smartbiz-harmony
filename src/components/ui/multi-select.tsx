import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';
import { Badge } from './badge';

export interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  id?: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  id,
  options,
  value,
  onChange,
  placeholder = 'Seleccionar items...',
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedLabels = value.map(v => 
    options.find(opt => opt.value === v)?.label || v
  );

  const handleSelect = React.useCallback((currentValue: string) => {
    const newValue = value.includes(currentValue)
      ? value.filter(v => v !== currentValue)
      : [...value, currentValue];
    
    console.log('Seleccionando:', currentValue, 'Nuevo valor:', newValue);
    onChange(newValue);
  }, [value, onChange]);

  const handleRemove = React.useCallback((label: string) => {
    const newValue = value.filter(v => 
      options.find(opt => opt.value === v)?.label !== label
    );
    console.log('Removiendo:', label, 'Nuevo valor:', newValue);
    onChange(newValue);
  }, [value, options, onChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          <div className="flex gap-1 flex-wrap">
            {selectedLabels.length > 0 ? (
              selectedLabels.map(label => (
                <Badge
                  key={label}
                  variant="secondary"
                  className="mr-1 mb-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(label);
                  }}
                >
                  {label}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar..." />
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={(currentValue) => {
                  handleSelect(option.value);
                }}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2" onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(option.value);
                }}>
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value.includes(option.value) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.label}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 