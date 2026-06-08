# ============================================================
# FASE 3: reconciliar_personal.ps1
# Compara PERSONAL NCC30.csv contra bd_trabajadores.csv
# y genera los scripts SQL para la importacion.
#
# Uso: .\reconciliar_personal.ps1
#
# Genera:
#   reporte_diferencias.md
#   importar_paso1_nuevos.sql
#   importar_paso2_actualizar.sql
#   importar_paso3_revision.sql
#   importar_paso4_auditoria.sql
# ============================================================

param()
$ErrorActionPreference = "Stop"
$scriptDir    = Split-Path -Parent $MyInvocation.MyCommand.Path
$csvPersonal  = Join-Path $scriptDir "PERSONAL NCC30.csv"
$csvBD        = Join-Path $scriptDir "bd_trabajadores.csv"

Write-Host ""
Write-Host "============================================" -ForegroundColor DarkCyan
Write-Host "  FASE 3 - Reconciliacion CSV vs BD" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor DarkCyan
Write-Host ""

# ---- VALIDAR ARCHIVOS ----------------------------------------
if (-not (Test-Path $csvPersonal)) {
    Write-Host "ERROR: No se encontro: $csvPersonal" -ForegroundColor Red; exit 1
}
if (-not (Test-Path $csvBD)) {
    Write-Host "ERROR: No se encontro: $csvBD" -ForegroundColor Red
    Write-Host "  -> Ejecuta primero exportar_trabajadores.sql en Supabase" -ForegroundColor Yellow
    Write-Host "     y guarda el resultado como 'bd_trabajadores.csv' en esta carpeta." -ForegroundColor Yellow
    exit 1
}

# ---- FUNCIONES -----------------------------------------------
function NormRUT { param([string]$r); return $r.Trim().Replace(".", "").Replace("-", "").Replace(" ", "").ToUpper() }
function FormatRUT {
    param([string]$raw)
    $n = NormRUT $raw
    if ($n -match "^(\d+)([0-9K])$" -and $n.Length -ge 2) {
        $num = $n.Substring(0, $n.Length - 1)
        $dv  = $n.Substring($n.Length - 1, 1)
        $fmt = "{0:N0}" -f [long]$num
        return "$($fmt.Replace(',','.'))-$dv"
    }
    return $raw.Trim()
}
function ValidRUT {
    param([string]$rut)
    $n = NormRUT $rut
    $numStr = ""; $dv = ""
    if ($n -match "^(\d{1,8})-([0-9K])$") { $numStr = $Matches[1]; $dv = $Matches[2] }
    elseif ($n -match "^(\d{2,9})([0-9K])$") { $numStr = $Matches[1]; $dv = $Matches[2] }
    else { return $false }
    $number = [long]$numStr
    $sum = 0; $mult = 2; $temp = $number
    while ($temp -gt 0) {
        $sum += ($temp % 10) * $mult; $temp = [math]::Floor($temp / 10); $mult++
        if ($mult -gt 7) { $mult = 2 }
    }
    $rem = 11 - ($sum % 11)
    $exp = switch ($rem) { 11 { "0" } 10 { "K" } default { "$rem" } }
    return ($exp -eq $dv)
}
function Convert-DateISO {
    param([string]$d)
    if ([string]::IsNullOrWhiteSpace($d)) { return $null }
    $d = $d.Trim()
    if ($d -match "^(.+\d{4})\s+/\s+\d") { $d = $Matches[1].Trim() }
    $dSlash = $d -replace "-", "/"
    $fmts = @("dd/MM/yyyy","d/M/yyyy","dd/M/yyyy","d/MM/yyyy","dd/MM/yy")
    foreach ($fmt in $fmts) {
        foreach ($src in @($d, $dSlash)) {
            try {
                $p = [datetime]::ParseExact($src.Trim(), $fmt, [System.Globalization.CultureInfo]::InvariantCulture)
                if ($p.Year -gt 2100) { return $null }
                return $p.ToString("yyyy-MM-dd")
            } catch {}
        }
    }
    return $null
}
function EscapeSQL { param([string]$s); return $s.Trim().Replace("'", "''") }
function SQLVal {
    param([string]$v)
    if ([string]::IsNullOrWhiteSpace($v)) { return "NULL" }
    return "'" + (EscapeSQL $v) + "'"
}
function SQLDate {
    param([string]$iso)
    if ([string]::IsNullOrWhiteSpace($iso)) { return "NULL" }
    return "'" + $iso + "'"
}

