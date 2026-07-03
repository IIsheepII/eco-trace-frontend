import { z } from 'zod';

const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;

export const uploadDocumentSchema = z.object({
  title: z.string().min(1, 'Enter a document title'),
  documentTypeId: z.string().min(1, 'Choose a document type'),
  file: z
    .custom<FileList>()
    .refine((files) => files && files.length === 1, 'Upload one file')
    .refine(
      (files) =>
        Array.from(files ?? []).every((file) =>
          ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff', 'image/webp'].includes(file.type),
        ),
      'Only PDF, JPG, PNG, TIFF or WEBP files are supported',
    )
    .refine(
      (files) => Array.from(files ?? []).every((file) => file.size <= MAX_UPLOAD_SIZE_BYTES),
      'Files must be 20 MB or smaller',
    ),
});

export const fieldValidationSchema = z.object({
  fields: z.array(
    z.object({
      fieldDefinitionId: z.string(),
      extractedFieldId: z.string().optional(),
      finalValue: z.string().min(1, 'Enter a validated value'),
    }),
  ),
  notes: z.string().optional(),
});

export type UploadDocumentFormValues = z.infer<typeof uploadDocumentSchema>;
export type FieldValidationFormValues = z.infer<typeof fieldValidationSchema>;
