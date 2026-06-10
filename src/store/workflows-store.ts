import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────────────────────
//  Interfaces & Types
// ─────────────────────────────────────────────────────────────

export type WorkflowStage = "Pendiente" | "En Revisión" | "Aprobada" | "Rechazada" | "Cancelada";

export interface WorkflowTemplate {
  id: string;
  ticket_type_id: string;
  stage: WorkflowStage;
  notify_requester: boolean;
  notify_assignee: boolean;
  notify_unit_manager: boolean;
  notify_cc_recipients: boolean;
  email_subject: string;
  email_body: string;
  active: boolean;
}

export type RecipientType = "trabajador" | "jefatura" | "rrhh" | "seguridad" | "prevencion" | "ti" | "administracion" | "otro";

export interface ContractSetting {
  id: string;
  contract_id: string;
  ticket_type_id: string;
  primary_recipient_type: RecipientType;
  primary_recipient_id?: string; // ID del trabajador responsable específico
  primary_recipient_name?: string; // Nombre desnormalizado para simplificar UI
  sla_hours: number;
  enable_cc: boolean;
  active: boolean;
  notes?: string;
}

export interface CcRecipient {
  id: string;
  contract_id: string;
  ticket_type_id: string;
  recipient_type: RecipientType;
  recipient_id?: string;
  recipient_name?: string;
  label?: string;
  active: boolean;
}

export interface TicketType {
  id: string;
  tipo: string;
  name: string;
  description?: string;
  icon?: string;
  active: boolean;
}

export interface SentMailEntry {
  id: string;
  fecha: string;
  id_solicitud: string;
  codigo_solicitud: string;
  tipo_solicitud: string;
  stage: string;
  destinatarios: string[];
  asunto: string;
  cuerpo: string;
  exito: boolean;
}

interface WorkflowsState {
  ticketTypes: TicketType[];
  templates: WorkflowTemplate[];
  contractSettings: ContractSetting[];
  ccRecipients: CcRecipient[];
  sentMailLog: SentMailEntry[];
  
  fetchWorkflowsData: () => Promise<void>;
  saveTemplate: (template: Omit<WorkflowTemplate, "id"> & { id?: string }) => Promise<void>;
  saveContractSetting: (setting: Omit<ContractSetting, "id"> & { id?: string }) => Promise<void>;
  addCcRecipient: (cc: Omit<CcRecipient, "id">) => Promise<void>;
  removeCcRecipient: (id: string) => Promise<void>;
  updateContractManager: (contractId: string, managerId: string | null) => Promise<void>;
  
  // Despachador de notificaciones (Simulación)
  dispararNotificacion: (solicitud: any, stage: WorkflowStage, extraData?: {
    observaciones?: string;
    motivo_rechazo?: string;
    nombre_revisor?: string;
  }) => Promise<void>;
  
  clearMailLog: () => void;
}

// ─────────────────────────────────────────────────────────────
//  Datos semilla / mock locales (Fallback)
// ─────────────────────────────────────────────────────────────

const mockTicketTypes: TicketType[] = [
  { id: "tt-1", tipo: "Vacaciones", name: "Vacaciones", icon: "🏖️", active: true },
  { id: "tt-2", tipo: "Permiso con Goce", name: "Permiso con Goce", icon: "✅", active: true },
  { id: "tt-3", tipo: "Permiso sin Goce", name: "Permiso sin Goce", icon: "📋", active: true },
  { id: "tt-4", tipo: "Cambio de Equipo", name: "Cambio de Equipo", icon: "💻", active: true },
  { id: "tt-5", tipo: "Cambio de Turno", name: "Cambio de Turno", icon: "🔄", active: true },
  { id: "tt-6", tipo: "Teletrabajo", name: "Teletrabajo", icon: "🏠", active: true },
  { id: "tt-7", tipo: "Licencia Médica", name: "Licencia Médica", icon: "🏥", active: true },
  { id: "tt-8", tipo: "Reposición de EPP", name: "Reposición de EPP", icon: "🦺", active: true },
  { id: "tt-9", tipo: "Otro", name: "Otra Solicitud", icon: "📌", active: true }
];