# ---- INDICES DE COLUMNAS CSV ---------------------------------
$IDX = @{ CC=0; AP1=1; AP2=2; N1=3; N2=4; ACT=5; RUT=6; CARGO=7; INGRESO=8
          EXAM_NUM=10; EXAM_F=11; EXAM_V=12; EXAM_I=13; ZAP=16; CHA=17; CAM=18; POL=19; RESP=20 }

# ---- CARGAR CSV ----------------------------------------------
Write-Host "Leyendo PERSONAL NCC30.csv..." -ForegroundColor Yellow
$rawLines  = Get-Content $csvPersonal -Encoding UTF8
$dataLines = $rawLines[2..($rawLines.Count - 1)]

$csvWorkers = [System.Collections.Generic.List[PSCustomObject]]::new()
foreach ($line in $dataLines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $cols = $line -split ";"
    if ($cols.Count -lt 7) { continue }
    $rut = if ($cols.Count -gt $IDX.RUT) { $cols[$IDX.RUT].Trim() } else { "" }
    if ([string]::IsNullOrWhiteSpace($rut)) { continue }

    $col = { param($i) if ($cols.Count -gt $i) { $cols[$i].Trim() -replace "\s+", " " } else { "" } }

    $csvWorkers.Add([PSCustomObject]@{
        RUT_Normal   = NormRUT $rut
        RUT_Formato  = FormatRUT $rut
        RUT_Valido   = ValidRUT $rut
        CentroCosto  = & $col $IDX.CC
        Apellido1    = & $col $IDX.AP1
        Apellido2    = & $col $IDX.AP2
        Nombre1      = & $col $IDX.N1
        Nombre2      = & $col $IDX.N2
        Act          = & $col $IDX.ACT
        Cargo        = & $col $IDX.CARGO
        FechaIngreso = Convert-DateISO (& $col $IDX.INGRESO)
        FechaExamen  = Convert-DateISO ($cols[$IDX.EXAM_F].Trim())
        VigExamen    = Convert-DateISO ($cols[$IDX.EXAM_V].Trim())
        InstExamen   = & $col $IDX.EXAM_I
        NumAtencion  = & $col $IDX.EXAM_NUM
        TallaZapatos = & $col $IDX.ZAP
        TallaCamisa  = & $col $IDX.CAM
        TallaPolera  = & $col $IDX.POL
        ChalecoGeo   = & $col $IDX.CHA
        TallaResp    = & $col $IDX.RESP
    })
}
Write-Host "  -> $($csvWorkers.Count) trabajadores en CSV" -ForegroundColor White

# ---- CARGAR BD -----------------------------------------------
Write-Host "Leyendo bd_trabajadores.csv..." -ForegroundColor Yellow
$bdData = Import-Csv -Path $csvBD -Encoding UTF8
$bdDict = @{}
foreach ($row in $bdData) {
    $rutBD = $row.numero_identificacion
    if ([string]::IsNullOrWhiteSpace($rutBD)) { continue }
    $key = NormRUT $rutBD
    if (-not $bdDict.ContainsKey($key)) { $bdDict[$key] = $row }
}
Write-Host "  -> $($bdDict.Count) trabajadores en BD" -ForegroundColor White

# ---- RECONCILIAR ---------------------------------------------
Write-Host ""
Write-Host "Reconciliando..." -ForegroundColor Yellow

$nuevos     = [System.Collections.Generic.List[PSCustomObject]]::new()
$actualizar = [System.Collections.Generic.List[PSCustomObject]]::new()
$exactos    = [System.Collections.Generic.List[PSCustomObject]]::new()
$csvRutSet  = [System.Collections.Generic.HashSet[string]]::new()

