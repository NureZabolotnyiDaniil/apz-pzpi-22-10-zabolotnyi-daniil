package com.smartlighting.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.smartlighting.data.models.BreakdownNotification
import com.smartlighting.ui.viewmodel.MainViewModel
import com.smartlighting.ui.viewmodel.UiState
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime

/**
 * FR.Моб.1: Екран для отримання сповіщень про несправності
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationsScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val notificationsState by viewModel.notificationsState.collectAsState()
    
    Column(modifier = modifier.fillMaxSize()) {
        // Заголовок
        TopAppBar(
            title = { Text("Сповіщення") },
            actions = {
                IconButton(onClick = { viewModel.loadNotifications() }) {
                    Icon(Icons.Default.Refresh, contentDescription = "Оновити")
                }
            }
        )
        
        // Контент
        when (notificationsState) {
            is UiState.Loading -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            
            is UiState.Success -> {
                val notifications = notificationsState.data
                
                if (notifications.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                Icons.Default.Warning,
                                contentDescription = null,
                                modifier = Modifier.size(64.dp),
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "Немає активних сповіщень",
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
                        items(notifications) { notification ->
                            NotificationCard(notification = notification)
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
                            text = "Помилка: ${notificationsState.message}",
                            color = MaterialTheme.colorScheme.error
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(onClick = { viewModel.loadNotifications() }) {
                            Text("Спробувати знову")
                        }
                    }
                }
            }
            
            else -> {}
        }
    }
}

/**
 * Картка сповіщення про несправність
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationCard(
    notification: BreakdownNotification,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (notification.isRecent) 
                MaterialTheme.colorScheme.errorContainer 
            else 
                MaterialTheme.colorScheme.surface
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // Заголовок з іконкою
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Error,
                        contentDescription = null,
                        tint = if (notification.isRecent) Color.Red else Color.Orange
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Ліхтар #${notification.lanternId}",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
                
                // Індикатор статусу
                Surface(
                    color = if (notification.isResolved) Color.Green else Color.Red,
                    shape = MaterialTheme.shapes.small
                ) {
                    Text(
                        text = if (notification.isResolved) "Вирішено" else "Активно",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        color = Color.White,
                        style = MaterialTheme.typography.labelSmall
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Опис несправності
            if (!notification.description.isNullOrBlank()) {
                Text(
                    text = notification.description,
                    style = MaterialTheme.typography.bodyMedium
                )
                Spacer(modifier = Modifier.height(8.dp))
            }
            
            // Час несправності
            val localDateTime = notification.date.toLocalDateTime(TimeZone.currentSystemDefault())
            Text(
                text = "Час: ${localDateTime.date} ${localDateTime.time}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            // Індикатор свіжості
            if (notification.isRecent) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Нове сповіщення",
                    style = MaterialTheme.typography.labelSmall,
                    color = Color.Red,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
} 