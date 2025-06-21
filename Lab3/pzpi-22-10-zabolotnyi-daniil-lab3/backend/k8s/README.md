# Лабораторна робота: Масштабування бекенду в Kubernetes

## 🎯 Мета роботи
Демонстрація горизонтального масштабування FastAPI бекенду в Kubernetes кластері з автоматичним балансуванням навантаження та навантажувальним тестуванням.

## 📋 Передумови

### Встановлене ПЗ:
- ✅ Minikube
- ✅ kubectl
- ✅ Docker Desktop
- ✅ PowerShell (Windows)

### Права доступу:
- **ОБОВ'ЯЗКОВО**: PowerShell повинен бути запущений **від імені адміністратора**

## 🚀 Крок 1: Деплой системи

### 1.1 Запуск PowerShell від імені адміністратора
```powershell
# Правий клік на PowerShell → "Запустити від імені адміністратора"
```

### 1.2 Перехід в директорію
```powershell
cd C:\Users\danil\PycharmProjects\SmartLighting\backend\k8s
```

### 1.3 Запуск деплою
```powershell
.\admin-deploy.ps1
```

**Що відбувається:**
- Запуск minikube з Hyper-V драйвером
- Збірка Docker образу FastAPI додатку
- Деплой PostgreSQL бази даних
- Деплой FastAPI бекенду (2 репліки)
- Налаштування HPA (Horizontal Pod Autoscaler)
- Включення metrics server

## 📊 Крок 2: Моніторинг системи

### 2.1 Запуск моніторингу
```powershell
.\monitor.ps1
```

**Що відображається:**
- Статус подів (pods)
- Статус сервісів (services)
- Стан автоскейлера (HPA)
- Використання ресурсів (CPU/Memory)

### 2.2 Ручна перевірка
```powershell
# Перевірка подів
kubectl get pods

# Перевірка сервісів
kubectl get services

# Перевірка HPA
kubectl get hpa

# Детальна інформація про HPA
kubectl describe hpa smartlighting-backend-hpa
```

## 🔥 Крок 3: Навантажувальне тестування

### 3.1 Отримання URL сервісу
```powershell
minikube service smartlighting-backend-service --url
```

### 3.2 Запуск тестування масштабування
```powershell
# Масштабування до 5 реплік + навантажувальний тест
.\scale-test.ps1 -Replicas 5

# Або з вказанням URL
.\scale-test.ps1 -Replicas 3 -ServiceUrl "http://192.168.1.100:31216"
```

### 3.3 Альтернативний Python тест
```powershell
# Встановлення залежностей
pip install aiohttp

# Запуск тесту
python load_test.py --url http://192.168.1.100:31216 --duration 120 --rps 20
```

## 📈 Крок 4: Демонстрація масштабування

### 4.1 Ручне масштабування
```powershell
# Збільшення до 6 реплік
kubectl scale deployment smartlighting-backend --replicas=6

# Зменшення до 2 реплік
kubectl scale deployment smartlighting-backend --replicas=2

# Перевірка стану
kubectl get pods -l app=smartlighting-backend
```

### 4.2 Автоматичне масштабування (HPA)
```powershell
# Спостереження за автоскейлером
kubectl get hpa -w

# Детальна інформація
kubectl describe hpa smartlighting-backend-hpa
```

## 🔧 Архітектура системи

### Компоненти:
1. **PostgreSQL** - База даних (1 репліка)
2. **FastAPI Backend** - Веб-додаток (2-10 реплік)
3. **LoadBalancer** - Розподіл навантаження
4. **HPA** - Автоматичне масштабування
5. **Metrics Server** - Збір метрик

### Мережа:
```
Internet → LoadBalancer → Backend Pods → PostgreSQL
```

## 📊 Налаштування HPA

### Параметри автоскейлера:
- **Мінімум реплік**: 2
- **Максимум реплік**: 10
- **CPU threshold**: 70%
- **Memory threshold**: 80%
- **Scale Up**: max 100% за 15 секунд
- **Scale Down**: max 50% за 60 секунд

### Ресурси подів:
- **CPU Request**: 100m
- **CPU Limit**: 200m
- **Memory Request**: 128Mi
- **Memory Limit**: 256Mi

## 🧪 Сценарії тестування

### Тест 1: Базове навантаження
```powershell
.\scale-test.ps1 -Replicas 2
```
**Очікуваний результат**: 2 репліки справляються з навантаженням

### Тест 2: Високе навантаження
```powershell
.\scale-test.ps1 -Replicas 5
```
**Очікуваний результат**: HPA збільшує кількість реплік

### Тест 3: Пікове навантаження
```powershell
python load_test.py --url $URL --duration 300 --rps 50
```
**Очікуваний результат**: Масштабування до максимуму (10 реплік)

## 📝 Очікувані результати

### Без навантаження:
- 2 репліки backend podів
- CPU utilization: <10%
- Memory utilization: <20%

### Під навантаженням:
- 3-10 реплік (залежно від навантаження)
- CPU utilization: 60-80%
- Memory utilization: 40-70%
- RPS: 50-200 requests/second

## 🛠️ Усунення проблем

### Проблема: Права доступу
```powershell
# Запускай PowerShell від імені адміністратора!
```

### Проблема: Docker не працює
```powershell
# Запусти Docker Desktop перед деплоем
```

### Проблема: Поди не запускаються
```powershell
# Перевір логи
kubectl logs -l app=smartlighting-backend

# Перевір образ
kubectl describe pod <pod-name>
```

### Проблема: HPA не працює
```powershell
# Перевір metrics server
kubectl get apiservice v1beta1.metrics.k8s.io -o yaml

# Перевір ресурси
kubectl top pods
```

## 📚 Корисні команди

### Деплой та управління:
```powershell
# Повний деплой
.\admin-deploy.ps1

# Видалення всіх ресурсів
kubectl delete -f .

# Перезапуск деплою
kubectl rollout restart deployment/smartlighting-backend
```

### Моніторинг:
```powershell
# Реал-тайм моніторинг
.\monitor.ps1

# Логи
kubectl logs -f deployment/smartlighting-backend

# Metrics
kubectl top nodes
kubectl top pods
```

### Налагодження:
```powershell
# Підключення до пода
kubectl exec -it <pod-name> -- bash

# Порт-форвардинг
kubectl port-forward service/smartlighting-backend-service 8080:80
```

## 🎯 Критерії успіху

✅ **Деплой**: Всі поди запущені та готові
✅ **Доступність**: API відповідає на /health
✅ **Масштабування**: HPA працює при навантаженні
✅ **Продуктивність**: RPS зростає з кількістю реплік
✅ **Стабільність**: Система працює під навантаженням

## 📋 Для звіту

### Обов'язкові скріншоти:
1. `kubectl get pods` - статус подів
2. `kubectl get hpa` - стан автоскейлера
3. Результати навантажувального тесту
4. Графіки масштабування (з monitor.ps1)

### Аналіз:
- RPS до/після масштабування
- Час відповіді до/після масштабування
- Використання ресурсів
- Швидкість автоскейлера 