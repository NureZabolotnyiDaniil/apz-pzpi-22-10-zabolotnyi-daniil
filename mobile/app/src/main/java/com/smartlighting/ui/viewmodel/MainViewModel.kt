package com.smartlighting.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartlighting.data.models.BreakdownNotification
import com.smartlighting.data.models.ControlRequest
import com.smartlighting.data.models.LanternStatus
import com.smartlighting.data.repository.SmartLightingRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Головний ViewModel для управління станом додатку
 */
class MainViewModel @Inject constructor(
    private val repository: SmartLightingRepository
) : ViewModel() {
    
    // UI State для ліхтарів
    private val _lanternsState = MutableStateFlow<UiState<List<LanternStatus>>>(UiState.Loading)
    val lanternsState: StateFlow<UiState<List<LanternStatus>>> = _lanternsState.asStateFlow()
    
    // UI State для сповіщень
    private val _notificationsState = MutableStateFlow<UiState<List<BreakdownNotification>>>(UiState.Loading)
    val notificationsState: StateFlow<UiState<List<BreakdownNotification>>> = _notificationsState.asStateFlow()
    
    // UI State для історії
    private val _historyState = MutableStateFlow<UiState<List<BreakdownNotification>>>(UiState.Loading)
    val historyState: StateFlow<UiState<List<BreakdownNotification>>> = _historyState.asStateFlow()
    
    // UI State для керування ліхтарем
    private val _controlState = MutableStateFlow<UiState<String>>(UiState.Idle)
    val controlState: StateFlow<UiState<String>> = _controlState.asStateFlow()
    
    init {
        loadLanternsStatus()
        loadNotifications()
        loadHistory()
    }
    
    /**
     * FR.Моб.2: Завантаження статусу ліхтарів
     */
    fun loadLanternsStatus() {
        viewModelScope.launch {
            repository.getLanternsStatus()
                .collect { result ->
                    _lanternsState.value = when {
                        result.isSuccess -> UiState.Success(result.getOrNull() ?: emptyList())
                        else -> UiState.Error(result.exceptionOrNull()?.message ?: "Unknown error")
                    }
                }
        }
    }
    
    /**
     * FR.Моб.1: Завантаження сповіщень про несправності
     */
    fun loadNotifications() {
        viewModelScope.launch {
            repository.getBreakdownNotifications()
                .collect { result ->
                    _notificationsState.value = when {
                        result.isSuccess -> UiState.Success(result.getOrNull() ?: emptyList())
                        else -> UiState.Error(result.exceptionOrNull()?.message ?: "Unknown error")
                    }
                }
        }
    }
    
    /**
     * FR.Моб.4: Завантаження історії несправностей
     */
    fun loadHistory(lanternId: Int? = null) {
        viewModelScope.launch {
            repository.getBreakdownHistory(lanternId)
                .collect { result ->
                    _historyState.value = when {
                        result.isSuccess -> UiState.Success(result.getOrNull() ?: emptyList())
                        else -> UiState.Error(result.exceptionOrNull()?.message ?: "Unknown error")
                    }
                }
        }
    }
    
    /**
     * FR.Моб.3: Керування ліхтарем
     */
    fun controlLantern(lanternId: Int, action: String, brightness: Int? = null) {
        viewModelScope.launch {
            _controlState.value = UiState.Loading
            
            val request = ControlRequest(lanternId, action, brightness)
            val result = repository.controlLantern(request)
            
            _controlState.value = when {
                result.isSuccess -> {
                    // Оновлюємо статус ліхтарів після успішного керування
                    loadLanternsStatus()
                    UiState.Success(result.getOrNull() ?: "Control action executed")
                }
                else -> UiState.Error(result.exceptionOrNull()?.message ?: "Control failed")
            }
        }
    }
    
    /**
     * Увімкнути ліхтар
     */
    fun turnOnLantern(lanternId: Int) {
        controlLantern(lanternId, "turn_on")
    }
    
    /**
     * Вимкнути ліхтар
     */
    fun turnOffLantern(lanternId: Int) {
        controlLantern(lanternId, "turn_off")
    }
    
    /**
     * Встановити яскравість ліхтаря
     */
    fun setBrightness(lanternId: Int, brightness: Int) {
        controlLantern(lanternId, "set_brightness", brightness)
    }
    
    /**
     * Очистити стан керування
     */
    fun clearControlState() {
        _controlState.value = UiState.Idle
    }
    
    /**
     * Оновити всі дані
     */
    fun refreshAll() {
        loadLanternsStatus()
        loadNotifications()
        loadHistory()
    }
}

/**
 * Sealed class для представлення стану UI
 */
sealed class UiState<out T> {
    object Idle : UiState<Nothing>()
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val message: String) : UiState<Nothing>()
} 