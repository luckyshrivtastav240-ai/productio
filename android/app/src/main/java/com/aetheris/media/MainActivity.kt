package com.aetheris.media

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.aetheris.media.ui.theme.AetherisTheme
import com.aetheris.media.ui.theme.ObsidianBlack

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AetherisTheme {
                Surface(
                    modifier = Modifier.fillMaxSize().background(ObsidianBlack),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AetherisMainContent()
                }
            }
        }
    }
}

@Composable
fun AetherisMainContent() {
    var selectedTab by remember { mutableStateOf(0) }

    Scaffold(
        bottomBar = {
            NavigationBar {
                val tabs = listOf("Discover", "Search", "Library", "Providers", "Settings")
                tabs.forEachIndexed { index, title ->
                    NavigationBarItem(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        label = { Text(title) },
                        icon = {}
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            // Screen switching logic
        }
    }
}
