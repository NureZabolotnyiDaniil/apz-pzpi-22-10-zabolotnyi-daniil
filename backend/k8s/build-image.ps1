# Скрипт для збірки Docker образу
Write-Host "🏗️ Збірка Docker образу SmartLighting Backend" -ForegroundColor Green

# Перевіряємо чи працює Docker
try {
    docker --version
    Write-Host "✅ Docker доступний" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker не доступний. Запусти Docker Desktop!" -ForegroundColor Red
    exit 1
}

# Переходимо в backend директорію
Write-Host "📁 Переходимо в backend директорію..." -ForegroundColor Blue
Set-Location ..

# Збираємо образ
Write-Host "🔨 Збираємо Docker образ..." -ForegroundColor Blue
docker build -t smartlighting-backend:latest .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Образ успішно збудований!" -ForegroundColor Green
    
    # Показуємо інформацію про образ
    Write-Host "📋 Інформація про образ:" -ForegroundColor Cyan
    docker images smartlighting-backend:latest
    
    # Повертаємось в k8s директорію
    Set-Location k8s
    
    Write-Host "🚀 Тепер можна оновити deployment:" -ForegroundColor Yellow
    Write-Host "   kubectl apply -f backend-deployment.yaml" -ForegroundColor White
    Write-Host "   kubectl rollout restart deployment/smartlighting-backend" -ForegroundColor White
    
} else {
    Write-Host "❌ Помилка при збірці образу!" -ForegroundColor Red
    Set-Location k8s
    exit 1
} 