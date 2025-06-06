package com.smartlighting.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.PowerOff
import androidx.compose.material.icons.filled.PowerSettingsNew
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.smartlighting.data.models.LanternStatus
import com.smartlighting.ui.viewmodel.MainViewModel
import com.smartlighting.ui.viewmodel.UiState

/**
 * FR.Моб.2: Екран для перегляду поточного стану ліхтарів
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LanternsScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val lanternsState by viewModel.lanternsState.collectAsState()
    val controlState by viewModel.controlState.collectAsState()
    
    Column(modifier = modifier.fillMaxSize()) {
        // Заголовок
        TopAppBar(
            title = { Text("Стан ліхтарів") },
            actions = {
                IconButton(onClick = { viewModel.loadLanternsStatus() }) {
                    Icon(Icons.Default.PowerSettingsNew, contentDescription = "Оновити")
                }
            }
        )
        
        // Контент
        when (lanternsState) {
            is UiState.Loading -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            
            is UiState.Success -> {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(lanternsState.data) { lantern ->
                        LanternCard(
                            lantern = lantern,
                            onTurnOn = { viewModel.turnOnLantern(lantern.id) },
                            onTurnOff = { viewModel.turnOffLantern(lantern.id) },
                            onSetBrightness = { brightness -> 
                                viewModel.setBrightness(lantern.id, brightness) 
                            }
                        )
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
                            text = "Помилка: ${lanternsState.message}",
                            color = MaterialTheme.colorScheme.error
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(onClick = { viewModel.loadLanternsStatus() }) {
                            Text("Спробувати знову")
                        }
                    }
                }
            }
            
            else -> {}
        }
    }
    
    // Показуємо результат керування
    LaunchedEffect(controlState) {
        if (controlState is UiState.Success) {
            // Тут можна показати Snackbar з повідомленням
            viewModel.clearControlState()
        }
    }
}

/**
 * Картка ліхтаря з можливістю керування
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LanternCard(
    lantern: LanternStatus,
    onTurnOn: () -> Unit,
    onTurnOff: () -> Unit,
    onSetBrightness: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    var showBrightnessDialog by remember { mutableStateOf(false) }
    
    Card(
        modifier = modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
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
                        Icons.Default.Lightbulb,
                        contentDescription = null,
                        tint = if (lantern.isWorking) Color.Yellow else Color.Gray
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Ліхтар #${lantern.id}",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
                
                // Індикатор статусу
                Surface(
                    color = when {
                        lantern.isWorking -> Color.Green
                        lantern.status == "off" -> Color.Gray
                        else -> Color.Red
                    },
                    shape = MaterialTheme.shapes.small
                ) {
                    Text(
                        text = when {
                            lantern.isWorking -> "Працює"
                            lantern.status == "off" -> "Вимкнено"
                            else -> "Несправність"
                        },
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        color = Color.White,
                        style = MaterialTheme.typography.labelSmall
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Інформація про ліхтар
            Text(
                text = "Яскравість: ${lantern.activeBrightness}%",
                style = MaterialTheme.typography.bodyMedium
            )
            
            if (lantern.parkId != null) {
                Text(
                    text = "Парк: #${lantern.parkId}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            if (lantern.isOnline) {
                Text(
                    text = "Онлайн",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Green
                )
            } else {
                Text(
                    text = "Офлайн",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Red
                )
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // FR.Моб.3: Кнопки керування
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = onTurnOn,
                    enabled = !lantern.isWorking,
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.PowerSettingsNew, contentDescription = null)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Увімкнути")
                }
                
                Button(
                    onClick = onTurnOff,
                    enabled = lantern.isWorking,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Icon(Icons.Default.PowerOff, contentDescription = null)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Вимкнути")
                }
                
                OutlinedButton(
                    onClick = { showBrightnessDialog = true },
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Яскравість")
                }
            }
        }
    }
    
    // Діалог встановлення яскравості
    if (showBrightnessDialog) {
        BrightnessDialog(
            currentBrightness = lantern.activeBrightness,
            onConfirm = { brightness ->
                onSetBrightness(brightness)
                showBrightnessDialog = false
            },
            onDismiss = { showBrightnessDialog = false }
        )
    }
}

/**
 * Діалог для встановлення яскравості
 */
@Composable
fun BrightnessDialog(
    currentBrightness: Int,
    onConfirm: (Int) -> Unit,
    onDismiss: () -> Unit
) {
    var brightness by remember { mutableStateOf(currentBrightness.toFloat()) }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Встановити яскравість") },
        text = {
            Column {
                Text("Яскравість: ${brightness.toInt()}%")
                Spacer(modifier = Modifier.height(16.dp))
                Slider(
                    value = brightness,
                    onValueChange = { brightness = it },
                    valueRange = 0f..100f,
                    steps = 10
                )
            }
        },
        confirmButton = {
            TextButton(onClick = { onConfirm(brightness.toInt()) }) {
                Text("Встановити")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Скасувати")
            }
        }
    )
} 