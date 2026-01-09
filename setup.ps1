# Script de setup inicial para Windows
# Ejecutar desde la raíz del proyecto

Write-Host "🚀 Pulso - Setup Inicial" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

# 1. Verificar Node.js
Write-Host "`n📦 Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "   Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ Node.js no encontrado. Instálalo desde https://nodejs.org" -ForegroundColor Red
    exit 1
}

# 2. Instalar dependencias
Write-Host "`n📦 Instalando dependencias..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Error instalando dependencias" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Dependencias instaladas" -ForegroundColor Green

# 3. Crear archivo .env si no existe
Write-Host "`n🔧 Configurando variables de entorno..." -ForegroundColor Yellow
$envPath = "apps\api\.env"
$envExamplePath = "apps\api\.env.example"

if (-not (Test-Path $envPath)) {
    if (Test-Path $envExamplePath) {
        Copy-Item $envExamplePath $envPath
        Write-Host "   ✅ Creado .env desde .env.example" -ForegroundColor Green
        Write-Host "   ⚠️  Edita apps/api/.env con tus credenciales" -ForegroundColor Yellow
    } else {
        Write-Host "   ⚠️  No se encontró .env.example" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✅ .env ya existe" -ForegroundColor Green
}

# 4. Verificar PostgreSQL
Write-Host "`n🐘 Verificando PostgreSQL..." -ForegroundColor Yellow
$pgVersion = psql --version 2>$null
if ($pgVersion) {
    Write-Host "   PostgreSQL: $pgVersion" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  psql no encontrado en PATH" -ForegroundColor Yellow
    Write-Host "   Asegúrate de tener PostgreSQL instalado" -ForegroundColor Yellow
}

# 5. Instrucciones finales
Write-Host "`n✅ Setup completado!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Edita apps/api/.env con tus credenciales"
Write-Host "  2. Crea la base de datos:"
Write-Host "     createdb -U postgres pulso_db"
Write-Host "  3. Ejecuta el schema:"
Write-Host "     cd database && psql -U postgres -d pulso_db -f init.sql"
Write-Host "  4. Inicia el servidor:"
Write-Host "     npm run dev:api"
Write-Host ""
Write-Host "📚 Documentación: apps/api/API_DOCS.md" -ForegroundColor Cyan
