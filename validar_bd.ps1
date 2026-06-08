# ============================================================
# validar_bd.ps1
# Analiza bd_trabajadores.csv (export de Supabase) y genera
# bd_auditoria.md con un reporte completo de calidad de datos.
# Uso: .\validar_bd.ps1
# ============================================================
param()

$ErrorActionPreference = "Stop"
$scriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$bdPath     = Join-Path $scriptDir "bd_trabajadores.csv"
$outputPath = Join-Path $scriptDir "bd_auditoria.md"

Write-Host ""
Write-Host "============================================" -ForegroundColor DarkCyan
Write-Host "  Validacion de bd_trabajadores.csv" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor DarkCyan
Write-Host ""

if (-not (Test-Path $bdPath)) {
    Write-Host "ERROR: No se encontro bd_trabajadores.csv" -ForegroundColor Red
    Write-Host "  Ejecuta primero exportar_trabajadores.sql en Supabase." -ForegroundColor Yellow
    exit 1
}

# ---- FUNCIONES -----------------------------------------------

function NormRUT([string]$r) {
    return $r.Trim().Replace(".", "").Replace("-", "").Replace(" ", "").ToUpper()
}

function FormatRUT([string]$raw) {
    # Convierte "178313290" -> "17.831.329-0"
    $n = NormRUT $raw
    # Quitar posible K al final si ya esta normalizado sin guion
    if ($n -match "^(\d+)([0-9K])$" -and $n.Length -ge 2) {
        $num = $n.Substring(0, $n.Length - 1)
        $dv  = $n.Substring($n.Length - 1, 1)
        $numF = "{0:N0}" -f [long]$num
        return "$($numF.Replace(',','.'))-$dv"
    }
    return $raw.Trim()
}