const generarMockTemplates = (types: TicketType[]): WorkflowTemplate[] => {
  const list: WorkflowTemplate[] = [];
  types.forEach(t => {
    list.push({
      id: `tmpl-${t.id}-pend`,
      ticket_type_id: t.id,
      stage: "Pendiente",
      notify_requester: true,
      notify_assignee: true,
      notify_unit_manager: true,
      notify_cc_recipients: false,
      email_subject: `Nueva solicitud {codigo_solicitud} de {tipo_solicitud} recibida`,
      email_body: `Estimado/a,\n\nSe ha creado una nueva solicitud de {tipo_solicitud} con código {codigo_solicitud}.\n\nAsunto: {asunto}\nSolicitante: {nombre_solicitante}\nPrioridad: {prioridad}\n\nFavor revisar en el portal.`,
      active: true
    });
    list.push({
      id: `tmpl-${t.id}-rev`,
      ticket_type_id: t.id,
      stage: "En Revisión",
      notify_requester: true,
      notify_assignee: false,
      notify_unit_manager: false,
      notify_cc_recipients: false,
      email_subject: `Tu solicitud {codigo_solicitud} de {tipo_solicitud} está en revisión`,
      email_body: `Estimado/a {nombre_solicitante},\n\nTu solicitud con código {codigo_solicitud} ({tipo_solicitud}) ha cambiado de estado a "En Revisión".\n\nRevisor actual: {nombre_revisor}\n\nTe mantendremos informado sobre el avance del proceso.`,
      active: true
    });
    list.push({
      id: `tmpl-${t.id}-aprob`,
      ticket_type_id: t.id,
      stage: "Aprobada",
      notify_requester: true,
      notify_assignee: false,
      notify_unit_manager: true,
      notify_cc_recipients: true,
      email_subject: `Solicitud {codigo_solicitud} de {tipo_solicitud} APROBADA`,
      email_body: `Estimado/a {nombre_solicitante},\n\nNos complace informarte que tu solicitud con código {codigo_solicitud} ({tipo_solicitud}) ha sido APROBADA.\n\nObservaciones/Detalles:\n{observaciones}\n\nFecha de resolución: {fecha_resolucion}`,
      active: true
    });
    list.push({
      id: `tmpl-${t.id}-rech`,
      ticket_type_id: t.id,
      stage: "Rechazada",
      notify_requester: true,
      notify_assignee: false,
      notify_unit_manager: false,
      notify_cc_recipients: false,
      email_subject: `Solicitud {codigo_solicitud} de {tipo_solicitud} RECHAZADA`,
      email_body: `Estimado/a {nombre_solicitante},\n\nTe informamos que tu solicitud con código {codigo_solicitud} ({tipo_solicitud}) ha sido RECHAZADA.\n\nMotivo del rechazo:\n{motivo_rechazo}\n\nFecha de resolución: {fecha_resolucion}`,
      active: true
    });
    list.push({
      id: `tmpl-${t.id}-canc`,
      ticket_type_id: t.id,
      stage: "Cancelada",
      notify_requester: false,
      notify_assignee: true,
      notify_unit_manager: false,
      notify_cc_recipients: false,
      email_subject: `Solicitud {codigo_solicitud} CANCELADA por el trabajador`,
      email_body: `Estimado/a,\n\nTe informamos que la solicitud con código {codigo_solicitud} ({tipo_solicitud}) creada por {nombre_solicitante} ha sido CANCELADA por el propio trabajador.`,
      active: true
    });
  });
  return list;
};

// ─────────────────────────────────────────────────────────────
//  Store Implementation
// ─────────────────────────────────────────────────────────────

