import { supabase } from '@/integrations/supabase/client';
import type { TravelRequest, TravelRequestFormValues } from '@/types/travel';

export const travelService = {
  async createTravelRequest(data: Omit<TravelRequest, 'id' | 'created_at' | 'updated_at'> & { expenses: TravelRequestFormValues['expenses'], files?: File[] }) {
    try {
      // Primero creamos la solicitud de viaje
      const { data: travelRequest, error: travelError } = await supabase
        .from('travel_requests')
        .insert({
          user_id: data.user_id,
          laboratory_id: data.laboratory_id,
          project_id: data.project_id || null,
          destination: data.destination,
          departure_date: data.departure_date,
          return_date: data.return_date,
          purpose: data.purpose,
          status: data.status,
          total_estimated_budget: data.total_estimated_budget,
          currency: data.currency
        })
        .select()
        .single();

      if (travelError) throw travelError;

      // Luego creamos los gastos asociados
      const { error: expensesError } = await supabase
        .from('travel_expenses')
        .insert(
          data.expenses.map(expense => ({
            travel_request_id: travelRequest.id,
            expense_type: expense.expense_type,
            description: expense.description,
            estimated_amount: expense.estimated_amount,
            currency: expense.currency
          }))
        );

      if (expensesError) throw expensesError;

      // Subir archivos si existen
      if (data.files && data.files.length > 0) {
        for (const file of data.files) {
          const filePath = `${travelRequest.id}/${file.name}`;
          
          // Subir archivo al bucket
          const { error: uploadError } = await supabase.storage
            .from('travel-attachments')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Error al subir archivo:', uploadError);
            continue;
          }

          // Crear registro en travel_attachments
          const { error: attachmentError } = await supabase
            .from('travel_attachments')
            .insert({
              travel_request_id: travelRequest.id,
              file_name: file.name,
              file_path: filePath,
              file_type: file.type,
              file_size: file.size
            });

          if (attachmentError) {
            console.error('Error al registrar archivo:', attachmentError);
          }
        }
      }

      return travelRequest;
    } catch (error) {
      console.error('Error al crear la solicitud:', error);
      throw error;
    }
  },

  async approveTravelRequest(requestId: string, notes?: string): Promise<TravelRequest> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('No hay sesión de usuario');

    const { data, error } = await supabase
      .rpc('approve_travel_request', {
        request_id: requestId,
        approver_id: session.user.id,
        notes: notes
      });

    if (error) throw error;
    return data as unknown as TravelRequest;
  },

  async rejectTravelRequest(requestId: string, notes: string): Promise<void> {
    const { error } = await supabase
      .from('travel_requests')
      .update({
        status: 'rechazado',
        manager_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) throw error;
  },

  async getAttachmentUrl(filePath: string): Promise<string> {
    const { data } = await supabase.storage
      .from('travel-attachments')
      .createSignedUrl(filePath, 3600);

    if (!data?.signedUrl) throw new Error('No se pudo obtener la URL del archivo');
    return data.signedUrl;
  }
}; 