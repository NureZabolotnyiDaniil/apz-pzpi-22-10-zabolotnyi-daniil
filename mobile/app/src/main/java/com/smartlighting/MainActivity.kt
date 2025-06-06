package com.smartlighting

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.smartlighting.ui.screens.HistoryScreen
import com.smartlighting.ui.screens.LanternsScreen
import com.smartlighting.ui.screens.NotificationsScreen
import com.smartlighting.ui.theme.SmartLightingTheme
import com.smartlighting.ui.viewmodel.MainViewModel

/**
 * Головна активність додатку SmartLighting
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SmartLightingTheme {
                SmartLightingApp()
            }
        }
    }
}

/**
 * Головний компонент додатку з навігацією
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SmartLightingApp() {
    val navController = rememberNavController()
    
    // Тут має бути ініціалізація ViewModel через DI
    // Для простоти створюємо заглушку
    val viewModel = remember { 
        // MainViewModel(repository) 
        // Тут має бути реальна ініціалізація через Hilt/Dagger
        null
    }
    
    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            NavigationBar {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentDestination = navBackStackEntry?.destination
                
                bottomNavItems.forEach { item ->
                    NavigationBarItem(
                        icon = { Icon(item.icon, contentDescription = item.label) },
                        label = { Text(item.label) },
                        selected = currentDestination?.hierarchy?.any { it.route == item.route } == true,
                        onClick = {
                            navController.navigate(item.route) {
                                // Pop up to the start destination of the graph to
                                // avoid building up a large stack of destinations
                                // on the back stack as users select items
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                // Avoid multiple copies of the same destination when
                                // reselecting the same item
                                launchSingleTop = true
                                // Restore state when reselecting a previously selected item
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = "lanterns",
            modifier = Modifier.padding(innerPadding)
        ) {
            composable("lanterns") {
                if (viewModel != null) {
                    LanternsScreen(viewModel = viewModel)
                } else {
                    // Заглушка для демонстрації
                    PlaceholderScreen("Ліхтарі")
                }
            }
            composable("notifications") {
                if (viewModel != null) {
                    NotificationsScreen(viewModel = viewModel)
                } else {
                    PlaceholderScreen("Сповіщення")
                }
            }
            composable("history") {
                if (viewModel != null) {
                    HistoryScreen(viewModel = viewModel)
                } else {
                    PlaceholderScreen("Історія")
                }
            }
        }
    }
}

/**
 * Заглушка для екранів (поки не налаштовано DI)
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlaceholderScreen(title: String) {
    Scaffold(
        topBar = {
            TopAppBar(title = { Text(title) })
        }
    ) { paddingValues ->
        androidx.compose.foundation.layout.Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentAlignment = androidx.compose.ui.Alignment.Center
        ) {
            androidx.compose.foundation.layout.Column(
                horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Екран: $title",
                    style = MaterialTheme.typography.headlineMedium
                )
                androidx.compose.foundation.layout.Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Для повної функціональності потрібно налаштувати DI та API",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

/**
 * Елементи нижньої навігації
 */
data class BottomNavItem(
    val route: String,
    val icon: ImageVector,
    val label: String
)

val bottomNavItems = listOf(
    BottomNavItem("lanterns", Icons.Default.Lightbulb, "Ліхтарі"),
    BottomNavItem("notifications", Icons.Default.Notifications, "Сповіщення"),
    BottomNavItem("history", Icons.Default.History, "Історія")
) 