# Скрипт моніторингу Kubernetes кластера
Write-Host "📊 Моніторинг SmartLighting кластера" -ForegroundColor Green

while ($true) {
    Clear-Host
    Write-Host "=== SmartLighting Kubernetes Monitoring ===" -ForegroundColor Cyan
    Write-Host "Час: $(Get-Date)" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "🔷 PODS:" -ForegroundColor Blue
    kubectl get pods -o wide
    Write-Host ""
    
    Write-Host "🔷 SERVICES:" -ForegroundColor Blue
    kubectl get services
    Write-Host ""
    
    Write-Host "🔷 HPA (Horizontal Pod Autoscaler):" -ForegroundColor Blue
    kubectl get hpa
    Write-Host ""
    
    Write-Host "🔷 DEPLOYMENTS:" -ForegroundColor Blue
    kubectl get deployments
    Write-Host ""
    
    Write-Host "🔷 RESOURCE USAGE:" -ForegroundColor Blue
    kubectl top pods 2>$null
    Write-Host ""
    
    Write-Host "Натисни Ctrl+C для виходу. Оновлення через 5 секунд..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
} 