$camposComparar = @(
    @{ CSV="Apellido1";    BD="apellido_paterno" }
    @{ CSV="Apellido2";    BD="apellido_materno" }
    @{ CSV="Nombre1";      BD="nombre_1" }
    @{ CSV="Nombre2";      BD="nombre_2" }
    @{ CSV="Cargo";        BD="cargo" }
    @{ CSV="CentroCosto";  BD="area_departamento" }
    @{ CSV="FechaIngreso"; BD="fecha_ingreso" }
    @{ CSV="TallaZapatos"; BD="calzado_seguridad" }
    @{ CSV="TallaCamisa";  BD="talla_chaqueta" }
    @{ CSV="TallaPolera";  BD="talla_polera" }
    @{ CSV="ChalecoGeo";   BD="chaleco_geologo" }
    @{ CSV="TallaResp";    BD="respirador" }
)

foreach ($w in $csvWorkers) {
    $null = $csvRutSet.Add($w.RUT_Normal)
    if ($bdDict.ContainsKey($w.RUT_Normal)) {
        $bdRow = $bdDict[$w.RUT_Normal]
        $diffs = @()
        foreach ($campo in $camposComparar) {
            $csvVal = $w.($campo.CSV); $bdVal = $bdRow.($campo.BD)
            if ([string]::IsNullOrWhiteSpace($csvVal)) { $csvVal = "" }
            if ([string]::IsNullOrWhiteSpace($bdVal))  { $bdVal  = "" }
            if ($csvVal -ne $bdVal) {
                $diffs += [PSCustomObject]@{ Campo=$campo.BD; ValorCSV=$csvVal; ValorBD=$bdVal }
            }
        }
        if ($diffs.Count -gt 0) {
            $actualizar.Add([PSCustomObject]@{ Worker=$w; BDRow=$bdRow; Diffs=$diffs })
        } else {
            $exactos.Add($w)
        }
    } else {
        $nuevos.Add($w)
    }
}

$soloEnBD = [System.Collections.Generic.List[PSCustomObject]]::new()
foreach ($key in $bdDict.Keys) {
    if (-not $csvRutSet.Contains($key)) { $soloEnBD.Add($bdDict[$key]) }
}

Write-Host ""
Write-Host "  Sin cambios (exactos) : $($exactos.Count)" -ForegroundColor Green
Write-Host "  Para actualizar       : $($actualizar.Count)" -ForegroundColor Yellow
Write-Host "  Nuevos (INSERT)       : $($nuevos.Count)" -ForegroundColor Cyan
Write-Host "  Solo en BD (INFO)     : $($soloEnBD.Count)" -ForegroundColor Magenta
Write-Host ""

$ts = Get-Date -Format "yyyy-MM-dd HH:mm"

# ============================================================
# PASO 1: importar_paso1_nuevos.sql
# ============================================================
$paso1Path = Join-Path $scriptDir "importar_paso1_nuevos.sql"
Write-Host "Generando importar_paso1_nuevos.sql..." -ForegroundColor Yellow

$sb1 = [System.Text.StringBuilder]::new()
$null = $sb1.AppendLine("-- ============================================================")
$null = $sb1.AppendLine("-- PASO 1: Insertar trabajadores NUEVOS desde PERSONAL NCC30.csv")
$null = $sb1.AppendLine("-- Generado: $ts")
$null = $sb1.AppendLine("-- Total nuevos: $($nuevos.Count)")
$null = $sb1.AppendLine("--")
$null = $sb1.AppendLine("-- REVISAR antes de ejecutar:")
$null = $sb1.AppendLine("--   sexo y nacionalidad usan valores por defecto (M / Chilena)")
$null = $sb1.AppendLine("--   email_corporativo generado como nombre.apellido@monitoring.cl")
$null = $sb1.AppendLine("-- ============================================================")
$null = $sb1.AppendLine("")

