import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { travelService } from '@/services/travelService';
import { supabase } from '@/integrations/supabase/client';
import { type TravelExpenseType, type TravelRequestFormValues, type TravelRequestStatus } from '@/types/travel';
import type { Database } from '@/types/supabase';

interface Laboratory {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  laboratory_id?: string;
}

const expenseTypes: { value: TravelExpenseType; label: string }[] = [
  { value: 'pasaje_aereo', label: 'Pasaje Aéreo' },
  { value: 'alojamiento', label: 'Alojamiento' },
  { value: 'viaticos', label: 'Viáticos' },
  { value: 'transporte_local', label: 'Transporte Local' },
  { value: 'otros', label: 'Otros' },
];

const formSchema = z.object({
  laboratory_id: z.string({
    required_error: 'Por favor seleccione un laboratorio',
  }),
  project_id: z.string().optional(),
  destination: z.string({
    required_error: 'Por favor ingrese el destino',
  }),
  departure_date: z.date({
    required_error: 'Por favor seleccione la fecha de salida',
  }),
  return_date: z.date({
    required_error: 'Por favor seleccione la fecha de regreso',
  }),
  purpose: z.string({
    required_error: 'Por favor ingrese el propósito del viaje',
  }),
  expenses: z.array(z.object({
    expense_type: z.enum(['pasaje_aereo', 'alojamiento', 'viaticos', 'transporte_local', 'otros'], {
      required_error: 'Por favor seleccione un tipo de gasto',
    }),
    description: z.string({
      required_error: 'Por favor ingrese una descripción',
    }),
    estimated_amount: z.number({
      required_error: 'Por favor ingrese un monto estimado',
    }),
    currency: z.string({
      required_error: 'Por favor seleccione una moneda',
    }),
  })).min(1, 'Debe agregar al menos un gasto'),
  files: z.array(z.instanceof(File)).optional(),
});

interface TravelRequestFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function TravelRequestForm({ onClose, onSuccess }: TravelRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchLaboratories = async () => {
      const { data, error } = await supabase
        .from('laboratories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error al cargar laboratorios:', error);
        return;
      }
      
      setLaboratories(data);
    };

    fetchLaboratories();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*');
      
      if (error) {
        console.error('Error al cargar proyectos:', error);
        return;
      }
      
      setProjects(data || []);
    };

    fetchProjects();
  }, []);

  const form = useForm<TravelRequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      laboratory_id: '',
      project_id: '',
      destination: '',
      departure_date: undefined,
      return_date: undefined,
      purpose: '',
      expenses: [{
        expense_type: 'pasaje_aereo',
        description: '',
        estimated_amount: 0,
        currency: 'USD',
      }],
      files: []
    },
  });

  const onSubmit = async (values: TravelRequestFormValues) => {
    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No hay sesión de usuario');
      }

      if (!values.laboratory_id) {
        throw new Error('Debe seleccionar un laboratorio');
      }

      const status: TravelRequestStatus = 'pendiente';
      const travelRequest = {
        ...values,
        user_id: user.id,
        status,
        departure_date: values.departure_date.toISOString(),
        return_date: values.return_date.toISOString(),
        total_estimated_budget: values.expenses.reduce((total, expense) => total + expense.estimated_amount, 0),
        currency: values.expenses[0]?.currency || 'USD',
        expenses: values.expenses,
        files: selectedFiles
      };

      console.log('Travel request data:', travelRequest);
      await travelService.createTravelRequest(travelRequest);
      onSuccess();
    } catch (error) {
      console.error('Error al crear la solicitud:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Solicitud de Viaje</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="laboratory_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Laboratorio</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un laboratorio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {laboratories.map((lab) => (
                          <SelectItem key={lab.id} value={lab.id}>
                            {lab.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="project_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proyecto (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un proyecto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destino</FormLabel>
                  <FormControl>
                    <Input placeholder="Ciudad, País" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departure_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Salida</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccione una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="return_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Regreso</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccione una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < form.getValues("departure_date")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Propósito del Viaje</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa el propósito del viaje"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel>Gastos Estimados</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const expenses = form.getValues("expenses");
                    form.setValue("expenses", [
                      ...expenses,
                      {
                        expense_type: 'pasaje_aereo',
                        description: '',
                        estimated_amount: 0,
                        currency: 'USD',
                      },
                    ]);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Gasto
                </Button>
              </div>

              {form.watch("expenses").map((_, index) => (
                <div key={index} className="grid grid-cols-12 gap-4">
                  <FormField
                    control={form.control}
                    name={`expenses.${index}.expense_type`}
                    render={({ field }) => (
                      <FormItem className="col-span-3">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {expenseTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`expenses.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="col-span-4">
                        <FormControl>
                          <Input placeholder="Descripción" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`expenses.${index}.estimated_amount`}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Monto"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                              field.onChange(value);
                            }}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`expenses.${index}.currency`}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Moneda" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD - Dólares Americanos</SelectItem>
                            <SelectItem value="UYU">UYU - Pesos Uruguayos</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="col-span-1"
                    onClick={() => {
                      const expenses = form.getValues("expenses");
                      if (expenses.length > 1) {
                        form.setValue(
                          "expenses",
                          expenses.filter((_, i) => i !== index)
                        );
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div>
              <FormLabel>Archivos Adjuntos</FormLabel>
              <Input
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 