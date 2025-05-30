param(
    [Parameter(Mandatory=$true)]
    [string]$Service
)

# Configuración de colores para PowerShell
$Green = [System.ConsoleColor]::Green
$Blue = [System.ConsoleColor]::Blue
$Yellow = [System.ConsoleColor]::Yellow
$Red = [System.ConsoleColor]::Red

if ($Service -eq "all") {
    Write-Host "=======================================================" -ForegroundColor $Blue
    Write-Host "Mostrando logs de todos los servicios" -ForegroundColor $Yellow
    Write-Host "=======================================================" -ForegroundColor $Blue
    docker-compose logs -f
}
else {
    Write-Host "=======================================================" -ForegroundColor $Blue
    Write-Host "Mostrando logs del servicio: $Service" -ForegroundColor $Yellow
    Write-Host "=======================================================" -ForegroundColor $Blue
    docker-compose logs -f $Service
}