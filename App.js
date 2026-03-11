import React, { useRef } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createStackNavigator } from '@react-navigation/stack';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthNavigator   from './src/navigation/AuthNavigator';
import AppNavigator    from './src/navigation/AppNavigator';
import SearchScreen    from './src/screens/SearchScreen';
import FeedScreen      from './src/screens/FeedScreen';
import { registerRootComponent } from 'expo';

const NAV_THEME = {
  dark: true,
  colors: { primary: '#2563EB', background: '#060810', card: 'rgba(255,255,255,0.13)', text: '#FFFFFF', border: 'rgba(255,255,255,0.2)', notification: '#2563EB' },
};

const RootStack = createStackNavigator();

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: '#060810', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#3b82f6" size="large" />
    </View>
  );

  if (!user) return <AuthNavigator />;

  function handlePressCreate() {
    FeedScreen.openComposer && FeedScreen.openComposer();
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#060810' } }}>
      <RootStack.Screen name="Main">
        {() => <AppNavigator onPressCreate={handlePressCreate} />}
      </RootStack.Screen>
      <RootStack.Screen name="Search" component={SearchScreen}
        options={{ presentation: 'modal', cardStyle: { backgroundColor: 'transparent' } }} />
    </RootStack.Navigator>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer theme={NAV_THEME}>
            <StatusBar barStyle="light-content" backgroundColor="#060810" />
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

registerRootComponent(App);
