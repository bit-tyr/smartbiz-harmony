import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { TravelRequestFormValues } from "../schemas/travelRequestSchema";

interface LaboratoryProjectSectionProps {
  form: UseFormReturn<TravelRequestFormValues>;
}

export const LaboratoryProjectSection = ({ form }: LaboratoryProjectSectionProps) => {
  const { data: laboratories } = useQuery({
    queryKey: ['laboratories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('laboratories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: projects } = useQuery({
    queryKey: ['projects', form.watch('laboratoryId')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('laboratory_id', form.watch('laboratoryId'))
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!form.watch('laboratoryId'),
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="laboratoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Laboratorio</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un laboratorio" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {laboratories?.map((lab) => (
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
        name="projectId"
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
                {projects?.map((project) => (
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
  );
};