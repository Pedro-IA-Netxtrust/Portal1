-- ============================================================
-- MÓDULO: COMPRAS E INVENTARIO DE PRODUCTOS Y EPP
-- Relacionado con: inventario-store.ts
-- ============================================================

-- 1. Tabla de Bodegas
CREATE TABLE IF NOT EXISTS bodegas (
  id_bodega      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre         TEXT NOT NULL UNIQUE,
  ubicacion      TEXT,
  activa         BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabla de Catálogo de Productos
CREATE TABLE IF NOT EXISTS productos (
  id_producto    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre         TEXT NOT NULL UNIQUE,
  categoria      TEXT NOT NULL DEFAULT 'EPP', -- 'EPP', 'Herramientas', 'Insumos'
  descripcion    TEXT,
  unidad_medida  TEXT NOT NULL DEFAULT 'Unidad', -- 'Par', 'Unidad'
  stock_critico  INTEGER NOT NULL DEFAULT 0 CHECK (stock_critico >= 0),
  activo         BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabla Cabecera de Compras (Facturas)
CREATE TABLE IF NOT EXISTS epp_compras (
  id_compra       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_proveedor    UUID REFERENCES proveedores(id_proveedor) ON DELETE SET NULL,
  numero_factura  TEXT NOT NULL,
  fecha_compra    DATE NOT NULL DEFAULT current_date,
  monto_total     NUMERIC NOT NULL DEFAULT 0 CHECK (monto_total >= 0),
  observaciones   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabla de Lotes de Compra (Ingreso de Stock)
CREATE TABLE IF NOT EXISTS epp_inventario_lotes (
  id_lote          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_compra        UUID NOT NULL REFERENCES epp_compras(id_compra) ON DELETE CASCADE,
  id_producto      UUID NOT NULL REFERENCES productos(id_producto) ON DELETE CASCADE,
  id_bodega        UUID NOT NULL REFERENCES bodegas(id_bodega) ON DELETE CASCADE,
  talla            TEXT NOT NULL,
  opcion           TEXT NOT NULL DEFAULT 'Estándar', -- Color, marca, etc.
  cantidad_inicial INTEGER NOT NULL CHECK (cantidad_inicial >= 0),
  cantidad_actual  INTEGER NOT NULL CHECK (cantidad_actual >= 0),
  precio_unitario  NUMERIC NOT NULL DEFAULT 0 CHECK (precio_unitario >= 0),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabla de enlace para Trazabilidad de Descuentos (Auditoría de Stock)
CREATE TABLE IF NOT EXISTS epp_descuentos_inventario (
  id_descuento      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_item_entrega   UUID NOT NULL, -- FK lógica a epp_entrega_items
  id_lote           UUID NOT NULL REFERENCES epp_inventario_lotes(id_lote) ON DELETE CASCADE,
  cantidad          INTEGER NOT NULL CHECK (cantidad > 0),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices de Rendimiento
CREATE INDEX IF NOT EXISTS idx_lotes_producto_bodega ON epp_inventario_lotes(id_producto, id_bodega);
CREATE INDEX IF NOT EXISTS idx_descuentos_lote ON epp_descuentos_inventario(id_lote);

-- Triggers de actualización automática de updated_at
CREATE OR REPLACE TRIGGER trg_bodegas_upd
  BEFORE UPDATE ON bodegas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_productos_upd
  BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_epp_compras_upd
  BEFORE UPDATE ON epp_compras
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_epp_inventario_lotes_upd
  BEFORE UPDATE ON epp_inventario_lotes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Habilitar RLS (Seguridad a Nivel de Fila)
ALTER TABLE bodegas ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE epp_compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE epp_inventario_lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE epp_descuentos_inventario ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para el rol autenticado
DROP POLICY IF EXISTS "auth_all_access_bodegas" ON bodegas;
CREATE POLICY "auth_all_access_bodegas" ON bodegas FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_access_productos" ON productos;
CREATE POLICY "auth_all_access_productos" ON productos FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_access_compras" ON epp_compras;
CREATE POLICY "auth_all_access_compras" ON epp_compras FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_access_lotes" ON epp_inventario_lotes;
CREATE POLICY "auth_all_access_lotes" ON epp_inventario_lotes FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_access_descuentos" ON epp_descuentos_inventario;
CREATE POLICY "auth_all_access_descuentos" ON epp_descuentos_inventario FOR ALL TO authenticated USING (true) WITH CHECK (true);
