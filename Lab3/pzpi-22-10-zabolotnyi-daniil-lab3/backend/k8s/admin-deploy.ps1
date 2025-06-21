# Скрипт для запуску від імені адміністратора
Write-Host "🚀 Деплой SmartLighting (Admin mode)" -ForegroundColor Green

# Перевіряємо права адміністратора
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ Потрібно запустити PowerShell від імені адміністратора!" -ForegroundColor Red
    exit 1
}

# Запускаємо minikube
Write-Host "🔧 Запускаємо minikube..." -ForegroundColor Blue
minikube start --driver=hyperv

# Налаштовуємо Docker для minikube
Write-Host "🐳 Налаштовуємо Docker..." -ForegroundColor Blue
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Збираємо образ
Write-Host "🏗️ Збираємо Docker образ..." -ForegroundColor Blue
Set-Location ..
docker build -t smartlighting-backend:latest .
Set-Location k8s

# Включаємо metrics server
Write-Host "📊 Включаємо metrics server..." -ForegroundColor Blue
minikube addons enable metrics-server

# Деплоїмо все
Write-Host "🚀 Деплоїмо компоненти..." -ForegroundColor Blue
kubectl apply -f postgres-deployment.yaml
kubectl apply -f configmap.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f hpa.yaml

Write-Host "✅ Деплой завершено!" -ForegroundColor Green
Write-Host "🌍 Отримати URL:" -ForegroundColor Cyan
Write-Host "   minikube service smartlighting-backend-service --url" -ForegroundColor White 