if ($nuevos.Count -eq 0) {
    $null = $sb1.AppendLine("-- No hay trabajadores nuevos para insertar.")
} else {
    foreach ($w in ($nuevos | Sort-Object { $_.Apellido1 })) {
        $nombre   = "$($w.Nombre1) $($w.Apellido1)".Trim()
        $n1Clean  = $w.Nombre1.ToLower().Replace('á','a').Replace('é','e').Replace('í','i').Replace('ó','o').Replace('ú','u').Replace('ü','u').Replace('ñ','n')
        $n1low    = $n1Clean -replace '[^a-z0-9]',''
        $apClean  = $w.Apellido1.ToLower().Replace('á','a').Replace('é','e').Replace('í','i').Replace('ó','o').Replace('ú','u').Replace('ü','u').Replace('ñ','n')
        $aplow    = $apClean -replace '[^a-z0-9]',''
        $emailGen = "$n1low.$aplow@monitoring.cl"

        $null = $sb1.AppendLine("-- $nombre ($($w.RUT_Formato))")
        $null = $sb1.AppendLine("INSERT INTO trabajadores (")
        $null = $sb1.AppendLine("  apellido_paterno, apellido_materno, nombre_1, nombre_2,")
        $null = $sb1.AppendLine("  tipo_identificacion, numero_identificacion,")
        $null = $sb1.AppendLine("  cargo, area_departamento, fecha_ingreso,")
        $null = $sb1.AppendLine("  calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador,")
        $null = $sb1.AppendLine("  modalidad_trabajo, tipo_contrato, nacionalidad, sexo,")
        $null = $sb1.AppendLine("  celular_personal, email_corporativo, fecha_nacimiento")
        $null = $sb1.AppendLine(") VALUES (")
        $null = $sb1.AppendLine("  $(SQLVal $w.Apellido1), $(SQLVal $w.Apellido2), $(SQLVal $w.Nombre1), $(SQLVal $w.Nombre2),")
        $null = $sb1.AppendLine("  'RUT', $(SQLVal $w.RUT_Formato),")
        $null = $sb1.AppendLine("  $(SQLVal $w.Cargo), $(SQLVal $w.CentroCosto), $(SQLDate $w.FechaIngreso),")
        $null = $sb1.AppendLine("  $(SQLVal $w.TallaZapatos), $(SQLVal $w.TallaCamisa), $(SQLVal $w.TallaPolera), $(SQLVal $w.ChalecoGeo), $(SQLVal $w.TallaResp),")
        $null = $sb1.AppendLine("  'Presencial', 'Indefinido', 'Chilena', 'M',  -- VERIFICAR sexo y nacionalidad")
        $null = $sb1.AppendLine("  'PENDIENTE', '$(EscapeSQL $emailGen)', '1900-01-01'")
        $null = $sb1.AppendLine(")")
        $null = $sb1.AppendLine("ON CONFLICT (numero_identificacion) DO NOTHING;")
        $null = $sb1.AppendLine("")
    }
}

$sb1.ToString() | Out-File -FilePath $paso1Path -Encoding UTF8
Write-Host "  -> $paso1Path" -ForegroundColor Green

# ============================================================
# PASO 2: importar_paso2_actualizar.sql
# ============================================================
$paso2Path = Join-Path $scriptDir "importar_paso2_actualizar.sql"
Write-Host "Generando importar_paso2_actualizar.sql..." -ForegroundColor Yellow

$sb2 = [System.Text.StringBuilder]::new()
$null = $sb2.AppendLine("-- ============================================================")
$null = $sb2.AppendLine("-- PASO 2: Actualizar trabajadores con datos diferentes en CSV")
$null = $sb2.AppendLine("-- Generado: $ts")
$null = $sb2.AppendLine("-- Total a actualizar: $($actualizar.Count)")
$null = $sb2.AppendLine("-- ============================================================")
$null = $sb2.AppendLine("")

