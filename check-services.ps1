# ===============================================
# Check Which Services Are Running
# ===============================================

Write-Host "Checking Running Services" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

function Test-Port {
    param(
        [string]$ServiceName,
        [int]$Port
    )
    
    Write-Host "Testing $ServiceName (Port $Port)..." -ForegroundColor Yellow
    
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Write-Host "  ✓ Running on port $Port" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ✗ Not running on port $Port" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "  ✗ Not running on port $Port" -ForegroundColor Red
        return $false
    }
}

# Check each service
$apiGateway = Test-Port "API Gateway" 3000
$petService = Test-Port "Pet Service" 3001
$adoptionService = Test-Port "Adoption Service" 3002
$authService = Test-Port "Auth Service" 3003
$analyticsService = Test-Port "Analytics Service" 3004

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "========" -ForegroundColor Cyan

if ($apiGateway -and $petService -and $adoptionService -and $authService -and $analyticsService) {
    Write-Host "✓ All services are running!" -ForegroundColor Green
} else {
    Write-Host "✗ Some services are NOT running" -ForegroundColor Red
    Write-Host ""
    Write-Host "To start missing services:" -ForegroundColor Yellow
    
    if (-not $apiGateway) {
        Write-Host "  cd api-gateway && npm start" -ForegroundColor Yellow
    }
    if (-not $petService) {
        Write-Host "  cd backend/pet-service && npm start" -ForegroundColor Yellow
    }
    if (-not $adoptionService) {
        Write-Host "  cd backend/adoption-service && npm start" -ForegroundColor Yellow
    }
    if (-not $authService) {
        Write-Host "  cd backend/auth-service && npm start" -ForegroundColor Yellow
    }
    if (-not $analyticsService) {
        Write-Host "  cd backend/analytics-service && npm start" -ForegroundColor Yellow
    }
}

Write-Host ""
