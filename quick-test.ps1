# ===============================================
# Quick API Test - Just the Essential Endpoints
# ===============================================

Write-Host "Quick API Test" -ForegroundColor Cyan
Write-Host "==============" -ForegroundColor Cyan
Write-Host ""

# Test API Gateway Health
Write-Host "[1] Testing API Gateway..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET
    Write-Host "✓ API Gateway is running!" -ForegroundColor Green
    $health | ConvertTo-Json | Write-Host
} catch {
    Write-Host "✗ API Gateway is NOT running on port 3000" -ForegroundColor Red
    Write-Host "Start it with: cd api-gateway; npm start" -ForegroundColor Yellow
}

Write-Host ""

# Test Analytics Stats (the main issue)
Write-Host "[2] Testing Analytics Stats..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:3000/api/analytics/stats" -Method GET
    Write-Host "✓ Analytics API works!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    $stats | ConvertTo-Json | Write-Host
    
    if ($stats.data) {
        Write-Host ""
        Write-Host "Data Summary:" -ForegroundColor Cyan
        Write-Host "  Total Pets: $($stats.data.totalPets)" -ForegroundColor White
        Write-Host "  Available Pets: $($stats.data.availablePets)" -ForegroundColor Green
        Write-Host "  Adopted Pets: $($stats.data.adoptedPets)" -ForegroundColor Blue
        Write-Host "  Adoption Rate: $($stats.data.adoptionRate)%" -ForegroundColor Magenta
    }
} catch {
    Write-Host "✗ Analytics API failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Is analytics-service running on port 3004?" -ForegroundColor Yellow
    Write-Host "2. Check: cd backend/analytics-service; npm start" -ForegroundColor Yellow
    Write-Host "3. Test direct: http://localhost:3004/analytics/stats" -ForegroundColor Yellow
}

Write-Host ""

# Test if Pets are loading
Write-Host "[3] Testing Pets API..." -ForegroundColor Yellow
try {
    $pets = Invoke-RestMethod -Uri "http://localhost:3000/api/pets" -Method GET
    Write-Host "✓ Pets API works!" -ForegroundColor Green
    Write-Host "Found $($pets.Count) available pets" -ForegroundColor White
} catch {
    Write-Host "✗ Pets API failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
