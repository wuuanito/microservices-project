# Configuración de colores para PowerShell
$Green = [System.ConsoleColor]::Green
$Blue = [System.ConsoleColor]::Blue
$Yellow = [System.ConsoleColor]::Yellow
$Red = [System.ConsoleColor]::Red

Write-Host "=======================================================" -ForegroundColor $Blue
Write-Host "Iniciando proyecto de microservicios" -ForegroundColor $Green
Write-Host "=======================================================" -ForegroundColor $Blue

# Verificar si Docker está instalado
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker no está instalado. Por favor, instálalo primero." -ForegroundColor $Red
    exit 1
}

# Verificar si Docker Compose está instalado
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "Docker Compose no está instalado. Por favor, instálalo primero." -ForegroundColor $Red
    exit 1
}

# Verificar la base de datos MySQL
Write-Host "Verificando bases de datos MySQL locales..." -ForegroundColor $Yellow
Write-Host "Asegúrate de que MySQL esté en ejecución y que las bases de datos 'auth_service_db' y 'calendar_service_db' existan." -ForegroundColor $Yellow
Write-Host "Puedes crearlas manualmente con:" -ForegroundColor $Yellow
Write-Host "  CREATE DATABASE IF NOT EXISTS auth_service_db;" -ForegroundColor $Yellow
Write-Host "  CREATE DATABASE IF NOT EXISTS calendar_service_db;" -ForegroundColor $Yellow

# Construir y levantar los contenedores Docker
Write-Host "Construyendo y levantando los contenedores Docker..." -ForegroundColor $Yellow
docker-compose build
docker-compose up -d

# Verificar el estado de los contenedores
Write-Host "Verificando el estado de los contenedores..." -ForegroundColor $Yellow
docker-compose ps

# Ejecutar sincronización/migraciones de las bases de datos
Write-Host "Ejecutando sincronización/migraciones de las bases de datos..." -ForegroundColor $Yellow
Write-Host "Sincronizando base de datos para Auth Service..." -ForegroundColor $Yellow
docker-compose exec auth-service npm run migrate
Write-Host "Sincronizando base de datos para Calendar Service..." -ForegroundColor $Yellow
docker-compose exec calendar-service npm run sync-db


Write-Host "=======================================================" -ForegroundColor $Blue
Write-Host "Servicios iniciados correctamente" -ForegroundColor $Green
Write-Host "API Gateway: http://localhost:3000" -ForegroundColor $Yellow
Write-Host "Frontend Service: http://localhost:5173" -ForegroundColor $Yellow
Write-Host "Auth Service (directo): http://localhost:4001" -ForegroundColor $Yellow
Write-Host "Calendar Service (directo): http://localhost:3003" -ForegroundColor $Yellow
Write-Host "=======================================================" -ForegroundColor $Blue