if ($actualizar.Count -eq 0) {
    $null = $sb2.AppendLine("-- No hay diferencias entre CSV y BD para actualizar.")
} else {
    foreach ($entry in ($actualizar | Sort-Object { $_.Worker.Apellido1 })) {
        $w      = $entry.Worker
        $nombre = "$($w.Nombre1) $($w.Apellido1)".Trim()
        $null = $sb2.AppendLine("-- $nombre ($($w.RUT_Formato))")
        $null = $sb2.AppendLine("-- Diferencias:")
        foreach ($d in $entry.Diffs) {
            $null = $sb2.AppendLine("--   $($d.Campo): BD='$($d.ValorBD)' -> CSV='$($d.ValorCSV)'")
        }
        $null = $sb2.AppendLine("UPDATE trabajadores SET")

        $setClauses = [System.Collections.Generic.List[string]]::new()
        $campoMap = @{
            "apellido_paterno"  = { SQLVal $w.Apellido1 }
            "apellido_materno"  = { SQLVal $w.Apellido2 }
            "nombre_1"          = { SQLVal $w.Nombre1 }
            "nombre_2"          = { SQLVal $w.Nombre2 }
            "cargo"             = { SQLVal $w.Cargo }
            "area_departamento" = { SQLVal $w.CentroCosto }
            "fecha_ingreso"     = { SQLDate $w.FechaIngreso }
            "calzado_seguridad" = { SQLVal $w.TallaZapatos }
            "talla_chaqueta"    = { SQLVal $w.TallaCamisa }
            "talla_polera"      = { SQLVal $w.TallaPolera }
            "chaleco_geologo"   = { SQLVal $w.ChalecoGeo }
            "respirador"        = { SQLVal $w.TallaResp }
        }

        foreach ($d in $entry.Diffs) {
            if ($campoMap.ContainsKey($d.Campo)) {
                $val = & $campoMap[$d.Campo]
                $setClauses.Add("  $($d.Campo) = $val")
            }
        }

        $null = $sb2.AppendLine($setClauses -join ",`n")
        $null = $sb2.AppendLine("WHERE numero_identificacion = $(SQLVal $w.RUT_Formato);")
        $null = $sb2.AppendLine("")
    }
}

$sb2.ToString() | Out-File -FilePath $paso2Path -Encoding UTF8
Write-Host "  -> $paso2Path" -ForegroundColor Green

# ============================================================
# PASO 3: importar_paso3_revision.sql
# Otros contratos (Valentina/Admin) — no son errores, solo INFO
# ============================================================
$paso3Path = Join-Path $scriptDir "importar_paso3_revision.sql"
Write-Host "Generando importar_paso3_revision.sql..." -ForegroundColor Yellow

$sb3 = [System.Text.StringBuilder]::new()
$null = $sb3.AppendLine("-- ============================================================")
$null = $sb3.AppendLine("-- PASO 3: INFO de trabajadores en BD pero no en CSV NCC30")
$null = $sb3.AppendLine("-- Generado: $ts")
$null = $sb3.AppendLine("-- Total: $($soloEnBD.Count)")
$null = $sb3.AppendLine("--")
$null = $sb3.AppendLine("-- Son de otros contratos (Valentina/Administracion) -- no son errores.")
$null = $sb3.AppendLine("-- ============================================================")
$null = $sb3.AppendLine("")

if ($soloEnBD.Count -eq 0) {
    $null = $sb3.AppendLine("-- Todos los trabajadores en BD aparecen en el CSV NCC30. OK")
} else {
    $null = $sb3.AppendLine("-- Trabajadores de otros contratos:")
    $tsTag = $ts.Replace(":", "-").Replace(" ", "_")
    foreach ($row in $soloEnBD) {
        $idT    = EscapeSQL $row.id_trabajador
        $nombre = EscapeSQL "$($row.nombre_1) $($row.apellido_paterno)".Trim()
        $rut    = EscapeSQL $row.numero_identificacion
        $null = $sb3.AppendLine("-- $nombre ($rut)")
        $null = $sb3.AppendLine("INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)")
        $null = $sb3.AppendLine("VALUES (")
        $null = $sb3.AppendLine("  'Trabajadores',")
        $null = $sb3.AppendLine("  'INFO',")
        $null = $sb3.AppendLine("  '$idT',")
        $null = $sb3.AppendLine("  '$nombre',")
        $null = $sb3.AppendLine("  'Pertenece a otro contrato (Valentina/Administracion) -- ausente en PERSONAL NCC30.csv. No requiere accion.',")
        $null = $sb3.AppendLine("  'importacion_ncc30_$tsTag'")
        $null = $sb3.AppendLine(");")
        $null = $sb3.AppendLine("")
    }
}

