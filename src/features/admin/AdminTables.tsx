import { Box, Card, CardContent, Grid, Switch, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { AppDataTable } from '../../components/AppDataTable';
import { ErrorState, LoadingState } from '../../components/StateView';
import { adminService } from '../../services/adminService';
import type { AdminUser } from '../../types/domain';

export function UsersPage() {
  const query = useQuery({ queryKey: ['admin', 'users'], queryFn: adminService.users });
  if (query.isLoading) return <LoadingState label="Loading users" />;
  if (query.isError) return <ErrorState message="Unable to load users" onRetry={() => query.refetch()} />;
  return (
    <Page title="Users & Roles" subtitle="Manage user access and role assignments.">
      <AppDataTable<AdminUser>
        rows={query.data ?? []}
        emptyLabel="No users found"
        columns={[
          { key: 'name', header: 'Name', render: (row) => row.fullName },
          { key: 'email', header: 'Email', render: (row) => row.email },
          { key: 'role', header: 'Role', render: (row) => row.role.name },
        ]}
      />
    </Page>
  );
}

export function OrganisationsPage() {
  const query = useQuery({ queryKey: ['admin', 'organisations'], queryFn: adminService.organisations });
  if (query.isLoading) return <LoadingState label="Loading organisations" />;
  if (query.isError) return <ErrorState message="Unable to load organisations" onRetry={() => query.refetch()} />;
  return (
    <Page title="Organisations" subtitle="Multi-tenant organisation hierarchy and plans.">
      <AppDataTable
        rows={query.data ?? []}
        emptyLabel="No organisations found"
        columns={[
          { key: 'name', header: 'Name', render: (row) => row.name },
          { key: 'taxId', header: 'Tax ID', render: (row) => row.taxId ?? 'Not set' },
          { key: 'createdAt', header: 'Created', render: (row) => new Date(row.createdAt).toLocaleDateString() },
        ]}
      />
    </Page>
  );
}

export function DocumentTypesPage() {
  const query = useQuery({ queryKey: ['admin', 'document-types'], queryFn: adminService.documentTypes });
  if (query.isLoading) return <LoadingState label="Loading document types" />;
  if (query.isError) return <ErrorState message="Unable to load document types" onRetry={() => query.refetch()} />;
  return (
    <Page title="Document Types" subtitle="Configure extraction templates and field definitions.">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <AppDataTable
            rows={query.data ?? []}
            emptyLabel="No document types configured"
            columns={[
              { key: 'name', header: 'Name', render: (row) => row.name },
              { key: 'fields', header: 'Fields', render: (row) => row.fieldDefinitions.length },
              { key: 'active', header: 'Active', render: (row) => <Switch checked={row.isActive} inputProps={{ 'aria-label': `${row.name} active` }} /> },
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h3">Field configuration</Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Field definitions loaded from the backend document type configuration.
              </Typography>
              {(query.data ?? []).flatMap((type) => type.fieldDefinitions.map((field) => ({ ...field, typeName: type.name }))).map((field) => (
                <Box key={field.id} sx={{ py: 1.5, borderTop: 1, borderColor: 'divider' }}>
                  <Typography>{field.label}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {field.typeName} • {field.dataType} • {field.required ? 'Required' : 'Optional'}
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
