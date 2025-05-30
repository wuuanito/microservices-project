# Configuración de colores para PowerShell
$Green = [System.ConsoleColor]::Green
$Blue = [System.ConsoleColor]::Blue
$Yellow = [System.ConsoleColor]::Yellow
$Red = [System.ConsoleColor]::Red

Write-Host "=======================================================" -ForegroundColor $Blue
Write-Host "Deteniendo proyecto de microservicios" -ForegroundColor $Yellow
Write-Host "=======================================================" -ForegroundColor $Blue

# Detener los contenedores
docker-compose down

Write-Host "Servicios detenidos correctamente" -ForegroundColor $Green
Write-Host "=======================================================" -ForegroundColor $Blue