$sb3.ToString() | Out-File -FilePath $paso3Path -Encoding UTF8
Write-Host "  -> $paso3Path" -ForegroundColor Green

# ============================================================
# PASO 4: importar_paso4_auditoria.sql
# ============================================================
$paso4Path = Join-Path $scriptDir "importar_paso4_auditoria.sql"
Write-Host "Generando importar_paso4_auditoria.sql..." -ForegroundColor Yellow

$tsClean = $ts -replace '[: ]','-'
$sb4 = [System.Text.StringBuilder]::new()
$null = $sb4.AppendLine("-- ============================================================")
$null = $sb4.AppendLine("-- PASO 4: Registrar operacion global en auditoria")
$null = $sb4.AppendLine("-- Generado: $ts")
$null = $sb4.AppendLine("-- Ejecutar DESPUES de los pasos 1, 2 y 3")
$null = $sb4.AppendLine("-- ============================================================")
$null = $sb4.AppendLine("")
$null = $sb4.AppendLine("-- Resumen global")
$null = $sb4.AppendLine("INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario, meta)")
$null = $sb4.AppendLine("VALUES (")
$null = $sb4.AppendLine("  'Trabajadores',")
$null = $sb4.AppendLine("  'Importacion CSV',")
$null = $sb4.AppendLine("  'bulk-ncc30-$tsClean',")
$null = $sb4.AppendLine("  'PERSONAL NCC30.csv',")
$null = $sb4.AppendLine("  'Importacion masiva desde PERSONAL NCC30.csv. Nuevos: $($nuevos.Count) | Actualizados: $($actualizar.Count) | Sin cambios: $($exactos.Count) | Otro contrato: $($soloEnBD.Count)',")
$null = $sb4.AppendLine("  'Sistema',")
$null = $sb4.AppendLine("  '{""fuente"": ""PERSONAL NCC30.csv"", ""nuevos"": $($nuevos.Count), ""actualizados"": $($actualizar.Count), ""exactos"": $($exactos.Count), ""otro_contrato"": $($soloEnBD.Count)}'::jsonb")
$null = $sb4.AppendLine(");")
$null = $sb4.AppendLine("")

# Auditoria individual de nuevos
if ($nuevos.Count -gt 0) {
    $null = $sb4.AppendLine("-- Auditoria individual: trabajadores nuevos")
    foreach ($w in ($nuevos | Sort-Object { $_.Apellido1 })) {
        $nombre = EscapeSQL "$($w.Nombre1) $($w.Apellido1)".Trim()
        $rut    = EscapeSQL $w.RUT_Formato
        $null = $sb4.AppendLine("INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)")
        $null = $sb4.AppendLine("SELECT 'Trabajadores', 'Alta', id_trabajador, '$nombre',")
        $null = $sb4.AppendLine("  'Creado por importacion CSV NCC30. RUT: $rut', 'Sistema'")
        $null = $sb4.AppendLine("FROM trabajadores WHERE numero_identificacion = '$rut' LIMIT 1;")
        $null = $sb4.AppendLine("")
    }
}

# Auditoria individual de actualizados
if ($actualizar.Count -gt 0) {
    $null = $sb4.AppendLine("-- Auditoria individual: trabajadores actualizados")
    foreach ($entry in ($actualizar | Sort-Object { $_.Worker.Apellido1 })) {
        $w      = $entry.Worker
        $nombre = EscapeSQL "$($w.Nombre1) $($w.Apellido1)".Trim()
        $rut    = EscapeSQL $w.RUT_Formato
        $campos = ($entry.Diffs | ForEach-Object { $_.Campo }) -join ", "
        $null = $sb4.AppendLine("INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)")
        $null = $sb4.AppendLine("SELECT 'Trabajadores', 'Modificacion', id_trabajador, '$nombre',")
        $null = $sb4.AppendLine("  'Campos actualizados por importacion CSV NCC30: $campos', 'Sistema'")
        $null = $sb4.AppendLine("FROM trabajadores WHERE numero_identificacion = '$rut' LIMIT 1;")
        $null = $sb4.AppendLine("")
    }
}

