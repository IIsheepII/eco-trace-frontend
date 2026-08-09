import { Download, Save } from '@mui/icons-material';
import { Alert, Box, Button, Divider, Grid, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { AppDataTable } from '../../components/AppDataTable';
import { evaluationService } from '../../services/evaluationService';
import type { EvaluationActivity, EvaluationMeasurementInput, EvaluationSummary } from '../../types/domain';

type EvaluationSummaryRow = EvaluationSummary & { id: string };

const initial: EvaluationMeasurementInput = { measurementCode:'', manifestCode:'', measuredAt:new Date().toISOString().slice(0,16), measurerCode:'', moment:'PRETEST', activity:'REGISTRATION', status:'INCOMPLETE', observation:'' };
const labels: Record<EvaluationActivity,string> = { REGISTRATION:'Registro', SEARCH:'Búsqueda', TRANSCRIPTION:'Transcripción', OCR_EXTRACTION:'Extracción OCR/IA', REPORT_GENERATION:'Generación de reporte' };
const numberKeys = ['totalFields','fieldsWithError','omittedFields','correctedFields','finalErrors','correctWithoutCorrection'] as const;

export function EvaluationPage() {
  const [form,setForm]=useState(initial); const qc=useQueryClient();
  const summary=useQuery({queryKey:['evaluations','summary'],queryFn:evaluationService.summary});
  const save=useMutation({mutationFn:evaluationService.save,onSuccess:()=>{qc.invalidateQueries({queryKey:['evaluations']});setForm(initial);}});
  const timed=['REGISTRATION','SEARCH','REPORT_GENERATION'].includes(form.activity);
  const codeHint=form.activity==='SEARCH'?'Q001':form.activity==='REPORT_GENERATION'?'R001':'M001';
  const set=(key:keyof EvaluationMeasurementInput,value:unknown)=>setForm((old)=>({...old,[key]:value}));
  const submit=(event:FormEvent)=>{event.preventDefault(); const payload={...form,measurementCode:form.measurementCode.toUpperCase(),manifestCode:form.manifestCode?.toUpperCase()||undefined,measuredAt:new Date(form.measuredAt).toISOString(),startedAt:form.startedAt?new Date(form.startedAt).toISOString():undefined,finishedAt:form.finishedAt?new Date(form.finishedAt).toISOString():undefined}; save.mutate(payload);};

  return <Box sx={{p:{xs:2,md:4},maxWidth:1400,mx:'auto'}}>
    <Stack direction={{xs:'column',sm:'row'}} justifyContent="space-between" gap={2} mb={3}>
      <Box><Typography variant="h2">Evaluación preexperimental O1 X O2</Typography><Typography color="text.secondary">Ficha de observación y medición del proceso de gestión de manifiestos.</Typography></Box>
      <Button variant="outlined" startIcon={<Download/>} onClick={()=>evaluationService.exportWorkbook()}>Exportar Excel</Button>
    </Stack>
    <Alert severity="info" sx={{mb:3}}>Registra el inicio cuando comienza la tarea y el fin cuando queda guardada y validada. Los tiempos de backend y OCR no se usan como tiempo total.</Alert>
    <Grid container spacing={3}>
      <Grid size={{xs:12,lg:7}}><Paper component="form" onSubmit={submit} sx={{p:3}}><Typography variant="h3" mb={2}>Nueva medición</Typography>
        {save.isError&&<Alert severity="error" sx={{mb:2}}>{save.error.message}</Alert>}
        <Grid container spacing={2}>
          <Grid size={{xs:12,sm:4}}><TextField fullWidth select label="Actividad" value={form.activity} onChange={(e)=>set('activity',e.target.value)}>{Object.entries(labels).map(([v,l])=><MenuItem key={v} value={v}>{l}</MenuItem>)}</TextField></Grid>
          <Grid size={{xs:12,sm:4}}><TextField fullWidth select label="Momento" value={form.moment} onChange={(e)=>set('moment',e.target.value)}><MenuItem value="PRETEST">Pretest / manual</MenuItem><MenuItem value="POSTTEST">Postest / plataforma</MenuItem></TextField></Grid>
          <Grid size={{xs:12,sm:4}}><TextField fullWidth select label="Estado" value={form.status} onChange={(e)=>set('status',e.target.value)}><MenuItem value="COMPLETE">Completo</MenuItem><MenuItem value="INCOMPLETE">Incompleto</MenuItem><MenuItem value="UNAVAILABLE">No disponible</MenuItem></TextField></Grid>
          <Grid size={{xs:12,sm:4}}><TextField required fullWidth label="Código de medición" placeholder={codeHint} value={form.measurementCode} onChange={(e)=>set('measurementCode',e.target.value)}/></Grid>
          <Grid size={{xs:12,sm:4}}><TextField fullWidth label="Manifiesto asociado" placeholder="M001" value={form.manifestCode} onChange={(e)=>set('manifestCode',e.target.value)}/></Grid>
          <Grid size={{xs:12,sm:4}}><TextField required fullWidth label="Responsable anonimizado" placeholder="E001" value={form.measurerCode} onChange={(e)=>set('measurerCode',e.target.value)}/></Grid>
          <Grid size={{xs:12,sm:6}}><TextField required fullWidth type="datetime-local" label="Fecha de medición" slotProps={{inputLabel:{shrink:true}}} value={form.measuredAt} onChange={(e)=>set('measuredAt',e.target.value)}/></Grid>
          {timed&&<><Grid size={{xs:12,sm:6}}><TextField fullWidth type="datetime-local" label="Inicio de tarea" slotProps={{inputLabel:{shrink:true}}} value={form.startedAt??''} onChange={(e)=>set('startedAt',e.target.value)}/></Grid><Grid size={{xs:12,sm:6}}><TextField fullWidth type="datetime-local" label="Fin de tarea" slotProps={{inputLabel:{shrink:true}}} value={form.finishedAt??''} onChange={(e)=>set('finishedAt',e.target.value)}/></Grid></>}
          {form.activity==='SEARCH'&&<><Grid size={{xs:12,sm:6}}><TextField fullWidth label="Dato buscado" value={form.searchedData??''} onChange={(e)=>set('searchedData',e.target.value)}/></Grid><Grid size={{xs:12,sm:6}}><TextField fullWidth select label="Resultado encontrado" value={String(form.resultFound??'')} onChange={(e)=>set('resultFound',e.target.value==='true')}><MenuItem value="">No disponible</MenuItem><MenuItem value="true">Sí</MenuItem><MenuItem value="false">No</MenuItem></TextField></Grid></>}
          {['TRANSCRIPTION','OCR_EXTRACTION'].includes(form.activity)&&numberKeys.map((key)=><Grid key={key} size={{xs:12,sm:4}}><TextField fullWidth type="number" label={({totalFields:'Total de campos',fieldsWithError:'Campos con error',omittedFields:'Campos omitidos',correctedFields:'Campos corregidos',finalErrors:'Errores finales',correctWithoutCorrection:'Correctos sin corrección'} as const)[key]} value={form[key]??''} onChange={(e)=>set(key,e.target.value===''?undefined:Number(e.target.value))}/></Grid>)}
          {form.activity==='TRANSCRIPTION'&&<Grid size={{xs:12}}><TextField fullWidth label="Tipos de error (separados por coma)" onChange={(e)=>set('errorTypes',e.target.value.split(',').map(x=>x.trim()).filter(Boolean))}/></Grid>}
          {form.activity==='OCR_EXTRACTION'&&<Grid size={{xs:12}}><TextField fullWidth label="Calidad observable (separada por coma)" onChange={(e)=>set('qualityTags',e.target.value.split(',').map(x=>x.trim()).filter(Boolean))}/></Grid>}
          {form.activity==='REPORT_GENERATION'&&<><Grid size={{xs:12,sm:6}}><TextField fullWidth label="Tipo de reporte" value={form.reportType??''} onChange={(e)=>set('reportType',e.target.value)}/></Grid><Grid size={{xs:12,sm:6}}><TextField fullWidth label="Manifiesto o rango" value={form.reportScope??''} onChange={(e)=>set('reportScope',e.target.value)}/></Grid></>}
          <Grid size={{xs:12}}><TextField fullWidth multiline minRows={2} label="Observación" value={form.observation} onChange={(e)=>set('observation',e.target.value)}/></Grid>
        </Grid><Divider sx={{my:2}}/><Button type="submit" variant="contained" startIcon={<Save/>} disabled={save.isPending}>Guardar medición</Button>
      </Paper></Grid>
      <Grid size={{xs:12,lg:5}}><Paper sx={{p:3}}><Typography variant="h3" mb={2}>Validez para hipótesis</Typography><AppDataTable<EvaluationSummaryRow> rows={(summary.data??[]).map((row)=>({...row,id:row.activity}))} emptyLabel={summary.isLoading?'Calculando resumen':'Sin mediciones'} columns={[{key:'objective',header:'Objetivo',render:r=>r.objective},{key:'validPairs',header:'Pares',render:r=>r.validPairs},{key:'complete',header:'Completo',render:r=>r.complete?'Sí':'No'},{key:'suggestedTest',header:'Prueba',render:r=>r.suggestedTest}]}/></Paper></Grid>
    </Grid>
  </Box>;
}
