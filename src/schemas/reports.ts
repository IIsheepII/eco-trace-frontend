import { z } from 'zod';

export const reportSchema = z.object({
  title: z.string().min(1, 'El título del reporte es obligatorio'),
  documentId: z.string().optional(),
  format: z.enum(['PDF', 'XLSX']),
});

export type ReportFormValues = z.infer<typeof reportSchema>;
