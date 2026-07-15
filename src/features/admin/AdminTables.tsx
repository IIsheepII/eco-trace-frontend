import { Box, Card, CardContent, Grid, Switch, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { AppDataTable } from '../../components/AppDataTable';
import { ErrorState, LoadingState } from '../../components/StateView';
import { adminService } from '../../services/adminService';
import type { AdminUser } from '../../types/domain';

export function UsersPage() {
  const query = useQuery({ queryKey: ['admin', 'users'], queryFn: adminService.users });
  if (query.isLoading) return <LoadingState label="Cargando usuarios" />;
  if (query.isError) return <ErrorState message="No se pudieron cargar los usuarios" onRetry={() => query.refetch()} />;
  return (
    <Page title="Usuarios y roles" subtitle="Gestiona accesos de usuarios y asignaciones de roles.">
      <AppDataTable<AdminUser>
        rows={query.data ?? []}
        emptyLabel="No se encontraron usuarios"
        columns={[
          { key: 'name', header: 'Nombre', render: (row) => row.fullName },
          { key: 'email', header: 'Correo', render: (row) => row.email },
          { key: 'role', header: 'Rol', render: (row) => row.role.name },
        ]}
      />
    </Page>
  );
}

export function OrganisationsPage() {
  const query = useQuery({ queryKey: ['admin', 'organisations'], queryFn: adminService.organisations });
  if (query.isLoading) return <LoadingState label="Cargando organizaciones" />;
  if (query.isError) return <ErrorState message="No se pudieron cargar las organizaciones" onRetry={() => query.refetch()} />;
  return (
    <Page title="Organizaciones" subtitle="Jerarquía de organizaciones multiempresa y planes.">
      <AppDataTable
        rows={query.data ?? []}
        emptyLabel="No se encontraron organizaciones"
        columns={[
          { key: 'name', header: 'Nombre', render: (row) => row.name },
          { key: 'taxId', header: 'RUC / ID fiscal', render: (row) => row.taxId ?? 'No definido' },
          { key: 'createdAt', header: 'Creado', render: (row) => new Date(row.createdAt).toLocaleDateString() },
        ]}
      />
    </Page>
  );
}

export function DocumentTypesPage() {
  const query = useQuery({ queryKey: ['admin', 'document-types'], queryFn: adminService.documentTypes });
  if (query.isLoading) return <LoadingState label="Cargando tipos de documento" />;
  if (query.isError) return <ErrorState message="No se pudieron cargar los tipos de documento" onRetry={() => query.refetch()} />;
  return (
    <Page title="Tipos de documento" subtitle="Configura plantillas de extracción y definiciones de campos.">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <AppDataTable
            rows={query.data ?? []}
            emptyLabel="No hay tipos de documento configurados"
            columns={[
              { key: 'name', header: 'Nombre', render: (row) => row.name },
              { key: 'fields', header: 'Campos', render: (row) => row.fieldDefinitions.length },
              { key: 'active', header: 'Activo', render: (row) => <Switch checked={row.isActive} inputProps={{ 'aria-label': `${row.name} activo` }} /> },
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h3">Configuración de campos</Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Definiciones cargadas desde la configuración de tipos de documento del backend.
              </Typography>
              {(query.data ?? []).flatMap((type) => type.fieldDefinitions.map((field) => ({ ...field, typeName: type.name }))).map((field) => (
                <Box key={field.id} sx={{ py: 1.5, borderTop: 1, borderColor: 'divider' }}>
                  <Typography>{field.label}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {field.typeName} • {field.dataType} • {field.required ? 'Requerido' : 'Opcional'}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Page>
  );
}

function Page({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h2">{title}</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {subtitle}
      </Typography>
      {children}
    </Box>
  );
}
