-- ============================================================
-- MÓDULO: ELEMENTOS DE PROTECCIÓN PERSONAL (EPP)
-- Relacionado con: epp-store.ts
-- ============================================================

-- Tabla cabecera de entregas
CREATE TABLE IF NOT EXISTS epp_entregas (
  id_entrega        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_trabajador     UUID NOT NULL REFERENCES trabajadores(id_trabajador) ON DELETE CASCADE,
  fecha_entrega     DATE NOT NULL DEFAULT CURRENT_DATE,
  recibido_por      TEXT, -- Nombre o firma de quien recibe (opcional)
  observaciones     TEXT,
  fecha_creacion    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de desglose de items entregados
CREATE TABLE IF NOT EXISTS epp_entrega_items (
  id_item           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_entrega        UUID NOT NULL REFERENCES epp_entregas(id_entrega) ON DELETE CASCADE,
  elemento          TEXT NOT NULL, -- zapatos, casco, etc.
  cantidad          INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  talla             TEXT, -- Talla (Ej: L, M, XL, 41)
  opcion            TEXT, -- Color, marca, u otra opción personalizada
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para mejorar rendimiento en búsquedas
CREATE INDEX IF NOT EXISTS idx_epp_entregas_trabajador ON epp_entregas(id_trabajador);
CREATE INDEX IF NOT EXISTS idx_epp_entrega_items_entrega ON epp_entrega_items(id_entrega);

-- Trigger para automatizar el updated_at (reutilizando la función set_updated_at de Supabase)
CREATE OR REPLACE TRIGGER trg_epp_entregas_upd
  BEFORE UPDATE ON epp_entregas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Habilitar RLS (Seguridad a Nivel de Fila)
ALTER TABLE epp_entregas ENABLE ROW LEVEL SECURITY;
ALTER TABLE epp_entrega_items ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para el rol autenticado
DROP POLICY IF EXISTS "authenticated_full_access_epp_entregas" ON epp_entregas;
CREATE POLICY "authenticated_full_access_epp_entregas"
  ON epp_entregas FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_full_access_epp_entrega_items" ON epp_entrega_items;
CREATE POLICY "authenticated_full_access_epp_entrega_items"
  ON epp_entrega_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
