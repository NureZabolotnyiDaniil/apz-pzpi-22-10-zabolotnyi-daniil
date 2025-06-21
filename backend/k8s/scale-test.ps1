# Скрипт для демонстрації масштабування
param(
    [int]$Replicas = 5,
    [string]$ServiceUrl = ""
)

Write-Host "🚀 Демонстрація масштабування SmartLighting" -ForegroundColor Green

# Отримуємо URL сервісу якщо не вказано
if ([string]::IsNullOrEmpty($ServiceUrl)) {
    Write-Host "🔍 Отримуємо URL сервісу..." -ForegroundColor Blue
    $ServiceUrl = minikube service smartlighting-backend-service --url
    Write-Host "URL: $ServiceUrl" -ForegroundColor Cyan
}

# Масштабуємо до заданої кількості реплік
Write-Host "📈 Масштабуємо до $Replicas реплік..." -ForegroundColor Blue
kubectl scale deployment smartlighting-backend --replicas=$Replicas

# Моніторимо масштабування
Write-Host "⏳ Чекаємо готовності подів..." -ForegroundColor Yellow
kubectl rollout status deployment/smartlighting-backend --timeout=300s

# Показуємо поточний стан
Write-Host "📊 Поточний стан:" -ForegroundColor Green
kubectl get pods -l app=smartlighting-backend
kubectl get hpa

# Виконуємо навантажувальний тест
Write-Host "🔥 Запускаємо навантажувальний тест..." -ForegroundColor Red
Write-Host "Натисни Ctrl+C для зупинки тесту" -ForegroundColor Yellow

$RequestCount = 0
$StartTime = Get-Date

while ($true) {
    try {
        # Робимо 10 запитів паралельно
        $jobs = 1..10 | ForEach-Object {
            Start-Job -ScriptBlock {
                param($url)
                try {
                    $response = Invoke-WebRequest -Uri "$url/health" -TimeoutSec 5 -UseBasicParsing
                    return @{ Success = $true; StatusCode = $response.StatusCode; Time = (Get-Date) }
                } catch {
                    return @{ Success = $false; Error = $_.Exception.Message; Time = (Get-Date) }
                }
            } -ArgumentList $ServiceUrl
        }
        
        # Чекаємо завершення всіх завдань
        $results = $jobs | Wait-Job | Receive-Job
        $jobs | Remove-Job
        
        $RequestCount += 10
        $ElapsedTime = (Get-Date) - $StartTime
        $RPS = [math]::Round($RequestCount / $ElapsedTime.TotalSeconds, 2)
        
        $SuccessCount = ($results | Where-Object { $_.Success }).Count
        
        Write-Host "Запитів: $RequestCount | RPS: $RPS | Успішних: $SuccessCount/10" -ForegroundColor Cyan
        
        # Показуємо стан HPA кожні 30 запитів
        if ($RequestCount % 30 -eq 0) {
            Write-Host "`n📊 Стан автоскейлера:" -ForegroundColor Blue
            kubectl get hpa smartlighting-backend-hpa
            kubectl get pods -l app=smartlighting-backend
            Write-Host ""
        }
        
        Start-Sleep -Seconds 1
        
    } catch {
        Write-Host "Помилка: $($_.Exception.Message)" -ForegroundColor Red
        Start-Sleep -Seconds 2
    }
}

Write-Host "✅ Тест завершено!" -ForegroundColor Green 