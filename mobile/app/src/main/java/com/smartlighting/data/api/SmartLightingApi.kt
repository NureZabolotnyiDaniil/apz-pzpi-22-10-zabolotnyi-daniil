package com.smartlighting.data.api

import com.smartlighting.data.models.BreakdownNotification
import com.smartlighting.data.models.ControlRequest
import com.smartlighting.data.models.LanternStatus
import retrofit2.Response
import retrofit2.http.*

/**
 * API інтерфейс для взаємодії з SmartLighting бекендом
 */
interface SmartLightingApi {
    
    // FR.Моб.2: Перегляд поточного стану ліхтарів
    @GET("mobile/lanterns/status")
    suspend fun getLanternsStatus(): Response<List<LanternStatus>>
    
    @GET("mobile/lanterns/{lantern_id}/status")
    suspend fun getLanternStatus(@Path("lantern_id") lanternId: Int): Response<LanternStatus>
    
    // FR.Моб.3: Дистанційне керування окремими ліхтарями
    @POST("mobile/lanterns/control")
    suspend fun controlLantern(@Body request: ControlRequest): Response<Map<String, String>>
    
    // FR.Моб.1: Отримання сповіщень про несправності
    @GET("mobile/notifications/breakdowns")
    suspend fun getBreakdownNotifications(): Response<List<BreakdownNotification>>
    
    // FR.Моб.4: Перегляд історії несправностей
    @GET("mobile/history/breakdowns")
    suspend fun getBreakdownHistory(
        @Query("lantern_id") lanternId: Int? = null,
        @Query("limit") limit: Int = 100
    ): Response<List<BreakdownNotification>>
    
    // Реєстрація пристрою для push-сповіщень
    @POST("mobile/notifications/register")
    suspend fun registerDeviceForNotifications(@Query("device_token") deviceToken: String): Response<Map<String, String>>
    
    // Перевірка стану сервера
    @GET("mobile/health")
    suspend fun healthCheck(): Response<Map<String, Any>>
} 