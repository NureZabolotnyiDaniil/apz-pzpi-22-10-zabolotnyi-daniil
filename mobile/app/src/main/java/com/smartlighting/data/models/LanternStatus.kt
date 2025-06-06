package com.smartlighting.data.models

import kotlinx.datetime.Instant

/**
 * Модель для статусу ліхтаря
 */
data class LanternStatus(
    val id: Int,
    val status: String,
    val activeBrightness: Int,
    val baseBrightness: Int,
    val parkId: Int? = null,
    val lastResponse: Instant? = null
) {
    val isWorking: Boolean
        get() = status == "working"
        
    val isOnline: Boolean
        get() = lastResponse != null && 
               (kotlinx.datetime.Clock.System.now() - lastResponse!!) < 
               kotlinx.datetime.DateTimePeriod(minutes = 5).let { it }
}

/**
 * Модель для запиту керування ліхтарем
 */
data class ControlRequest(
    val lanternId: Int,
    val action: String, // "turn_on", "turn_off", "set_brightness"
    val brightness: Int? = null
) 