function ValidRUT([string]$rut) {
    # Acepta tanto "178313290" como "17.831.329-0"
    $n = NormRUT $rut
    # Si no tiene guion, asumir ultimo char es DV
    $numStr = ""; $dv = ""
    if ($n -match "^(\d{1,8})-([0-9K])$") {
        $numStr = $Matches[1]; $dv = $Matches[2]
    } elseif ($n -match "^(\d{2,9})([0-9K])$") {
        $numStr = $Matches[1]; $dv = $Matches[2]
    } else { return $false }
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

# ---- CARGAR BD -----------------------------------------------
Write-Host "Cargando bd_trabajadores.csv..." -ForegroundColor Yellow
$bd = Import-Csv -Path $bdPath -Encoding UTF8
Write-Host "  -> $($bd.Count) registros" -ForegroundColor White

# ---- CALCULAR ESTADISTICAS -----------------------------------
Write-Host "Calculando estadisticas..." -ForegroundColor Yellow

$total = $bd.Count

# Campos criticos vacios
$check = @{
    "numero_identificacion" = @($bd | Where-Object { [string]::IsNullOrWhiteSpace($_.numero_identificacion) })
    "apellido_paterno"      = @($bd | Where-Object { [string]::IsNullOrWhiteSpace($_.apellido_paterno) })
    "nombre_1"              = @($bd | Where-Object { [string]::IsNullOrWhiteSpace($_.nombre_1) })
    "cargo"                 = @($bd | Where-Object { [string]::IsNullOrWhiteSpace($_.cargo) -or $_.cargo -eq "null" })
    "fecha_ingreso"         = @($bd | Where-Object { [string]::IsNullOrWhiteSpace($_.fecha_ingreso) })
    "email_corporativo"     = @($bd | Where-Object { [string]::IsNullOrWhiteSpace($_.email_corporativo) })
    "celular_personal"      = @($bd | Where-Object { [string]::IsNullOrWhiteSpace($_.celular_personal) })
    "sexo"                  = @($bd | Where-Object { [string]::IsNullOrWhiteSpace($_.sexo) -or $_.sexo -eq "null" })
    "nacionalidad"          = @($bd | Where-Object { [string]::IsNullOrWhiteSpace($_.nacionalidad) -or $_.nacionalidad -eq "null" })
    "tipo_contrato"         = @($bd | Where-Object { [string]::IsNullOrWhiteSpace($_.tipo_contrato) })
    "modalidad_trabajo"     = @($bd | Where-Object { [string]::IsNullOrWhiteSpace($_.modalidad_trabajo) })
}

# RUT validacion y formato
$rutSinFormato  = @($bd | Where-Object { $_.numero_identificacion -notmatch "\." -and $_.numero_identificacion -notmatch "-" })
$rutConFormato  = @($bd | Where-Object { $_.numero_identificacion -match "\." -or $_.numero_identificacion -match "-" })
$rutInvalidos   = @($bd | Where-Object { -not (ValidRUT $_.numero_identificacion) })
$rutDuplicados  = @($bd | Group-Object numero_identificacion | Where-Object { $_.Count -gt 1 })

# Telefono sin +56
$telSinPrefijo  = @($bd | Where-Object { 
    -not [string]::IsNullOrWhiteSpace($_.celular_personal) -and 
    $_.celular_personal -ne "null" -and
    $_.celular_personal -notmatch "^\+56" 
})

# Emails especiales
$emailGenerico  = @($bd | Where-Object { 
    $_.email_corporativo -match "^soporte@|^admin@|^info@|^contacto@" 
})
$emailPendiente = @($bd | Where-Object { $_.email_corporativo -match "PENDIENTE" })

# Cargo null
$sinCargo = @($bd | Where-Object { [string]::IsNullOrWhiteSpace($_.cargo) -or $_.cargo -eq "null" })

# Distribuciones
$porSexo        = $bd | Group-Object sexo         | Sort-Object Count -Descending
$porNacional    = $bd | Group-Object nacionalidad  | Sort-Object Count -Descending
$porContrato    = $bd | Group-Object tipo_contrato | Sort-Object Count -Descending
$porModalidad   = $bd | Group-Object modalidad_trabajo | Sort-Object Count -Descending
$porTipoID      = $bd | Group-Object tipo_identificacion | Sort-Object Count -Descending

# ---- GENERAR REPORTE -----------------------------------------
Write-Host "Generando bd_auditoria.md..." -ForegroundColor Yellow

$ts = Get-Date -Format "yyyy-MM-dd HH:mm"

$totalProblemas = 0
foreach ($k in $check.Keys) { $totalProblemas += $check[$k].Count }
$totalProblemas += $rutInvalidos.Count + $rutDuplicados.Count + $telSinPrefijo.Count

$estado = if ($totalProblemas -eq 0) { "SIN PROBLEMAS CRITICOS" } else { "REVISAR: $totalProblemas items requieren atencion" }

$sb = [System.Text.StringBuilder]::new()
$null = $sb.AppendLine("# Auditoria de BD - bd_trabajadores")
$null = $sb.AppendLine("_Generado: $ts_  |  **$estado**")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("---")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("## Resumen General")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("| Metrica | Valor | Estado |")
$null = $sb.AppendLine("|---|---|---|")
$null = $sb.AppendLine("| Total registros en BD | $total | -- |")
$null = $sb.AppendLine("| RUTs sin formato (sin . y -) | $($rutSinFormato.Count) | $(if($rutSinFormato.Count -gt 0){'NORMALIZAR'}else{'OK'}) |")
$null = $sb.AppendLine("| RUTs con formato estandar | $($rutConFormato.Count) | -- |")
$null = $sb.AppendLine("| RUTs con digito invalido | $($rutInvalidos.Count) | $(if($rutInvalidos.Count -eq 0){'OK'}else{'ERROR'}) |")
$null = $sb.AppendLine("| RUTs duplicados | $($rutDuplicados.Count) | $(if($rutDuplicados.Count -eq 0){'OK'}else{'ERROR'}) |")
$null = $sb.AppendLine("| Telefonos sin prefijo +56 | $($telSinPrefijo.Count) | $(if($telSinPrefijo.Count -gt 0){'NORMALIZAR'}else{'OK'}) |")
$null = $sb.AppendLine("| Emails genericos | $($emailGenerico.Count) | $(if($emailGenerico.Count -gt 0){'REVISAR'}else{'OK'}) |")
$null = $sb.AppendLine("| Emails PENDIENTE | $($emailPendiente.Count) | $(if($emailPendiente.Count -gt 0){'COMPLETAR'}else{'OK'}) |")
$null = $sb.AppendLine("| sexo = null | $($check['sexo'].Count) | $(if($check['sexo'].Count -eq 0){'OK'}else{'COMPLETAR'}) |")
$null = $sb.AppendLine("| nacionalidad = null | $($check['nacionalidad'].Count) | $(if($check['nacionalidad'].Count -eq 0){'OK'}else{'COMPLETAR'}) |")
$null = $sb.AppendLine("| cargo = null | $($check['cargo'].Count) | $(if($check['cargo'].Count -eq 0){'OK'}else{'REVISAR'}) |")
$null = $sb.AppendLine("")

# ---- FORMATO RUT ---------------------------------------------
$null = $sb.AppendLine("---")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("## Formato de RUT en la BD")
$null = $sb.AppendLine("")
if ($rutSinFormato.Count -gt 0) {
    $null = $sb.AppendLine("> [!WARNING]")
    $null = $sb.AppendLine("> Los RUTs en la BD estan almacenados SIN puntos ni guion (ej: ``178313290``).")
    $null = $sb.AppendLine("> El CSV usa formato estandar (ej: ``17.831.329-0``).")
    $null = $sb.AppendLine("> Se recomienda estandarizar la BD antes de reconciliar.")
    $null = $sb.AppendLine("")
    $null = $sb.AppendLine("**Muestra de RUTs actuales en BD:**")
    $null = $sb.AppendLine("")
    $null = $sb.AppendLine("| RUT en BD (actual) | Formato estandar |")
    $null = $sb.AppendLine("|---|---|")
    foreach ($r in ($bd | Select-Object -First 8)) {
        $fmt = FormatRUT $r.numero_identificacion
        $null = $sb.AppendLine("| ``$($r.numero_identificacion)`` | ``$fmt`` |")
    }
    $null = $sb.AppendLine("")
    $null = $sb.AppendLine("Se genero ``estandarizar_ruts_bd.sql`` para corregir esto antes de importar.")
    $null = $sb.AppendLine("")
} else {
    $null = $sb.AppendLine("OK — Los RUTs ya tienen formato estandar con puntos y guion.")
    $null = $sb.AppendLine("")
}

# ---- RUTs INVALIDOS ------------------------------------------
if ($rutInvalidos.Count -gt 0) {
    $null = $sb.AppendLine("---")
    $null = $sb.AppendLine("")
    $null = $sb.AppendLine("## ERROR: RUTs con Digito Verificador Invalido en BD")
    $null = $sb.AppendLine("")
    $null = $sb.AppendLine("> [!CAUTION]")
    $null = $sb.AppendLine("> Estos RUTs no pasan la validacion del digito verificador. Corregir en BD.")
    $null = $sb.AppendLine("")
    $null = $sb.AppendLine("| id_trabajador | Nombre | RUT Actual | RUT Formateado |")
    $null = $sb.AppendLine("|---|---|---|---|")
    foreach ($r in $rutInvalidos) {
        $nombre = "$($r.nombre_1) $($r.apellido_paterno)".Trim()
        $fmt = FormatRUT $r.numero_identificacion
        $null = $sb.AppendLine("| $($r.id_trabajador) | $nombre | ``$($r.numero_identificacion)`` | ``$fmt`` |")
    }
    $null = $sb.AppendLine("")
}

# ---- CAMPOS NULL ---------------------------------------------
$null = $sb.AppendLine("---")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("## Campos Vacios / Null por Campo")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("| Campo | Registros vacios | % |")
$null = $sb.AppendLine("|---|---|---|")
foreach ($k in ($check.Keys | Sort-Object)) {
    $cnt = $check[$k].Count
    $pct = [math]::Round(($cnt / $total) * 100, 1)
    $null = $sb.AppendLine("| ``$k`` | $cnt | $pct% |")
}
$null = $sb.AppendLine("")

# Detalle de campos null criticos
if ($check["sexo"].Count -gt 0) {
    $null = $sb.AppendLine("### Registros con sexo vacio")
    $null = $sb.AppendLine("")
    $null = $sb.AppendLine("| id_trabajador | Nombre | RUT |")
    $null = $sb.AppendLine("|---|---|---|")
    foreach ($r in $check["sexo"]) {
        $nombre = "$($r.nombre_1) $($r.apellido_paterno)".Trim()
        $null = $sb.AppendLine("| $($r.id_trabajador) | $nombre | $($r.numero_identificacion) |")
    }
    $null = $sb.AppendLine("")
}

if ($check["nacionalidad"].Count -gt 0) {
    $null = $sb.AppendLine("### Registros con nacionalidad vacia")
    $null = $sb.AppendLine("")
    $null = $sb.AppendLine("| id_trabajador | Nombre | RUT |")
    $null = $sb.AppendLine("|---|---|---|")
    foreach ($r in $check["nacionalidad"]) {
        $nombre = "$($r.nombre_1) $($r.apellido_paterno)".Trim()
        $null = $sb.AppendLine("| $($r.id_trabajador) | $nombre | $($r.numero_identificacion) |")
    }
    $null = $sb.AppendLine("")
}

if ($sinCargo.Count -gt 0) {
    $null = $sb.AppendLine("### Registros con cargo vacio")
    $null = $sb.AppendLine("")
    $null = $sb.AppendLine("| id_trabajador | Nombre | RUT | email |")
    $null = $sb.AppendLine("|---|---|---|---|")
    foreach ($r in $sinCargo) {
        $nombre = "$($r.nombre_1) $($r.apellido_paterno)".Trim()
        $null = $sb.AppendLine("| $($r.id_trabajador) | $nombre | $($r.numero_identificacion) | $($r.email_corporativo) |")
    }
    $null = $sb.AppendLine("")
}

# ---- TELEFONOS -----------------------------------------------
$null = $sb.AppendLine("---")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("## Telefonos sin Prefijo +56")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("Total: **$($telSinPrefijo.Count)** registros necesitan agregar +56")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("> El script ``limpiar_bd.sql`` corrige esto con: ``UPDATE trabajadores SET celular_personal = '+56' || celular_personal``")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("**Muestra (primeros 5):**")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("| Nombre | Celular actual | Celular corregido |")
$null = $sb.AppendLine("|---|---|---|")
foreach ($r in ($telSinPrefijo | Select-Object -First 5)) {
    $nombre = "$($r.nombre_1) $($r.apellido_paterno)".Trim()
    $null = $sb.AppendLine("| $nombre | $($r.celular_personal) | +56$($r.celular_personal) |")
}
$null = $sb.AppendLine("")

# ---- EMAILS ESPECIALES ---------------------------------------
if ($emailGenerico.Count -gt 0 -or $emailPendiente.Count -gt 0) {
    $null = $sb.AppendLine("---")
    $null = $sb.AppendLine("")
    $null = $sb.AppendLine("## Emails que Requieren Revision")
    $null = $sb.AppendLine("")
    if ($emailGenerico.Count -gt 0) {
        $null = $sb.AppendLine("### Emails genericos (no personales)")
        $null = $sb.AppendLine("")
        $null = $sb.AppendLine("| Nombre | Email actual |")
        $null = $sb.AppendLine("|---|---|")
        foreach ($r in $emailGenerico) {
            $nombre = "$($r.nombre_1) $($r.apellido_paterno)".Trim()
            $null = $sb.AppendLine("| $nombre | $($r.email_corporativo) |")
        }
        $null = $sb.AppendLine("")
    }
    if ($emailPendiente.Count -gt 0) {
        $null = $sb.AppendLine("### Emails marcados como PENDIENTE")
        $null = $sb.AppendLine("")
        $null = $sb.AppendLine("| Nombre | RUT |")
        $null = $sb.AppendLine("|---|---|")
        foreach ($r in $emailPendiente) {
            $nombre = "$($r.nombre_1) $($r.apellido_paterno)".Trim()
            $null = $sb.AppendLine("| $nombre | $($r.numero_identificacion) |")
        }
        $null = $sb.AppendLine("")
    }
}

# ---- DISTRIBUCIONES ------------------------------------------
$null = $sb.AppendLine("---")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("## Distribuciones de Datos")
$null = $sb.AppendLine("")

$null = $sb.AppendLine("### Sexo")
$null = $sb.AppendLine("| Valor | Cantidad |")
$null = $sb.AppendLine("|---|---|")
foreach ($g in $porSexo) { $nm = if ([string]::IsNullOrWhiteSpace($g.Name) -or $g.Name -eq "null") { "(null)" } else { $g.Name }; $null = $sb.AppendLine("| $nm | $($g.Count) |") }
$null = $sb.AppendLine("")

$null = $sb.AppendLine("### Nacionalidad")
$null = $sb.AppendLine("| Valor | Cantidad |")
$null = $sb.AppendLine("|---|---|")
foreach ($g in $porNacional) { $nm = if ([string]::IsNullOrWhiteSpace($g.Name) -or $g.Name -eq "null") { "(null)" } else { $g.Name }; $null = $sb.AppendLine("| $nm | $($g.Count) |") }
$null = $sb.AppendLine("")

$null = $sb.AppendLine("### Tipo de Contrato")
$null = $sb.AppendLine("| Valor | Cantidad |")
$null = $sb.AppendLine("|---|---|")
foreach ($g in $porContrato) { $nm = if ([string]::IsNullOrWhiteSpace($g.Name)) { "(null)" } else { $g.Name }; $null = $sb.AppendLine("| $nm | $($g.Count) |") }
$null = $sb.AppendLine("")

$null = $sb.AppendLine("### Modalidad de Trabajo")
$null = $sb.AppendLine("| Valor | Cantidad |")
$null = $sb.AppendLine("|---|---|")
foreach ($g in $porModalidad) { $nm = if ([string]::IsNullOrWhiteSpace($g.Name)) { "(null)" } else { $g.Name }; $null = $sb.AppendLine("| $nm | $($g.Count) |") }
$null = $sb.AppendLine("")

# ---- LISTA COMPLETA ------------------------------------------
$null = $sb.AppendLine("---")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("## Lista Completa de la BD")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("| # | RUT Actual | Nombre Completo | Cargo | Contrato | Ingreso | Sexo | Nac. | RUT-DV |")
$null = $sb.AppendLine("|---|---|---|---|---|---|---|---|---|")
$num = 1
foreach ($r in ($bd | Sort-Object apellido_paterno, nombre_1)) {
    $nombre  = "$($r.nombre_1) $($r.apellido_paterno)".Trim()
    $rutOK   = if (ValidRUT $r.numero_identificacion) { "OK" } else { "MAL" }
    $cargo   = if ($r.cargo -eq "null" -or [string]::IsNullOrWhiteSpace($r.cargo)) { "(sin cargo)" } else { $r.cargo }
    $sexo    = if ($r.sexo -eq "null" -or [string]::IsNullOrWhiteSpace($r.sexo)) { "(null)" } else { $r.sexo }
    $nac     = if ($r.nacionalidad -eq "null" -or [string]::IsNullOrWhiteSpace($r.nacionalidad)) { "(null)" } else { $r.nacionalidad.Substring(0, [math]::Min(5, $r.nacionalidad.Length)) }
    $null = $sb.AppendLine("| $num | ``$($r.numero_identificacion)`` | $nombre | $cargo | $($r.tipo_contrato) | $($r.fecha_ingreso) | $sexo | $nac | $rutOK |")
    $num++
}
$null = $sb.AppendLine("")
$null = $sb.AppendLine("---")
$null = $sb.AppendLine("_Ver ``limpiar_bd.sql`` y ``estandarizar_ruts_bd.sql`` para corregir los problemas detectados._")

$sb.ToString() | Out-File -FilePath $outputPath -Encoding UTF8

# ---- RESUMEN EN CONSOLA --------------------------------------
Write-Host ""
Write-Host "============================================" -ForegroundColor DarkGreen
Write-Host "  Validacion completada" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor DarkGreen
Write-Host ""
Write-Host "  Total BD                : $total" -ForegroundColor White
Write-Host "  RUTs sin formato        : $($rutSinFormato.Count) (sin . ni -)" -ForegroundColor $(if($rutSinFormato.Count -gt 0){"Yellow"}else{"Green"})
Write-Host "  RUTs con digito invalido: $($rutInvalidos.Count)" -ForegroundColor $(if($rutInvalidos.Count -gt 0){"Red"}else{"Green"})
Write-Host "  RUTs duplicados         : $($rutDuplicados.Count)" -ForegroundColor $(if($rutDuplicados.Count -gt 0){"Red"}else{"Green"})
Write-Host "  Telefonos sin +56       : $($telSinPrefijo.Count)" -ForegroundColor $(if($telSinPrefijo.Count -gt 0){"Yellow"}else{"Green"})
Write-Host "  Sexo null               : $($check['sexo'].Count)" -ForegroundColor $(if($check['sexo'].Count -gt 0){"Yellow"}else{"Green"})
Write-Host "  Nacionalidad null       : $($check['nacionalidad'].Count)" -ForegroundColor $(if($check['nacionalidad'].Count -gt 0){"Yellow"}else{"Green"})
Write-Host "  Sin cargo               : $($check['cargo'].Count)" -ForegroundColor $(if($check['cargo'].Count -gt 0){"Yellow"}else{"Green"})
Write-Host "  Emails genericos        : $($emailGenerico.Count)" -ForegroundColor $(if($emailGenerico.Count -gt 0){"Yellow"}else{"Green"})
Write-Host ""
Write-Host "  Reporte: $outputPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "  PROXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "  1. Revisar bd_auditoria.md" -ForegroundColor White
Write-Host "  2. Ejecutar estandarizar_ruts_bd.sql en Supabase (si se decide estandarizar)" -ForegroundColor White
Write-Host "  3. Ejecutar limpiar_bd.sql en Supabase (telefono +56, nulls)" -ForegroundColor White
Write-Host "  4. Descargar bd_trabajadores.csv actualizado" -ForegroundColor White
Write-Host "  5. Ejecutar reconciliar_personal.ps1" -ForegroundColor White
Write-Host ""

