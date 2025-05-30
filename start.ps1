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
Write-Host "Verificando base de datos MySQL local..." -ForegroundColor $Yellow
Write-Host "Asegúrate de que MySQL esté en ejecución y que la base de datos 'auth_service_db' exista." -ForegroundColor $Yellow
Write-Host "Puedes crearla manualmente con: CREATE DATABASE IF NOT EXISTS auth_service_db;" -ForegroundColor $Yellow

# Construir y levantar los contenedores Docker
Write-Host "Construyendo y levantando los contenedores Docker..." -ForegroundColor $Yellow
docker-compose build
docker-compose up -d

# Verificar el estado de los contenedores
Write-Host "Verificando el estado de los contenedores..." -ForegroundColor $Yellow
docker-compose ps

# Ejecutar migraciones para el servicio de autenticación
Write-Host "Ejecutando migraciones de la base de datos..." -ForegroundColor $Yellow
docker-compose exec auth-service npm run migrate

# Opcional: Cargar datos de prueba
$response = Read-Host "¿Deseas cargar datos de prueba? (s/n)"
if ($response -eq "s" -or $response -eq "S") {
    Write-Host "Cargando datos de prueba..." -ForegroundColor $Yellow
    docker-compose exec auth-service npx sequelize-cli db:seed:all
}

Write-Host "=======================================================" -ForegroundColor $Blue
Write-Host "Servicios iniciados correctamente" -ForegroundColor $Green
Write-Host "API Gateway: http://localhost:3000" -ForegroundColor $Yellow
Write-Host "Auth Service: http://localhost:4001" -ForegroundColor $Yellow
Write-Host "Frontend: http://localhost:80" -ForegroundColor $Yellow
Write-Host "=======================================================" -ForegroundColor $Blue