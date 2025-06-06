package com.smartlighting.data.models

import kotlinx.datetime.Instant

/**
 * Модель для сповіщення про несправність
 */
data class BreakdownNotification(
    val id: Int,
    val lanternId: Int,
    val date: Instant,
    val description: String? = null,
    val isResolved: Boolean = false
) {
    val isRecent: Boolean
        get() = (kotlinx.datetime.Clock.System.now() - date) < 
               kotlinx.datetime.DateTimePeriod(hours = 24).let { it }
} 