$sb4.ToString() | Out-File -FilePath $paso4Path -Encoding UTF8
Write-Host "  -> $paso4Path" -ForegroundColor Green

# ============================================================
# REPORTE: reporte_diferencias.md
# ============================================================
$reportePath = Join-Path $scriptDir "reporte_diferencias.md"
Write-Host "Generando reporte_diferencias.md..." -ForegroundColor Yellow

$sbR = [System.Text.StringBuilder]::new()
$null = $sbR.AppendLine("# Reporte de Diferencias - CSV vs Base de Datos")
$null = $sbR.AppendLine("_Generado: $ts_")
$null = $sbR.AppendLine("")
$null = $sbR.AppendLine("---")
$null = $sbR.AppendLine("")
$null = $sbR.AppendLine("## Resumen de Reconciliacion")
$null = $sbR.AppendLine("")
$null = $sbR.AppendLine("| Estado | Cantidad | Accion SQL |")
$null = $sbR.AppendLine("|---|---|---|")
$null = $sbR.AppendLine("| Sin cambios (match exacto) | $($exactos.Count) | Ninguna |")
$null = $sbR.AppendLine("| Nuevos (solo en CSV) | $($nuevos.Count) | importar_paso1_nuevos.sql |")
$null = $sbR.AppendLine("| Para actualizar | $($actualizar.Count) | importar_paso2_actualizar.sql |")
$null = $sbR.AppendLine("| Otro contrato (solo en BD) | $($soloEnBD.Count) | importar_paso3_revision.sql |")
$null = $sbR.AppendLine("| **Total CSV** | **$($csvWorkers.Count)** | |")
$null = $sbR.AppendLine("| **Total BD** | **$($bdDict.Count)** | |")
$null = $sbR.AppendLine("")

if ($nuevos.Count -gt 0) {
    $null = $sbR.AppendLine("---")
    $null = $sbR.AppendLine("")
    $null = $sbR.AppendLine("## Trabajadores Nuevos ($($nuevos.Count))")
    $null = $sbR.AppendLine("")
    $null = $sbR.AppendLine("> [!NOTE]")
    $null = $sbR.AppendLine("> En CSV pero no en BD. Se insertaran con importar_paso1_nuevos.sql.")
    $null = $sbR.AppendLine("")
    $null = $sbR.AppendLine("| # | RUT | Nombre | Cargo | Centro Costo | Ingreso |")
    $null = $sbR.AppendLine("|---|---|---|---|---|---|")
    $num = 1
    foreach ($w in ($nuevos | Sort-Object Apellido1)) {
        $nombre = "$($w.Nombre1) $($w.Apellido1)".Trim()
        $null = $sbR.AppendLine("| $num | $($w.RUT_Formato) | $nombre | $($w.Cargo) | $($w.CentroCosto) | $($w.FechaIngreso) |")
        $num++
    }
    $null = $sbR.AppendLine("")
}

if ($actualizar.Count -gt 0) {
    $null = $sbR.AppendLine("---")
    $null = $sbR.AppendLine("")
    $null = $sbR.AppendLine("## Para Actualizar ($($actualizar.Count))")
    $null = $sbR.AppendLine("")
    $null = $sbR.AppendLine("> [!IMPORTANT]")
    $null = $sbR.AppendLine("> Revisar cada cambio antes de ejecutar importar_paso2_actualizar.sql.")
    $null = $sbR.AppendLine("")
    $num = 1
    foreach ($entry in ($actualizar | Sort-Object { $_.Worker.Apellido1 })) {
        $w      = $entry.Worker
        $nombre = "$($w.Nombre1) $($w.Apellido1)".Trim()
        $null = $sbR.AppendLine("### $num. $nombre - $($w.RUT_Formato)")
        $null = $sbR.AppendLine("")
        $null = $sbR.AppendLine("| Campo | Valor BD (actual) | Valor CSV (nuevo) |")
        $null = $sbR.AppendLine("|---|---|---|")
        foreach ($d in $entry.Diffs) {
            $null = $sbR.AppendLine("| $($d.Campo) | $($d.ValorBD) | **$($d.ValorCSV)** |")
        }
        $null = $sbR.AppendLine("")
        $num++
    }
}

