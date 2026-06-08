# ============================================================
# FASE 1: analizar_csv.ps1
# Analiza "PERSONAL NCC30.csv" antes de importar a Supabase.
# Genera: csv_analisis.md
# Uso: .\analizar_csv.ps1
# ============================================================
param()

$ErrorActionPreference = "Stop"
$scriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$csvPath    = Join-Path $scriptDir "PERSONAL NCC30.csv"
$outputPath = Join-Path $scriptDir "csv_analisis.md"

Write-Host ""
Write-Host "============================================" -ForegroundColor DarkCyan
Write-Host "  FASE 1 - Analisis del CSV de Personal" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor DarkCyan
Write-Host ""

if (-not (Test-Path $csvPath)) {
    Write-Host "ERROR: No se encontro el archivo: $csvPath" -ForegroundColor Red
    exit 1
}

# ---- FUNCIONES -----------------------------------------------

function NormRUT([string]$r) {
    return $r.Trim().Replace(".", "").Replace(" ", "").ToUpper()
}

function ValidRUT([string]$rut) {
    $n = NormRUT $rut
    if ($n -notmatch "^(\d{1,8})-([0-9K])$") { return $false }
    $number = [long]$Matches[1]
    $dv = $Matches[2]
    $sum = 0; $mult = 2; $temp = $number
    while ($temp -gt 0) {
        $sum += ($temp % 10) * $mult
        $temp = [math]::Floor($temp / 10)
        $mult++
        if ($mult -gt 7) { $mult = 2 }
    }
    $rem = 11 - ($sum % 11)
    $exp = switch ($rem) { 11 { "0" } 10 { "K" } default { "$rem" } }
    return ($exp -eq $dv)
}

function FormatRUT([string]$raw) {
    $n = NormRUT $raw
    if ($n -match "^(\d+)-([0-9K])$") {
        $num = "{0:N0}" -f [long]$Matches[1]
        return "$($num.Replace(',','.'))-$($Matches[2])"
    }
    return $raw.Trim()
}

function ConvertDate([string]$d) {
    if ([string]::IsNullOrWhiteSpace($d)) { return $null }
    $d = $d.Trim()
    # Tomar primer tramo si hay rango "fecha1 / fecha2" (ej: "25/05/2027 / 19/02/2028")
    # El rango tiene espacio antes del slash y al menos 2 digitos despues
    if ($d -match "^(.+\d{4})\s+/\s+\d") { $d = $Matches[1].Trim() }
    # Intentar parsear con slash
    $dSlash = $d -replace "-", "/"
    $fmts = @("dd/MM/yyyy","d/M/yyyy","dd/M/yyyy","d/MM/yyyy","dd/MM/yy")
    foreach ($fmt in $fmts) {
        foreach ($src in @($d, $dSlash)) {
            try {
                $p = [datetime]::ParseExact($src.Trim(), $fmt, [System.Globalization.CultureInfo]::InvariantCulture)
                if ($p.Year -gt 2100) { return "ANIO_INVALIDO:$($p.Year)" }
                return $p.ToString("yyyy-MM-dd")
            } catch {}
        }
    }
    return "FORMATO_INVALIDO:$d"
}

function CleanStr([string]$t) {
    return ($t.Trim() -replace "\s+", " ")
}

# ---- INDICES DE COLUMNAS -------------------------------------
$IDX = @{
    CC   = 0;  AP1 = 1;  AP2  = 2;  N1   = 3;  N2   = 4
    ACT  = 5;  RUT = 6;  CARG = 7;  ING  = 8;  EALC = 9
    ENUM = 10; EFR = 11; EVIG = 12; EINST= 13; BEL  = 14
    TUT  = 15; ZAP = 16; CHAL = 17; CAM  = 18; POL  = 19
    RESP = 20
}

# ---- LEER CSV ------------------------------------------------
Write-Host "Leyendo archivo..." -ForegroundColor Yellow
$rawLines = Get-Content $csvPath -Encoding UTF8

# Fila 0 = encabezado visual, Fila 1 = cabeceras reales, Filas 2+ = datos
$dataLines = $rawLines[2..($rawLines.Count - 1)]

$workers = [System.Collections.Generic.List[PSCustomObject]]::new()
$lineNum  = 3

