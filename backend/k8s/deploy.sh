#!/bin/bash

echo "🚀 Початок деплою SmartLighting бекенду в Kubernetes..."

# Перевіряємо чи працює minikube
if ! minikube status | grep -q "Running"; then
    echo "❌ Minikube не запущений. Запускаємо..."
    minikube start
fi

# Використовуємо Docker daemon від minikube
echo "🔧 Налаштовуємо Docker для minikube..."
eval $(minikube docker-env)

# Збираємо Docker образ
echo "🏗️ Збираємо Docker образ..."
cd ..
docker build -t smartlighting-backend:latest .
cd k8s

# Включаємо metrics server для HPA
echo "📊 Включаємо metrics server..."
minikube addons enable metrics-server

# Деплоїмо PostgreSQL
echo "🐘 Деплоїмо PostgreSQL..."
kubectl apply -f postgres-deployment.yaml

# Чекаємо готовності PostgreSQL
echo "⏳ Чекаємо готовності PostgreSQL..."
kubectl wait --for=condition=available --timeout=300s deployment/postgres-deployment

# Деплоїмо ConfigMap та Secrets
echo "⚙️ Деплоїмо конфігурацію..."
kubectl apply -f configmap.yaml

# Деплоїмо бекенд
echo "🌐 Деплоїмо бекенд..."
kubectl apply -f backend-deployment.yaml

# Чекаємо готовності бекенду
echo "⏳ Чекаємо готовності бекенду..."
kubectl wait --for=condition=available --timeout=300s deployment/smartlighting-backend

# Деплоїмо HPA
echo "📈 Деплоїмо автоскейлер..."
kubectl apply -f hpa.yaml

# Показуємо статус
echo "📋 Статус деплою:"
kubectl get pods
kubectl get services
kubectl get hpa

# Отримуємо URL сервісу
echo "🌍 URL для доступу до API:"
minikube service smartlighting-backend-service --url

echo "✅ Деплой завершено!"
echo "🔍 Для моніторингу використовуй: kubectl get pods -w"
echo "📊 Для перегляду HPA: kubectl get hpa -w" 