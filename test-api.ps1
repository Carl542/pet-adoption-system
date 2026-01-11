# ===============================================
# API Testing Script - PowerShell
# Run this to test all your microservices
# ===============================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Testing Pet Adoption System APIs" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Function to test an endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -ErrorAction Stop
        Write-Host "✓ SUCCESS - Status: $($response.StatusCode)" -ForegroundColor Green
        
        # Try to parse as JSON and show preview
        try {
            $json = $response.Content | ConvertFrom-Json
            Write-Host "Response Preview:" -ForegroundColor Gray
            $json | ConvertTo-Json -Depth 2 -Compress | Write-Host -ForegroundColor Gray
        } catch {
            Write-Host "Response: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))..." -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "✗ FAILED - Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# ===============================================
# Test Individual Services
# ===============================================

Write-Host "`n[1] Testing Individual Microservices" -ForegroundColor Magenta
Write-Host "======================================" -ForegroundColor Magenta

# Pet Service (Port 3001)
Test-Endpoint "Pet Service - Get All Pets" "http://localhost:3001/pets"

# Adoption Service (Port 3002)
Test-Endpoint "Adoption Service - Get Adoptions" "http://localhost:3002/adoptions"

# Auth Service (Port 3003)
# Note: Most auth endpoints need POST, so we skip testing those

# Analytics Service (Port 3004)
Test-Endpoint "Analytics Service - Overall Stats" "http://localhost:3004/analytics/stats"
Test-Endpoint "Analytics Service - Monthly Trends" "http://localhost:3004/analytics/monthly-trends"
Test-Endpoint "Analytics Service - Species Rates" "http://localhost:3004/analytics/species-rates"
Test-Endpoint "Analytics Service - Shelter Stay" "http://localhost:3004/analytics/shelter-stay"

# ===============================================
# Test API Gateway
# ===============================================

Write-Host "`n[2] Testing API Gateway (Port 3000)" -ForegroundColor Magenta
Write-Host "====================================" -ForegroundColor Magenta

# Health check
Test-Endpoint "API Gateway - Health Check" "http://localhost:3000/health"

# Pet routes through gateway
Test-Endpoint "Gateway -> Pets - Get All" "http://localhost:3000/api/pets"
Test-Endpoint "Gateway -> Pets - Get All (Admin)" "http://localhost:3000/api/pets/all"

# Adoption routes through gateway
Test-Endpoint "Gateway -> Adoptions - Get All" "http://localhost:3000/api/adoptions"

# Analytics routes through gateway
Test-Endpoint "Gateway -> Analytics - Stats" "http://localhost:3000/api/analytics/stats"
Test-Endpoint "Gateway -> Analytics - Monthly Trends" "http://localhost:3000/api/analytics/monthly-trends"
Test-Endpoint "Gateway -> Analytics - Species Rates" "http://localhost:3000/api/analytics/species-rates"
Test-Endpoint "Gateway -> Analytics - Shelter Stay" "http://localhost:3000/api/analytics/shelter-stay"
Test-Endpoint "Gateway -> Analytics - Age Groups" "http://localhost:3000/api/analytics/adoptions-by-age-group"
Test-Endpoint "Gateway -> Analytics - Locations" "http://localhost:3000/api/analytics/adoptions-by-location"
Test-Endpoint "Gateway -> Analytics - Quarterly" "http://localhost:3000/api/analytics/quarterly-performance"
Test-Endpoint "Gateway -> Analytics - Previous Owners" "http://localhost:3000/api/analytics/previous-owner-analysis"

# ===============================================
# Summary
# ===============================================

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you see any ✗ FAILED messages above:" -ForegroundColor Yellow
Write-Host "1. Check if that service is running" -ForegroundColor Yellow
Write-Host "2. Check the port number is correct" -ForegroundColor Yellow
Write-Host "3. Check the route exists in server.js" -ForegroundColor Yellow
Write-Host "4. Check the backend console for errors" -ForegroundColor Yellow
Write-Host ""
Write-Host "Expected Results:" -ForegroundColor Cyan
Write-Host "- All ✓ SUCCESS messages" -ForegroundColor Green
Write-Host "- Analytics Stats should show: totalPets: 8, adoptedPets: 5, availablePets: 3" -ForegroundColor Green
Write-Host ""