foreach ($line in $dataLines) {
    if ([string]::IsNullOrWhiteSpace($line)) { $lineNum++; continue }
    $cols = $line -split ";"
    if ($cols.Count -lt 7) { $lineNum++; continue }

    $rut = if ($cols.Count -gt $IDX.RUT) { $cols[$IDX.RUT].Trim() } else { "" }
    if ([string]::IsNullOrWhiteSpace($rut)) { $lineNum++; continue }

    $get = { param($i) if ($cols.Count -gt $i) { CleanStr $cols[$i] } else { "" } }

    # Leer fecha de ingreso: el campo puede tener espacio trailing en el CSV
    $fechaRaw = ($cols[$IDX.ING]).Trim()
    $exRaw    = if ($cols.Count -gt $IDX.EFR)  { ($cols[$IDX.EFR]).Trim()  } else { "" }
    $vigRaw   = if ($cols.Count -gt $IDX.EVIG) { ($cols[$IDX.EVIG]).Trim() } else { "" }

    $workers.Add([PSCustomObject]@{
        Linea       = $lineNum
        CC          = & $get $IDX.CC
        AP1         = & $get $IDX.AP1
        AP2         = & $get $IDX.AP2
        N1          = & $get $IDX.N1
        N2          = & $get $IDX.N2
        Act         = & $get $IDX.ACT
        RUT_Orig    = $rut
        RUT_Norm    = NormRUT $rut
        RUT_Fmt     = FormatRUT $rut
        RUT_OK      = ValidRUT $rut
        Cargo       = & $get $IDX.CARG
        FechaRaw    = $fechaRaw
        FechaISO    = ConvertDate $fechaRaw
        ExFechaRaw  = $exRaw
        ExFechaISO  = ConvertDate $exRaw
        ExVigRaw    = $vigRaw
        ExVigISO    = ConvertDate $vigRaw
        ExInst      = & $get $IDX.EINST
        ExNum       = & $get $IDX.ENUM
        Zapatos     = & $get $IDX.ZAP
        Camisa      = & $get $IDX.CAM
        Polera      = & $get $IDX.POL
        Chaleco     = & $get $IDX.CHAL
        Resp        = & $get $IDX.RESP
    })
    $lineNum++
}

# ---- CALCULAR ESTADISTICAS -----------------------------------
Write-Host "Calculando estadisticas..." -ForegroundColor Yellow

$total        = $workers.Count
$rutOK        = @($workers | Where-Object { $_.RUT_OK })
$rutMAL       = @($workers | Where-Object { -not $_.RUT_OK })
$sinNombre    = @($workers | Where-Object { [string]::IsNullOrWhiteSpace($_.N1) })
$sinApellido  = @($workers | Where-Object { [string]::IsNullOrWhiteSpace($_.AP1) })
$sinCargo     = @($workers | Where-Object { [string]::IsNullOrWhiteSpace($_.Cargo) })
$sinFecha     = @($workers | Where-Object { [string]::IsNullOrWhiteSpace($_.FechaRaw) })
$fechaMal     = @($workers | Where-Object { $_.FechaISO -like "FORMATO*" -or $_.FechaISO -like "ANIO*" })
$conExamen    = @($workers | Where-Object { -not [string]::IsNullOrWhiteSpace($_.ExFechaRaw) })

$rutGroups  = $workers | Group-Object -Property RUT_Norm
$dupes      = @($rutGroups | Where-Object { $_.Count -gt 1 })
$porCC      = $workers | Group-Object -Property CC    | Sort-Object Count -Descending
$porAct     = $workers | Group-Object -Property Act   | Sort-Object Count -Descending
$porCargo   = $workers | Group-Object -Property Cargo | Sort-Object Count -Descending

# ---- GENERAR REPORTE -----------------------------------------
Write-Host "Generando csv_analisis.md..." -ForegroundColor Yellow

$ts = Get-Date -Format "yyyy-MM-dd HH:mm"
$estadoGlobal = if ($rutMAL.Count -eq 0 -and $dupes.Count -eq 0 -and $fechaMal.Count -eq 0) {
    "LISTO para reconciliar"
} else {
    "REVISAR errores antes de continuar"
}

