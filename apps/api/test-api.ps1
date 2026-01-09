#!/usr/bin/env pwsh
# Script de Testing Manual para PULSO API
# Uso: .\test-api.ps1

$BASE_URL = "http://localhost:3000/api/v1"
$TOKEN = $null

Write-Host "🧪 PULSO API - Script de Testing" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Función helper para hacer requests
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [bool]$UseAuth = $false
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($UseAuth -and $TOKEN) {
        $headers["Authorization"] = "Bearer $TOKEN"
    }
    
    $params = @{
        Method = $Method
        Uri = "$BASE_URL$Endpoint"
        Headers = $headers
    }
    
    if ($Body) {
        $params.Body = ($Body | ConvertTo-Json -Depth 10)
    }
    
    try {
        $response = Invoke-RestMethod @params
        Write-Host "✅ $Method $Endpoint" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "❌ $Method $Endpoint - Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "   Detalles: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
        }
        return $null
    }
}

# ============================================
# 1. HEALTH CHECK
# ============================================
Write-Host "`n📋 1. HEALTH CHECK" -ForegroundColor Yellow
$health = Invoke-ApiRequest -Method "GET" -Endpoint "/../health"
if ($health) {
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
}

# ============================================
# 2. AUTENTICACIÓN
# ============================================
Write-Host "`n🔐 2. AUTENTICACIÓN" -ForegroundColor Yellow

# Datos de prueba
$testEmail = "test-$(Get-Random)@pulso.com"
$testPassword = "Test123!@#"

# 2.1 Registro
Write-Host "`n   2.1 Registro de usuario" -ForegroundColor White
$registerBody = @{
    empresa = @{
        razon_social = "Test PyME SRL"
        cuit = "30-12345678-9"
    }
    usuario = @{
        nombre = "Usuario Test"
        email = $testEmail
        password = $testPassword
    }
}

$registerResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/register" -Body $registerBody
if ($registerResponse -and $registerResponse.data.token) {
    $TOKEN = $registerResponse.data.token
    Write-Host "   Token obtenido: $($TOKEN.Substring(0, 20))..." -ForegroundColor Gray
}

# 2.2 Login
Write-Host "`n   2.2 Login" -ForegroundColor White
$loginBody = @{
    email = $testEmail
    password = $testPassword
}

$loginResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body $loginBody
if ($loginResponse) {
    $TOKEN = $loginResponse.data.token
}

# 2.3 Usuario actual
Write-Host "`n   2.3 Obtener usuario actual" -ForegroundColor White
$meResponse = Invoke-ApiRequest -Method "GET" -Endpoint "/auth/me" -UseAuth $true
if ($meResponse) {
    Write-Host "   Usuario: $($meResponse.data.nombre)" -ForegroundColor Gray
    Write-Host "   Email: $($meResponse.data.email)" -ForegroundColor Gray
}

# ============================================
# 3. CATEGORÍAS
# ============================================
Write-Host "`n🏷️  3. CATEGORÍAS" -ForegroundColor Yellow
$categorias = Invoke-ApiRequest -Method "GET" -Endpoint "/categorias" -UseAuth $true
if ($categorias) {
    Write-Host "   Total categorías: $($categorias.data.Count)" -ForegroundColor Gray
    $categoriaIngreso = $categorias.data | Where-Object { $_.tipo -eq "ingreso" } | Select-Object -First 1
    $categoriaEgreso = $categorias.data | Where-Object { $_.tipo -eq "egreso" } | Select-Object -First 1
    Write-Host "   Ejemplo ingreso: $($categoriaIngreso.nombre)" -ForegroundColor Gray
    Write-Host "   Ejemplo egreso: $($categoriaEgreso.nombre)" -ForegroundColor Gray
}

# ============================================
# 4. CUENTAS BANCARIAS
# ============================================
Write-Host "`n🏦 4. CUENTAS BANCARIAS" -ForegroundColor Yellow

# 4.1 Crear cuenta manual
Write-Host "`n   4.1 Crear cuenta manual" -ForegroundColor White
$cuentaBody = @{
    nombre_cuenta = "Cuenta Test Manual"
    proveedor = "manual"
    saldo_inicial = 100000
    moneda = "ARS"
}

$cuentaResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/cuentas" -Body $cuentaBody -UseAuth $true
$cuentaId = $null
if ($cuentaResponse) {
    $cuentaId = $cuentaResponse.data.id
    Write-Host "   ID: $cuentaId" -ForegroundColor Gray
}

# 4.2 Listar cuentas
Write-Host "`n   4.2 Listar cuentas" -ForegroundColor White
$cuentas = Invoke-ApiRequest -Method "GET" -Endpoint "/cuentas" -UseAuth $true
if ($cuentas) {
    Write-Host "   Total: $($cuentas.data.cuentas.Count)" -ForegroundColor Gray
}

# 4.3 Intentar crear 6ta cuenta (debería fallar)
Write-Host "`n   4.3 Test límite de 5 cuentas" -ForegroundColor White
for ($i = 2; $i -le 6; $i++) {
    $body = @{
        nombre_cuenta = "Cuenta Test $i"
        proveedor = "manual"
        saldo_inicial = 0
    }
    $result = Invoke-ApiRequest -Method "POST" -Endpoint "/cuentas" -Body $body -UseAuth $true
    if ($i -eq 6 -and !$result) {
        Write-Host "   ✅ Límite funcionando correctamente" -ForegroundColor Green
    }
}

# ============================================
# 5. MOVIMIENTOS
# ============================================
Write-Host "`n💸 5. MOVIMIENTOS" -ForegroundColor Yellow

