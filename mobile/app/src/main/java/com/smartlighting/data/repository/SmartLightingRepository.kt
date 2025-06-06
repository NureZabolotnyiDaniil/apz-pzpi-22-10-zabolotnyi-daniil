package com.smartlighting.data.repository

import com.smartlighting.data.api.SmartLightingApi
import com.smartlighting.data.models.BreakdownNotification
import com.smartlighting.data.models.ControlRequest
import com.smartlighting.data.models.LanternStatus
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Репозиторій для роботи з даними SmartLighting
 */
@Singleton
class SmartLightingRepository @Inject constructor(
    private val api: SmartLightingApi
) {
    
    /**
     * FR.Моб.2: Отримання статусу всіх ліхтарів
     */
    fun getLanternsStatus(): Flow<Result<List<LanternStatus>>> = flow {
        try {
            val response = api.getLanternsStatus()
            if (response.isSuccessful) {
                emit(Result.success(response.body() ?: emptyList()))
            } else {
                emit(Result.failure(Exception("Failed to load lanterns status: ${response.code()}")))
            }
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }
    
    /**
     * Отримання статусу конкретного ліхтаря
     */
    fun getLanternStatus(lanternId: Int): Flow<Result<LanternStatus>> = flow {
        try {
            val response = api.getLanternStatus(lanternId)
            if (response.isSuccessful) {
                response.body()?.let {
                    emit(Result.success(it))
                } ?: emit(Result.failure(Exception("Lantern not found")))
            } else {
                emit(Result.failure(Exception("Failed to load lantern status: ${response.code()}")))
            }
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }
    
    /**
     * FR.Моб.3: Дистанційне керування ліхтарем
     */
    suspend fun controlLantern(request: ControlRequest): Result<String> {
        return try {
            val response = api.controlLantern(request)
            if (response.isSuccessful) {
                val message = response.body()?.get("message") ?: "Control action executed"
                Result.success(message)
            } else {
                Result.failure(Exception("Failed to control lantern: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * FR.Моб.1: Отримання сповіщень про несправності
     */
    fun getBreakdownNotifications(): Flow<Result<List<BreakdownNotification>>> = flow {
        try {
            val response = api.getBreakdownNotifications()
            if (response.isSuccessful) {
                emit(Result.success(response.body() ?: emptyList()))
            } else {
                emit(Result.failure(Exception("Failed to load notifications: ${response.code()}")))
            }
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }
    
    /**
     * FR.Моб.4: Отримання історії несправностей
     */
    fun getBreakdownHistory(lanternId: Int? = null, limit: Int = 100): Flow<Result<List<BreakdownNotification>>> = flow {
        try {
            val response = api.getBreakdownHistory(lanternId, limit)
            if (response.isSuccessful) {
                emit(Result.success(response.body() ?: emptyList()))
            } else {
                emit(Result.failure(Exception("Failed to load breakdown history: ${response.code()}")))
            }
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }
    
    /**
     * Реєстрація пристрою для push-сповіщень
     */
    suspend fun registerDeviceForNotifications(deviceToken: String): Result<String> {
        return try {
            val response = api.registerDeviceForNotifications(deviceToken)
            if (response.isSuccessful) {
                val message = response.body()?.get("message") ?: "Device registered"
                Result.success(message)
            } else {
                Result.failure(Exception("Failed to register device: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Перевірка стану сервера
     */
    suspend fun healthCheck(): Result<Boolean> {
        return try {
            val response = api.healthCheck()
            if (response.isSuccessful) {
                val status = response.body()?.get("status") as? String
                Result.success(status == "ok")
            } else {
                Result.failure(Exception("Server health check failed: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
} 