if ($soloEnBD.Count -gt 0) {
    $null = $sbR.AppendLine("---")
    $null = $sbR.AppendLine("")
    $null = $sbR.AppendLine("## Otro Contrato - Solo en BD ($($soloEnBD.Count))")
    $null = $sbR.AppendLine("")
    $null = $sbR.AppendLine("> [!NOTE]")
    $null = $sbR.AppendLine("> Pertenecen a otros contratos (Valentina/Administracion). No son errores.")
    $null = $sbR.AppendLine("")
    $null = $sbR.AppendLine("| # | RUT | Nombre | Cargo | Ingreso |")
    $null = $sbR.AppendLine("|---|---|---|---|---|")
    $num = 1
    foreach ($row in ($soloEnBD | Sort-Object { $_.apellido_paterno })) {
        $nombre = "$($row.nombre_1) $($row.apellido_paterno)".Trim()
        $null = $sbR.AppendLine("| $num | $($row.numero_identificacion) | $nombre | $($row.cargo) | $($row.fecha_ingreso) |")
        $num++
    }
    $null = $sbR.AppendLine("")
}

$null = $sbR.AppendLine("---")
$null = $sbR.AppendLine("")
$null = $sbR.AppendLine("## Sin Cambios - Match Exacto ($($exactos.Count))")
$null = $sbR.AppendLine("")
$null = $sbR.AppendLine("| # | RUT | Nombre |")
$null = $sbR.AppendLine("|---|---|---|")
$num = 1
foreach ($w in ($exactos | Sort-Object Apellido1)) {
    $nombre = "$($w.Nombre1) $($w.Apellido1)".Trim()
    $null = $sbR.AppendLine("| $num | $($w.RUT_Formato) | $nombre |")
    $num++
}
$null = $sbR.AppendLine("")
$null = $sbR.AppendLine("---")
$null = $sbR.AppendLine("_Proximo paso: ejecutar los SQL en Supabase en orden: paso1 -> paso2 -> paso3 -> paso4_")

$sbR.ToString() | Out-File -FilePath $reportePath -Encoding UTF8
Write-Host "  -> $reportePath" -ForegroundColor Green

# ---- RESUMEN FINAL -------------------------------------------
Write-Host ""
Write-Host "============================================" -ForegroundColor DarkGreen
Write-Host "  Reconciliacion completada" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor DarkGreen
Write-Host ""
Write-Host "  Archivos generados:" -ForegroundColor White
Write-Host "    reporte_diferencias.md        <- revisar primero" -ForegroundColor Cyan
Write-Host "    importar_paso1_nuevos.sql      <- $($nuevos.Count) nuevos" -ForegroundColor $(if($nuevos.Count -gt 0){"Yellow"}else{"Gray"})
Write-Host "    importar_paso2_actualizar.sql  <- $($actualizar.Count) actualizaciones" -ForegroundColor $(if($actualizar.Count -gt 0){"Yellow"}else{"Gray"})
Write-Host "    importar_paso3_revision.sql    <- $($soloEnBD.Count) otro contrato" -ForegroundColor $(if($soloEnBD.Count -gt 0){"Magenta"}else{"Gray"})
Write-Host "    importar_paso4_auditoria.sql   <- registro global" -ForegroundColor Cyan
Write-Host ""
Write-Host "  PROXIMO PASO: Revisa reporte_diferencias.md" -ForegroundColor Yellow
Write-Host "  y ejecuta los SQL en Supabase: paso1 -> paso2 -> paso3 -> paso4" -ForegroundColor Yellow
Write-Host ""
