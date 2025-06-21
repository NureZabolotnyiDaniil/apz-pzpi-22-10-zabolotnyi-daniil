#!/usr/bin/env python3
"""
Навантажувальне тестування SmartLighting API
Цей скрипт виконує навантажувальне тестування API для демонстрації масштабування
"""

import asyncio
import aiohttp
import time
import argparse
import json
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from typing import List, Dict, Any

class LoadTester:
    def __init__(self, base_url: str, max_concurrent: int = 50):
        self.base_url = base_url.rstrip('/')
        self.max_concurrent = max_concurrent
        self.results = []
        
    async def make_request(self, session: aiohttp.ClientSession, endpoint: str) -> Dict[str, Any]:
        """Виконує один HTTP запит"""
        start_time = time.time()
        try:
            async with session.get(f"{self.base_url}{endpoint}") as response:
                end_time = time.time()
                return {
                    'endpoint': endpoint,
                    'status_code': response.status,
                    'response_time': end_time - start_time,
                    'timestamp': datetime.now().isoformat(),
                    'success': 200 <= response.status < 300
                }
        except Exception as e:
            end_time = time.time()
            return {
                'endpoint': endpoint,
                'status_code': 0,
                'response_time': end_time - start_time,
                'timestamp': datetime.now().isoformat(),
                'success': False,
                'error': str(e)
            }
    
    async def run_batch(self, num_requests: int, endpoints: List[str]) -> List[Dict[str, Any]]:
        """Виконує пакет запитів"""
        connector = aiohttp.TCPConnector(limit=self.max_concurrent)
        timeout = aiohttp.ClientTimeout(total=30)
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            tasks = []
            
            for i in range(num_requests):
                endpoint = endpoints[i % len(endpoints)]
                task = self.make_request(session, endpoint)
                tasks.append(task)
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Фільтруємо результати від виключень
            valid_results = []
            for result in results:
                if isinstance(result, dict):
                    valid_results.append(result)
                else:
                    valid_results.append({
                        'endpoint': 'unknown',
                        'status_code': 0,
                        'response_time': 0,
                        'timestamp': datetime.now().isoformat(),
                        'success': False,
                        'error': str(result)
                    })
            
            return valid_results
    
    def analyze_results(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Аналізує результати тестування"""
        if not results:
            return {'error': 'No results to analyze'}
        
        successful_requests = [r for r in results if r['success']]
        failed_requests = [r for r in results if not r['success']]
        
        response_times = [r['response_time'] for r in successful_requests]
        
        if not response_times:
            return {'error': 'No successful requests'}
        
        total_time = max([r['timestamp'] for r in results]) if results else 0
        start_time = min([r['timestamp'] for r in results]) if results else 0
        
        return {
            'total_requests': len(results),
            'successful_requests': len(successful_requests),
            'failed_requests': len(failed_requests),
            'success_rate': len(successful_requests) / len(results) * 100,
            'avg_response_time': sum(response_times) / len(response_times),
            'min_response_time': min(response_times),
            'max_response_time': max(response_times),
            'requests_per_second': len(results) / max(1, (time.time() - time.time())) if results else 0,
            'status_codes': self._count_status_codes(results)
        }
    
    def _count_status_codes(self, results: List[Dict[str, Any]]) -> Dict[int, int]:
        """Підраховує кількість різних статус кодів"""
        status_counts = {}
        for result in results:
            status = result['status_code']
            status_counts[status] = status_counts.get(status, 0) + 1
        return status_counts
    
    async def run_load_test(self, duration_seconds: int, requests_per_second: int, endpoints: List[str]):
        """Запускає навантажувальне тестування"""
        print(f"🚀 Початок навантажувального тестування:")
        print(f"   - Тривалість: {duration_seconds} секунд")
        print(f"   - Запитів на секунду: {requests_per_second}")
        print(f"   - Тестові ендпоінти: {endpoints}")
        print(f"   - Базовий URL: {self.base_url}")
        
        all_results = []
        start_time = time.time()
        
        while time.time() - start_time < duration_seconds:
            batch_start = time.time()
            
            # Виконуємо пакет запитів
            batch_results = await self.run_batch(requests_per_second, endpoints)
            all_results.extend(batch_results)
            
            # Виводимо проміжні результати
            successful = len([r for r in batch_results if r['success']])
            print(f"⏱️  Секунда {int(time.time() - start_time)}: {successful}/{len(batch_results)} успішних запитів")
            
            # Чекаємо до наступної секунди
            elapsed = time.time() - batch_start
            sleep_time = max(0, 1.0 - elapsed)
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)
        
        # Аналізуємо результати
        analysis = self.analyze_results(all_results)
        
        print("\n📊 Результати навантажувального тестування:")
        print(f"   - Загальна кількість запитів: {analysis['total_requests']}")
        print(f"   - Успішних запитів: {analysis['successful_requests']}")
        print(f"   - Невдалих запитів: {analysis['failed_requests']}")
        print(f"   - Відсоток успішності: {analysis['success_rate']:.2f}%")
        print(f"   - Середній час відповіді: {analysis['avg_response_time']:.3f}s")
        print(f"   - Мін час відповіді: {analysis['min_response_time']:.3f}s")
        print(f"   - Макс час відповіді: {analysis['max_response_time']:.3f}s")
        print(f"   - Статус коди: {analysis['status_codes']}")
        
        return all_results, analysis

async def main():
    parser = argparse.ArgumentParser(description='Навантажувальне тестування SmartLighting API')
    parser.add_argument('--url', default='http://localhost', help='Базовий URL API')
    parser.add_argument('--duration', type=int, default=60, help='Тривалість тестування в секундах')
    parser.add_argument('--rps', type=int, default=10, help='Запитів на секунду')
    parser.add_argument('--concurrent', type=int, default=50, help='Максимальна кількість одночасних з\'єднань')
    
    args = parser.parse_args()
    
    # Тестові ендпоінти
    endpoints = [
        '/',
        '/health',
        '/test',
        '/docs',
    ]
    
    tester = LoadTester(args.url, args.concurrent)
    
    try:
        results, analysis = await tester.run_load_test(args.duration, args.rps, endpoints)
        
        # Зберігаємо результати в файл
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"load_test_results_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump({
                'test_parameters': {
                    'url': args.url,
                    'duration': args.duration,
                    'requests_per_second': args.rps,
                    'max_concurrent': args.concurrent,
                    'endpoints': endpoints
                },
                'analysis': analysis,
                'raw_results': results
            }, f, indent=2)
        
        print(f"\n💾 Результати збережені в {filename}")
        
    except KeyboardInterrupt:
        print("\n⚠️  Тестування перервано користувачем")
    except Exception as e:
        print(f"\n❌ Помилка під час тестування: {e}")

if __name__ == "__main__":
    asyncio.run(main()) 