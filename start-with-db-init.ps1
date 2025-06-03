#!/usr/bin/env pwsh

# Script para iniciar los microservicios con inicializacion automatica de bases de datos
# Este script se asegura de que las bases de datos existan antes de iniciar los contenedores

Write-Host "Iniciando Arquitectura de Microservicios con Sincronizacion Automatica de BD" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan

# Verificar si Node.js esta instalado
try {
    $nodeVersion = node --version
    Write-Host "Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js no esta instalado o no esta en el PATH" -ForegroundColor Red
    Write-Host "Por favor instala Node.js desde https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar si Docker esta instalado y ejecutandose
try {
    $dockerVersion = docker --version
    Write-Host "Docker detectado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Docker no esta instalado o no esta ejecutandose" -ForegroundColor Red
    Write-Host "Por favor instala Docker Desktop y asegurate de que este ejecutandose" -ForegroundColor Yellow
    exit 1
}

# Verificar si Docker Compose esta disponible
try {
    $composeVersion = docker-compose --version
    Write-Host "Docker Compose detectado: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Docker Compose no esta disponible" -ForegroundColor Red
    exit 1
}

# Instalar dependencias de Node.js si no existen
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias de Node.js..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error al instalar dependencias" -ForegroundColor Red
        exit 1
    }
    Write-Host "Dependencias instaladas correctamente" -ForegroundColor Green
}

# Inicializar bases de datos
Write-Host "Inicializando bases de datos..." -ForegroundColor Yellow
node init-databases.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al inicializar las bases de datos" -ForegroundColor Red
    Write-Host "" 
    Write-Host "Solucion alternativa:" -ForegroundColor Yellow
    Write-Host "1. Ejecuta el archivo 'create-databases-manual.sql' en tu cliente MySQL" -ForegroundColor Cyan
    Write-Host "2. O ejecuta estos comandos en MySQL:" -ForegroundColor Cyan
    Write-Host "   CREATE DATABASE IF NOT EXISTS auth_service_db;" -ForegroundColor White
    Write-Host "   CREATE DATABASE IF NOT EXISTS calendar_service_db;" -ForegroundColor White
    Write-Host "3. Luego ejecuta: docker-compose up -d" -ForegroundColor Cyan
    Write-Host "" 
    Write-Host "Presiona Enter para continuar sin inicializacion automatica o Ctrl+C para salir..." -ForegroundColor Yellow
    Read-Host
    Write-Host "Continuando sin inicializacion automatica de BD..." -ForegroundColor Yellow
}

# Construir imagenes Docker
Write-Host "Construyendo imagenes Docker..." -ForegroundColor Yellow
docker-compose build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al construir las imagenes Docker" -ForegroundColor Red
    exit 1
}

# Iniciar contenedores
Write-Host "Iniciando contenedores..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al iniciar los contenedores" -ForegroundColor Red
    exit 1
}

# Esperar un momento para que los servicios se inicialicen
Write-Host "Esperando que los servicios se inicialicen..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar el estado de los contenedores
Write-Host "Estado de los contenedores:" -ForegroundColor Cyan
docker-compose ps

Write-Host "" 
Write-Host "Microservicios iniciados exitosamente!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Servicios disponibles:" -ForegroundColor White
Write-Host "   API Gateway:      http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Auth Service:     http://localhost:4001" -ForegroundColor Cyan
Write-Host "   Calendar Service: http://localhost:3003" -ForegroundColor Cyan
Write-Host "" 
Write-Host "Comandos utiles:" -ForegroundColor White
Write-Host "   Ver logs:         docker-compose logs -f" -ForegroundColor Yellow
Write-Host "   Detener:          docker-compose down" -ForegroundColor Yellow
Write-Host "   Reiniciar:        docker-compose restart" -ForegroundColor Yellow
Write-Host "" 
Write-Host "Las bases de datos se sincronizaran automaticamente al iniciar cada servicio" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan