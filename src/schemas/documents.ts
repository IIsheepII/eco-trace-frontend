import { z } from 'zod';

const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;

export const uploadDocumentSchema = z.object({
  title: z.string().min(1, 'Ingresa un título para el documento'),
  documentTypeId: z.string().min(1, 'Elige un tipo de documento'),
  file: z
    .custom<FileList>()
    .refine((files) => files && files.length === 1, 'Sube un archivo')
    .refine(
      (files) =>
        Array.from(files ?? []).every((file) =>
          ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff', 'image/webp'].includes(file.type),
        ),
      'Solo se admiten archivos PDF, JPG, PNG, TIFF o WEBP',
    )
    .refine(
      (files) => Array.from(files ?? []).every((file) => file.size <= MAX_UPLOAD_SIZE_BYTES),
      'Los archivos deben pesar 20 MB o menos',
    ),
});

export const fieldValidationSchema = z.object({
  fields: z.array(
    z.object({
      fieldDefinitionId: z.string(),
      extractedFieldId: z.string().optional(),
      finalValue: z.string().min(1, 'Ingresa un valor validado'),
    }),
  ),
  notes: z.string().optional(),
});

export type UploadDocumentFormValues = z.infer<typeof uploadDocumentSchema>;
export type FieldValidationFormValues = z.infer<typeof fieldValidationSchema>;