if ($cuentaId) {
    # 5.1 Crear movimiento manual
    Write-Host "`n   5.1 Crear movimiento ingreso" -ForegroundColor White
    $movimientoBody = @{
        cuenta_id = $cuentaId
        categoria_id = $categoriaIngreso.id
        monto = 50000
        tipo = "ingreso"
        descripcion = "Venta de prueba"
        fecha_transaccion = (Get-Date).ToString("yyyy-MM-dd")
    }
    
    $movResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/movimientos" -Body $movimientoBody -UseAuth $true
    $movimientoId = $null
    if ($movResponse) {
        $movimientoId = $movResponse.data.id
    }
    
    # 5.2 Crear movimiento egreso
    Write-Host "`n   5.2 Crear movimiento egreso" -ForegroundColor White
    $egresoBody = @{
        cuenta_id = $cuentaId
        categoria_id = $categoriaEgreso.id
        monto = 15000
        tipo = "egreso"
        descripcion = "Compra suministros"
        fecha_transaccion = (Get-Date).ToString("yyyy-MM-dd")
    }
    
    Invoke-ApiRequest -Method "POST" -Endpoint "/movimientos" -Body $egresoBody -UseAuth $true
    
    # 5.3 Listar movimientos
    Write-Host "`n   5.3 Listar movimientos" -ForegroundColor White
    $movimientos = Invoke-ApiRequest -Method "GET" -Endpoint "/movimientos?page=1&limit=10" -UseAuth $true
    if ($movimientos) {
        Write-Host "   Total: $($movimientos.data.pagination.total)" -ForegroundColor Gray
    }
    
    # 5.4 Intentar eliminar movimiento manual
    Write-Host "`n   5.4 Eliminar movimiento manual" -ForegroundColor White
    if ($movimientoId) {
        Invoke-ApiRequest -Method "DELETE" -Endpoint "/movimientos/$movimientoId" -UseAuth $true
    }
}

# ============================================
# 6. DASHBOARD
# ============================================
Write-Host "`n📊 6. DASHBOARD" -ForegroundColor Yellow

# 6.1 Resumen completo
Write-Host "`n   6.1 Resumen dashboard" -ForegroundColor White
$dashboard = Invoke-ApiRequest -Method "GET" -Endpoint "/dashboard" -UseAuth $true
if ($dashboard) {
    Write-Host "   Cash total: $($dashboard.data.cash_total)" -ForegroundColor Gray
    Write-Host "   Ingresos mes: $($dashboard.data.mes_actual.ingresos)" -ForegroundColor Gray
    Write-Host "   Egresos mes: $($dashboard.data.mes_actual.egresos)" -ForegroundColor Gray
}

# 6.2 Solo KPIs
Write-Host "`n   6.2 Solo KPIs" -ForegroundColor White
$kpis = Invoke-ApiRequest -Method "GET" -Endpoint "/dashboard/kpis" -UseAuth $true

# ============================================
# 7. ALERTAS
# ============================================
Write-Host "`n🚨 7. ALERTAS" -ForegroundColor Yellow

# 7.1 Listar alertas
Write-Host "`n   7.1 Listar alertas" -ForegroundColor White
$alertas = Invoke-ApiRequest -Method "GET" -Endpoint "/alertas" -UseAuth $true
if ($alertas) {
    Write-Host "   Total alertas: $($alertas.total)" -ForegroundColor Gray
}

# 7.2 Forzar evaluación
Write-Host "`n   7.2 Evaluar alertas" -ForegroundColor White
Invoke-ApiRequest -Method "POST" -Endpoint "/alertas/evaluar" -UseAuth $true

# ============================================
# 8. PROYECCIONES
# ============================================
Write-Host "`n📈 8. PROYECCIONES" -ForegroundColor Yellow

# 8.1 Obtener proyección
Write-Host "`n   8.1 Proyección 30 días" -ForegroundColor White
$proyeccion = Invoke-ApiRequest -Method "GET" -Endpoint "/proyecciones?dias=30" -UseAuth $true

# 8.2 Generar nueva
Write-Host "`n   8.2 Generar proyección" -ForegroundColor White
$genBody = @{
    dias = 30
    escenarios = @("optimista", "realista", "pesimista")
}
Invoke-ApiRequest -Method "POST" -Endpoint "/proyecciones/generar" -Body $genBody -UseAuth $true

# ============================================
# 9. IA CLASIFICACIÓN
# ============================================
Write-Host "`n🤖 9. IA CLASIFICACIÓN" -ForegroundColor Yellow

if ($movimientoId) {
    Write-Host "`n   9.1 Clasificar movimiento" -ForegroundColor White
    $iaBody = @{
        movimiento_id = $movimientoId
    }
    Invoke-ApiRequest -Method "POST" -Endpoint "/ia/clasificar" -Body $iaBody -UseAuth $true
}

# ============================================
# 10. ONBOARDING
# ============================================
Write-Host "`n🎯 10. ONBOARDING" -ForegroundColor Yellow

# 10.1 Estado
Write-Host "`n   10.1 Estado de onboarding" -ForegroundColor White
$onboarding = Invoke-ApiRequest -Method "GET" -Endpoint "/onboarding/estado" -UseAuth $true
if ($onboarding) {
    Write-Host "   Completado: $($onboarding.data.completado)" -ForegroundColor Gray
    Write-Host "   Progreso: $($onboarding.data.progreso_porcentaje)%" -ForegroundColor Gray
}

# ============================================
# RESUMEN FINAL
# ============================================
Write-Host "`n" -NoNewline
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "🎉 Testing completado!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "`nNota: Revisa los ❌ para ver qué endpoints fallaron" -ForegroundColor Yellow
Write-Host "Token de prueba guardado en `$TOKEN para requests adicionales`n" -ForegroundColor Gray
