# Configuración de colores para PowerShell
$Green = [System.ConsoleColor]::Green
$Blue = [System.ConsoleColor]::Blue
$Yellow = [System.ConsoleColor]::Yellow
$Red = [System.ConsoleColor]::Red

Write-Host "=======================================================" -ForegroundColor $Blue
Write-Host "Estado de los servicios" -ForegroundColor $Yellow
Write-Host "=======================================================" -ForegroundColor $Blue

# Verificar el estado de los contenedores
docker-compose ps

Write-Host "=======================================================" -ForegroundColor $Blue