export const useWorkflowsStore = create<WorkflowsState>()(
  persist(
    (set, get) => ({
      ticketTypes: mockTicketTypes,
      templates: generarMockTemplates(mockTicketTypes),
      contractSettings: [],
      ccRecipients: [],
      sentMailLog: [],

      fetchWorkflowsData: async () => {
        try {
          // 1. Cargar tipos de ticket
          const { data: tTypes, error: errorTypes } = await supabase
            .from("ticket_types")
            .select("*");

          if (errorTypes) throw errorTypes;

          // 2. Cargar plantillas
          const { data: tTemplates, error: errorTemplates } = await supabase
            .from("ticket_workflow_templates")
            .select("*");

          // 3. Cargar configuraciones de contratos
          const { data: tSettings, error: errorSettings } = await supabase
            .from("ticket_type_contract_settings")
            .select("*");

          // 4. Cargar destinatarios CC
          const { data: tCc, error: errorCc } = await supabase
            .from("ticket_type_cc_recipients")
            .select("*");

          set({
            ticketTypes: tTypes && tTypes.length > 0 ? tTypes : mockTicketTypes,
            templates: tTemplates && tTemplates.length > 0 ? tTemplates : generarMockTemplates(tTypes || mockTicketTypes),
            contractSettings: tSettings || [],
            ccRecipients: tCc || []
          });

        } catch (err) {
          if (process.env.NODE_ENV === "development") {
            console.warn("[workflows-store] Fallback a datos locales/caché:", err);
          }
          // El middleware persist se encarga de rehidratar el estado guardado en LocalStorage
        }
      },

      saveTemplate: async (tmpl) => {
        const tempId = tmpl.id || `tmpl-${Date.now()}`;
        const finalTmpl = { ...tmpl, id: tempId } as WorkflowTemplate;

        // Optimistic UI Update
        set(state => {
          const exists = state.templates.some(t => t.id === tmpl.id || (t.ticket_type_id === tmpl.ticket_type_id && t.stage === tmpl.stage));
          const nextTemplates = exists
            ? state.templates.map(t => (t.id === tmpl.id || (t.ticket_type_id === tmpl.ticket_type_id && t.stage === tmpl.stage)) ? { ...t, ...tmpl } as WorkflowTemplate : t)
            : [...state.templates, finalTmpl];
          return { templates: nextTemplates };
        });

        try {
          const dbData = {
            ticket_type_id: tmpl.ticket_type_id,
            stage: tmpl.stage,
            notify_requester: tmpl.notify_requester,
            notify_assignee: tmpl.notify_assignee,
            notify_unit_manager: tmpl.notify_unit_manager,
            notify_cc_recipients: tmpl.notify_cc_recipients,
            email_subject: tmpl.email_subject,
            email_body: tmpl.email_body,
            active: tmpl.active
          };

          if (tmpl.id && !tmpl.id.startsWith("tmpl-")) {
            // Es un registro real de Supabase
            const { error } = await supabase
              .from("ticket_workflow_templates")
              .update(dbData)
              .eq("id", tmpl.id);
            if (error) throw error;
          } else {
            // Crear o upsert por UNIQUE (ticket_type_id, stage)
            const { data, error } = await supabase
              .from("ticket_workflow_templates")
              .upsert([dbData], { onConflict: "ticket_type_id, stage" })
              .select();
            if (error) throw error;
            if (data && data[0]) {
              set(state => ({
                templates: state.templates.map(t => (t.ticket_type_id === tmpl.ticket_type_id && t.stage === tmpl.stage) ? data[0] : t)
              }));
            }
          }
        } catch (err) {
          console.error("[workflows-store] Falló al persistir plantilla en Supabase:", err);
        }
      },

      saveContractSetting: async (setting) => {
        const tempId = setting.id || `cset-${Date.now()}`;
        const finalSetting = { ...setting, id: tempId } as ContractSetting;

        set(state => {
          const exists = state.contractSettings.some(s => s.id === setting.id || (s.contract_id === setting.contract_id && s.ticket_type_id === setting.ticket_type_id));
          const nextSettings = exists
            ? state.contractSettings.map(s => (s.id === setting.id || (s.contract_id === setting.contract_id && s.ticket_type_id === setting.ticket_type_id)) ? { ...s, ...setting } as ContractSetting : s)
            : [...state.contractSettings, finalSetting];
          return { contractSettings: nextSettings };
        });

        try {
          const dbData = {
            contract_id: setting.contract_id,
            ticket_type_id: setting.ticket_type_id,
            primary_recipient_type: setting.primary_recipient_type,
            primary_recipient_id: setting.primary_recipient_id || null,
            sla_hours: setting.sla_hours,
            enable_cc: setting.enable_cc,
            active: setting.active,
            notes: setting.notes
          };

          if (setting.id && !setting.id.startsWith("cset-")) {
            const { error } = await supabase
              .from("ticket_type_contract_settings")
              .update(dbData)
              .eq("id", setting.id);
            if (error) throw error;
          } else {
            const { data, error } = await supabase
              .from("ticket_type_contract_settings")
              .upsert([dbData], { onConflict: "contract_id, ticket_type_id" })
              .select();
            if (error) throw error;
            if (data && data[0]) {
              set(state => ({
                contractSettings: state.contractSettings.map(s => (s.contract_id === setting.contract_id && s.ticket_type_id === setting.ticket_type_id) ? data[0] : s)
              }));
            }
          }
        } catch (err) {
          console.error("[workflows-store] Falló al persistir configuración de contrato:", err);
        }
      },

      addCcRecipient: async (cc) => {
        const tempId = `cc-${Date.now()}`;
        const finalCc = { ...cc, id: tempId } as CcRecipient;

        set(state => ({ ccRecipients: [...state.ccRecipients, finalCc] }));

        try {
          const dbData = {
            contract_id: cc.contract_id,
            ticket_type_id: cc.ticket_type_id,
            recipient_type: cc.recipient_type,
            recipient_id: cc.recipient_id || null,
            label: cc.label,
            active: cc.active
          };

          const { data, error } = await supabase
            .from("ticket_type_cc_recipients")
            .insert([dbData])
            .select();

          if (error) throw error;
          if (data && data[0]) {
            set(state => ({
              ccRecipients: state.ccRecipients.map(item => item.id === tempId ? data[0] : item)
            }));
          }
        } catch (err) {
          console.error("[workflows-store] Falló al guardar destinatario CC:", err);
        }
      },

      removeCcRecipient: async (id) => {
        set(state => ({ ccRecipients: state.ccRecipients.filter(item => item.id !== id) }));

        try {
          if (!id.startsWith("cc-")) {
            const { error } = await supabase
              .from("ticket_type_cc_recipients")
              .delete()
              .eq("id", id);
            if (error) throw error;
          }
        } catch (err) {
          console.error("[workflows-store] Falló al borrar destinatario CC:", err);
        }
      },

      updateContractManager: async (contractId, managerId) => {
        // Actualizar localmente en el store de contratos
        try {
          const { useContratosStore } = await import("@/store/contratos-store");
          const contratos = useContratosStore.getState().contratos;
          const updatedContratos = contratos.map(c => 
            c.id_contrato === contractId ? { ...c, manager_id: managerId } : c
          ) as any;
          useContratosStore.setState({ contratos: updatedContratos });
        } catch (localErr) {
          console.warn("[workflows-store] No se pudo actualizar el store de contratos local:", localErr);
        }

        try {
          const { error } = await supabase
            .from("contratos")
            .update({ manager_id: managerId })
            .eq("id_contrato", contractId);

          if (error) throw error;
        } catch (err) {
          console.error("[workflows-store] Falló al actualizar manager del contrato en Supabase:", err);
        }
      },

      dispararNotificacion: async (solicitud, stage, extraData = {}) => {
        const state = get();
        const types = state.ticketTypes;
        const templates = state.templates;

        // 1. Identificar el tipo de solicitud en el catálogo
        const ticketType = types.find(t => t.tipo === solicitud.tipo);
        if (!ticketType) return;

        // 2. Buscar la plantilla correspondiente a la etapa
        const template = templates.find(t => t.ticket_type_id === ticketType.id && t.stage === stage);
        if (!template || !template.active) return;

        // 3. Obtener el contrato de la solicitud (buscando en contratos locales/store)
        // Usaremos el store de contratos para obtener detalles
        const { useContratosStore } = await import("@/store/contratos-store");
        const { useTrabajadoresStore } = await import("@/store/trabajadores-store");
        
        const contratos = useContratosStore.getState().contratos;
        const trabajadores = useTrabajadoresStore.getState().trabajadores;

        // Buscar el contrato correspondiente
        // Nota: en solicitudes guardamos el id_trabajador_solicitante. Buscaremos qué contrato lo tiene asignado.
        const contratoActivo = contratos.find(c =>
          c.trabajadores_asignados.some(t => t.id_trabajador === solicitud.id_trabajador_solicitante && t.activo)
        );

        if (!contratoActivo) {
          if (process.env.NODE_ENV === "development") {
            console.warn(`[workflows-store] No se encontró contrato activo para el trabajador ${solicitud.nombre_solicitante}`);
          }
        }

        // 4. Resolver destinatarios de correo
        const destinatarios: string[] = [];

        // Trabajador Solicitante
        const trabajadorSol = trabajadores.find(t => t.id_trabajador === solicitud.id_trabajador_solicitante);
        const emailSolicitante = trabajadorSol?.email_corporativo || "solicitante@monitoring.cl";

        if (template.notify_requester) {
          destinatarios.push(emailSolicitante);
        }

        // Responsable Principal del Contrato (Assignee)
        if (template.notify_assignee && contratoActivo) {
          const setting = state.contractSettings.find(
            s => s.contract_id === contratoActivo.id_contrato && s.ticket_type_id === ticketType.id
          );
          if (setting && setting.active) {
            if (setting.primary_recipient_type === "trabajador" && setting.primary_recipient_id) {
              const respUser = trabajadores.find(t => t.id_trabajador === setting.primary_recipient_id);
              if (respUser?.email_corporativo) destinatarios.push(respUser.email_corporativo);
            } else {
              // Si es un departamento o rol (ej. 'rrhh', 'ti') derivar a un correo genérico
              destinatarios.push(`${setting.primary_recipient_type}@monitoring.cl`);
            }
          } else {
            // Fallback: Administrador de Contrato (manager_id)
            if (contratoActivo.manager_id) {
              const manager = trabajadores.find(t => t.id_trabajador === contratoActivo.manager_id);
              if (manager?.email_corporativo) destinatarios.push(manager.email_corporativo);
            } else {
              destinatarios.push("encargado-contrato@monitoring.cl");
            }
          }
        }

        // Jefe de Unidad / Jefe Directo
        if (template.notify_unit_manager && contratoActivo) {
          const asignacion = contratoActivo.trabajadores_asignados.find(
            t => t.id_trabajador === solicitud.id_trabajador_solicitante && t.activo
          );
          const unidad = contratoActivo.unidades.find(u => u.id_unidad === asignacion?.id_unidad);
          if (unidad && unidad.id_jefe_trabajador) {
            const jefe = trabajadores.find(t => t.id_trabajador === unidad.id_jefe_trabajador);
            if (jefe?.email_corporativo) destinatarios.push(jefe.email_corporativo);
          } else {
            // Fallback
            destinatarios.push("jefe-directo@monitoring.cl");
          }
        }

        // Destinatarios en Copia (CC)
        if (template.notify_cc_recipients && contratoActivo) {
          const ccList = state.ccRecipients.filter(
            cc => cc.contract_id === contratoActivo.id_contrato && cc.ticket_type_id === ticketType.id && cc.active
          );
          ccList.forEach(cc => {
            if (cc.recipient_type === "trabajador" && cc.recipient_id) {
              const respUser = trabajadores.find(t => t.id_trabajador === cc.recipient_id);
              if (respUser?.email_corporativo) destinatarios.push(respUser.email_corporativo);
            } else {
              destinatarios.push(`${cc.recipient_type}@monitoring.cl`);
            }
          });
        }

        // Eliminar duplicados y vacíos
        const destinatariosUnicos = Array.from(new Set(destinatarios.filter(Boolean)));
        if (destinatariosUnicos.length === 0) return;

        // 5. Reemplazar variables dinámicas en plantilla
        const varMap: Record<string, string> = {
          codigo_solicitud: solicitud.codigo_solicitud || "SOL-NUEVA",
          tipo_solicitud: solicitud.tipo,
          asunto: solicitud.asunto || "",
          nombre_solicitante: solicitud.nombre_solicitante || "",
          prioridad: solicitud.prioridad || "Normal",
          estado: stage,
          nombre_revisor: extraData.nombre_revisor || solicitud.nombre_revisor || "Encargado de Contrato",
          observaciones: extraData.observaciones || solicitud.observaciones || "Sin observaciones adicionales.",
          motivo_rechazo: extraData.motivo_rechazo || solicitud.motivo_rechazo || "No especificado.",
          fecha_resolucion: new Date().toLocaleDateString("es-CL")
        };

        const resolverTemplate = (str: string) => {
          let res = str;
          Object.entries(varMap).forEach(([key, val]) => {
            res = res.replace(new RegExp(`{${key}}`, "g"), val);
          });
          return res;
        };

        const asuntoFinal = resolverTemplate(template.email_subject);
        const cuerpoFinal = resolverTemplate(template.email_body);

        // 6. Registrar en el log de correos simulados (Simulation)
        const logEntry: SentMailEntry = {
          id: `mail-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          fecha: new Date().toISOString(),
          id_solicitud: solicitud.id_solicitud,
          codigo_solicitud: solicitud.codigo_solicitud || "SOL-NUEVA",
          tipo_solicitud: solicitud.tipo,
          stage,
          destinatarios: destinatariosUnicos,
          asunto: asuntoFinal,
          cuerpo: cuerpoFinal,
          exito: true
        };

        set(state => ({ sentMailLog: [logEntry, ...state.sentMailLog].slice(0, 100) })); // Cap log at 100 entries

        if (process.env.NODE_ENV === "development") {
          console.log(`[workflows-store] 📧 SIMULACIÓN CORREO ENVIADO A:`, destinatariosUnicos);
          console.log(`[workflows-store] ASUNTO:`, asuntoFinal);
          console.log(`[workflows-store] CUERPO:`, cuerpoFinal);
        }
      },

      clearMailLog: () => set({ sentMailLog: [] })
    }),
    {
      name: "monitoring-workflows-storage"
    }
  )
);