$sb = [System.Text.StringBuilder]::new()

$null = $sb.AppendLine("# Analisis CSV - PERSONAL NCC30")
$null = $sb.AppendLine("_Generado: $ts_  |  **$estadoGlobal**")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("---")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("## Resumen General")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("| Metrica | Valor | Estado |")
$null = $sb.AppendLine("|---|---|---|")
$null = $sb.AppendLine("| Total trabajadores | $total | -- |")
$null = $sb.AppendLine("| RUTs validos (digito OK) | $($rutOK.Count) | $(if($rutOK.Count -eq $total){'OK'}else{'REVISAR'}) |")
$null = $sb.AppendLine("| RUTs invalidos | $($rutMAL.Count) | $(if($rutMAL.Count -eq 0){'OK'}else{'ERROR'}) |")
$null = $sb.AppendLine("| Duplicados en CSV | $($dupes.Count) | $(if($dupes.Count -eq 0){'OK'}else{'ERROR'}) |")
$null = $sb.AppendLine("| Fechas ingreso vacias | $($sinFecha.Count) | $(if($sinFecha.Count -eq 0){'OK'}else{'AVISO'}) |")
$null = $sb.AppendLine("| Fechas ingreso invalidas | $($fechaMal.Count) | $(if($fechaMal.Count -eq 0){'OK'}else{'ERROR'}) |")
$null = $sb.AppendLine("| Sin nombre | $($sinNombre.Count) | $(if($sinNombre.Count -eq 0){'OK'}else{'ERROR'}) |")
$null = $sb.AppendLine("| Sin apellido | $($sinApellido.Count) | $(if($sinApellido.Count -eq 0){'OK'}else{'ERROR'}) |")
$null = $sb.AppendLine("| Sin cargo | $($sinCargo.Count) | $(if($sinCargo.Count -eq 0){'OK'}else{'AVISO'}) |")
$null = $sb.AppendLine("| Con examen ocupacional | $($conExamen.Count) | -- |")
$null = $sb.AppendLine("")

$null = $sb.AppendLine("---")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("## Distribucion por Centro de Costo")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("| Centro de Costo | Personas |")
$null = $sb.AppendLine("|---|---|")
foreach ($g in $porCC) {
    $nm = if ([string]::IsNullOrWhiteSpace($g.Name)) { "(vacio)" } else { $g.Name }
    $null = $sb.AppendLine("| $nm | $($g.Count) |")
}

$null = $sb.AppendLine("")
$null = $sb.AppendLine("---")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("## Distribucion por Categoria (Act)")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("| Act | Personas |")
$null = $sb.AppendLine("|---|---|")
foreach ($g in $porAct) {
    $nm = if ([string]::IsNullOrWhiteSpace($g.Name)) { "(vacio)" } else { $g.Name }
    $null = $sb.AppendLine("| $nm | $($g.Count) |")
}

$null = $sb.AppendLine("")
$null = $sb.AppendLine("---")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("## Top Cargos")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("| Cargo | Personas |")
$null = $sb.AppendLine("|---|---|")
foreach ($g in ($porCargo | Select-Object -First 12)) {
    $nm = if ([string]::IsNullOrWhiteSpace($g.Name)) { "(vacio)" } else { $g.Name }
    $null = $sb.AppendLine("| $nm | $($g.Count) |")
}

# Errores
if ($rutMAL.Count -gt 0) {
    $null = $sb.AppendLine("")
    $null = $sb.AppendLine("---")
    $null = $sb.AppendLine("")
    $null = $sb.AppendLine("## ERROR: RUTs con Digito Verificador Invalido")
    $null = $sb.AppendLine("")
    $null = $sb.AppendLine("> Estos RUTs no pasan la validacion chilena. Corregir antes de importar.")
    $null = $sb.AppendLine("")
    $null = $sb.AppendLine("| Linea | Nombre Completo | RUT Original |")
    $null = $sb.AppendLine("|---|---|---|")
    foreach ($w in $rutMAL) {
        $nom = "$($w.N1) $($w.AP1)".Trim()
        $null = $sb.AppendLine("| $($w.Linea) | $nom | $($w.RUT_Orig) |")
    }
}

