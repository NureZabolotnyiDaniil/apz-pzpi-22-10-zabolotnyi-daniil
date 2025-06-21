Write-Host "🚀 Початок деплою SmartLighting бекенду в Kubernetes..." -ForegroundColor Green

# Перевіряємо чи працює minikube
$minikubeStatus = minikube status 2>$null
if (-not ($minikubeStatus -match "Running")) {
    Write-Host "❌ Minikube не запущений. Запускаємо..." -ForegroundColor Yellow
    minikube start
}

# Використовуємо Docker daemon від minikube
Write-Host "🔧 Налаштовуємо Docker для minikube..." -ForegroundColor Blue
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Збираємо Docker образ
Write-Host "🏗️ Збираємо Docker образ..." -ForegroundColor Blue
Set-Location ..
docker build -t smartlighting-backend:latest .
Set-Location k8s

# Включаємо metrics server для HPA
Write-Host "📊 Включаємо metrics server..." -ForegroundColor Blue
minikube addons enable metrics-server

# Деплоїмо PostgreSQL
Write-Host "🐘 Деплоїмо PostgreSQL..." -ForegroundColor Blue
kubectl apply -f postgres-deployment.yaml

# Чекаємо готовності PostgreSQL
Write-Host "⏳ Чекаємо готовності PostgreSQL..." -ForegroundColor Yellow
kubectl wait --for=condition=available --timeout=300s deployment/postgres-deployment

# Деплоїмо ConfigMap та Secrets
Write-Host "⚙️ Деплоїмо конфігурацію..." -ForegroundColor Blue
kubectl apply -f configmap.yaml

# Деплоїмо бекенд
Write-Host "🌐 Деплоїмо бекенд..." -ForegroundColor Blue
kubectl apply -f backend-deployment.yaml

# Чекаємо готовності бекенду
Write-Host "⏳ Чекаємо готовності бекенду..." -ForegroundColor Yellow
kubectl wait --for=condition=available --timeout=300s deployment/smartlighting-backend

# Деплоїмо HPA
Write-Host "📈 Деплоїмо автоскейлер..." -ForegroundColor Blue
kubectl apply -f hpa.yaml

# Показуємо статус
Write-Host "📋 Статус деплою:" -ForegroundColor Green
kubectl get pods
kubectl get services
kubectl get hpa

# Отримуємо URL сервісу
Write-Host "🌍 URL для доступу до API:" -ForegroundColor Green
minikube service smartlighting-backend-service --url

Write-Host "✅ Деплой завершено!" -ForegroundColor Green
Write-Host "🔍 Для моніторингу використовуй: kubectl get pods -w" -ForegroundColor Cyan
Write-Host "📊 Для перегляду HPA: kubectl get hpa -w" -ForegroundColor Cyan 