# Скрипт очищення Kubernetes ресурсів
Write-Host "🧹 Очищення SmartLighting Kubernetes ресурсів" -ForegroundColor Yellow

Write-Host "🗑️ Видаляємо HPA..." -ForegroundColor Red
kubectl delete hpa smartlighting-backend-hpa --ignore-not-found=true

Write-Host "🗑️ Видаляємо backend deployment..." -ForegroundColor Red
kubectl delete deployment smartlighting-backend --ignore-not-found=true

Write-Host "🗑️ Видаляємо backend service..." -ForegroundColor Red
kubectl delete service smartlighting-backend-service --ignore-not-found=true

Write-Host "🗑️ Видаляємо PostgreSQL..." -ForegroundColor Red
kubectl delete deployment postgres-deployment --ignore-not-found=true
kubectl delete service postgres-service --ignore-not-found=true
kubectl delete pvc postgres-pvc --ignore-not-found=true

Write-Host "🗑️ Видаляємо конфігурацію..." -ForegroundColor Red
kubectl delete configmap smartlighting-config --ignore-not-found=true
kubectl delete secret smartlighting-secrets --ignore-not-found=true

Write-Host "📊 Поточний стан кластера:" -ForegroundColor Green
kubectl get all

Write-Host "✅ Очищення завершено!" -ForegroundColor Green
Write-Host "💡 Для повного перезапуску використай: .\admin-deploy.ps1" -ForegroundColor Cyan 