if ($dupes.Count -gt 0) {
    $null = $sb.AppendLine("")
    $null = $sb.AppendLine("---")
    $null = $sb.AppendLine("")
    $null = $sb.AppendLine("## ERROR: RUTs Duplicados en el CSV")
    $null = $sb.AppendLine("")
    $null = $sb.AppendLine("> El mismo RUT aparece en mas de una fila. Solo se importara uno.")
    $null = $sb.AppendLine("")
    $null = $sb.AppendLine("| RUT Normalizado | Lineas | Nombres |")
    $null = $sb.AppendLine("|---|---|---|")
    foreach ($d in $dupes) {
        $lineas  = ($d.Group | ForEach-Object { $_.Linea }) -join ", "
        $nombres = ($d.Group | ForEach-Object { "$($_.N1) $($_.AP1)" }) -join " / "
        $null = $sb.AppendLine("| $($d.Name) | $lineas | $nombres |")
    }
}

if ($fechaMal.Count -gt 0) {
    $null = $sb.AppendLine("")
    $null = $sb.AppendLine("---")
    $null = $sb.AppendLine("")
    $null = $sb.AppendLine("## ERROR: Fechas de Ingreso con Problemas")
    $null = $sb.AppendLine("")
    $null = $sb.AppendLine("| Linea | Nombre | RUT | Fecha Original | Problema |")
    $null = $sb.AppendLine("|---|---|---|---|---|")
    foreach ($w in $fechaMal) {
        $prob = if ($w.FechaISO -like "ANIO*") { "Anio imposible" } else { "Formato no reconocido" }
        $null = $sb.AppendLine("| $($w.Linea) | $($w.N1) $($w.AP1) | $($w.RUT_Orig) | $($w.FechaRaw) | $prob |")
    }
}

# Lista completa
$null = $sb.AppendLine("")
$null = $sb.AppendLine("---")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("## Lista Completa (ordenada por Apellido)")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("| # | RUT | Nombre Completo | Cargo | Centro Costo | Ingreso ISO | RUT |")
$null = $sb.AppendLine("|---|---|---|---|---|---|---|")
$num = 1
foreach ($w in ($workers | Sort-Object AP1, N1)) {
    $icon   = if ($w.RUT_OK) { "OK" } else { "MAL" }
    $nombre = "$($w.N1) $($w.N2) $($w.AP1) $($w.AP2)".Trim() -replace "\s+", " "
    $null = $sb.AppendLine("| $num | $($w.RUT_Fmt) | $nombre | $($w.Cargo) | $($w.CC) | $($w.FechaISO) | $icon |")
    $num++
}

$null = $sb.AppendLine("")
$null = $sb.AppendLine("---")
$null = $sb.AppendLine("_Proximo paso: ejecutar exportar_trabajadores.sql en Supabase y luego reconciliar_personal.ps1_")

$sb.ToString() | Out-File -FilePath $outputPath -Encoding UTF8

# ---- RESUMEN EN CONSOLA --------------------------------------
Write-Host ""
Write-Host "============================================" -ForegroundColor DarkGreen
Write-Host "  Analisis completado" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor DarkGreen
Write-Host ""
Write-Host "  Total trabajadores  : $total" -ForegroundColor White
Write-Host "  RUTs validos        : $($rutOK.Count)" -ForegroundColor $(if($rutOK.Count -eq $total){"Green"}else{"Red"})
Write-Host "  RUTs invalidos      : $($rutMAL.Count)" -ForegroundColor $(if($rutMAL.Count -gt 0){"Red"}else{"Green"})
Write-Host "  Duplicados          : $($dupes.Count)" -ForegroundColor $(if($dupes.Count -gt 0){"Red"}else{"Green"})
Write-Host "  Fechas invalidas    : $($fechaMal.Count)" -ForegroundColor $(if($fechaMal.Count -gt 0){"Yellow"}else{"Green"})
Write-Host "  Con examen medico   : $($conExamen.Count)" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Reporte: $outputPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "  PROXIMO PASO: Ejecuta exportar_trabajadores.sql en Supabase" -ForegroundColor Yellow
Write-Host "  y descarga el resultado como 'bd_trabajadores.csv' en esta carpeta." -ForegroundColor Yellow
Write-Host ""
