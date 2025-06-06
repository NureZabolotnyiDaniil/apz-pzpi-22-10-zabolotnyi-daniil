package com.smartlighting.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.smartlighting.data.models.BreakdownNotification
import com.smartlighting.ui.viewmodel.MainViewModel
import com.smartlighting.ui.viewmodel.UiState
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime

/**
 * FR.Моб.4: Екран для перегляду історії несправностей
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val historyState by viewModel.historyState.collectAsState()
    var showFilterDialog by remember { mutableStateOf(false) }
    var selectedLanternId by remember { mutableStateOf<Int?>(null) }
    
    Column(modifier = modifier.fillMaxSize()) {
        // Заголовок
        TopAppBar(
            title = { Text("Історія несправностей") },
            actions = {
                IconButton(onClick = { showFilterDialog = true }) {
                    Icon(Icons.Default.FilterList, contentDescription = "Фільтр")
                }
                IconButton(onClick = { viewModel.loadHistory(selectedLanternId) }) {
                    Icon(Icons.Default.Refresh, contentDescription = "Оновити")
                }
            }
        )
        
        // Показуємо активний фільтр
        if (selectedLanternId != null) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Фільтр: Ліхтар #$selectedLanternId",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium
                    )
                    Spacer(modifier = Modifier.weight(1f))
                    TextButton(
                        onClick = {
                            selectedLanternId = null
                            viewModel.loadHistory()
                        }
                    ) {
                        Text("Очистити")
                    }
                }
            }
        }
        
        // Контент
        when (historyState) {
            is UiState.Loading -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            
            is UiState.Success -> {
                val history = historyState.data
                
                if (history.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                Icons.Default.History,
                                contentDescription = null,
                                modifier = Modifier.size(64.dp),
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = if (selectedLanternId != null) 
                                    "Немає історії для ліхтаря #$selectedLanternId"
                                else 
                                    "Історія несправностей порожня",
                                style = MaterialTheme.typography.bodyLarge,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(history) { notification ->
                            HistoryCard(notification = notification)
                        }
                    }
                }
            }
            
            is UiState.Error -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "Помилка: ${historyState.message}",
                            color = MaterialTheme.colorScheme.error
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(onClick = { viewModel.loadHistory(selectedLanternId) }) {
                            Text("Спробувати знову")
                        }
                    }
                }
            }
            
            else -> {}
        }
    }
    
    // Діалог фільтрації
    if (showFilterDialog) {
        FilterDialog(
            currentLanternId = selectedLanternId,
            onConfirm = { lanternId ->
                selectedLanternId = lanternId
                viewModel.loadHistory(lanternId)
                showFilterDialog = false
            },
            onDismiss = { showFilterDialog = false }
        )
    }
}

/**
 * Картка історичного запису про несправність
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryCard(
    notification: BreakdownNotification,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // Заголовок
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Ліхтар #${notification.lanternId}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                
                // Статус (завжди вирішено для історії)
                Surface(
                    color = MaterialTheme.colorScheme.outline,
                    shape = MaterialTheme.shapes.small
                ) {
                    Text(
                        text = "Вирішено",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        color = MaterialTheme.colorScheme.onSurface,
                        style = MaterialTheme.typography.labelSmall
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Опис несправності
            if (!notification.description.isNullOrBlank()) {
                Text(
                    text = notification.description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(8.dp))
            }
            
            // Час несправності
            val localDateTime = notification.date.toLocalDateTime(TimeZone.currentSystemDefault())
            Text(
                text = "${localDateTime.date} о ${localDateTime.time}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

/**
 * Діалог для фільтрації історії по ліхтарю
 */
@Composable
fun FilterDialog(
    currentLanternId: Int?,
    onConfirm: (Int?) -> Unit,
    onDismiss: () -> Unit
) {
    var lanternIdText by remember { 
        mutableStateOf(currentLanternId?.toString() ?: "") 
    }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Фільтр по ліхтарю") },
        text = {
            Column {
                Text("Введіть ID ліхтаря для фільтрації (або залиште порожнім для всіх):")
                Spacer(modifier = Modifier.height(16.dp))
                OutlinedTextField(
                    value = lanternIdText,
                    onValueChange = { lanternIdText = it },
                    label = { Text("ID ліхтаря") },
                    placeholder = { Text("Наприклад: 123") },
                    singleLine = true
                )
            }
        },
        confirmButton = {
            TextButton(
                onClick = {
                    val lanternId = lanternIdText.toIntOrNull()
                    onConfirm(lanternId)
                }
            ) {
                Text("Застосувати")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Скасувати")
            }
        }
    )
} 