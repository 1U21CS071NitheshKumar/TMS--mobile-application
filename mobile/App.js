import React, { useContext, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  StatusBar as RNStatusBar,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import Header from './src/components/Header';
import BottomNav from './src/components/BottomNav';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import RaiseTicketScreen from './src/screens/RaiseTicketScreen';
import TicketListScreen from './src/screens/TicketListScreen';
import MastersScreen from './src/screens/MastersScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import { colors } from './src/theme';

const MainApp = () => {
  const { user, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.splashText}>Ticket Management System</Text>
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const getScreenTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'TMS Dashboard';
      case 'tickets':
        return 'Complaints List';
      case 'raise':
        return 'Raise Complaint';
      case 'masters':
        return 'Masters Management';
      case 'reports':
        return 'System Reports';
      default:
        return 'TMS';
    }
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen onNavigate={setActiveTab} />;
      case 'tickets':
        return <TicketListScreen onNavigate={setActiveTab} />;
      case 'raise':
        return <RaiseTicketScreen onNavigate={setActiveTab} />;
      case 'masters':
        return <MastersScreen onNavigate={setActiveTab} />;
      case 'reports':
        return <ReportsScreen onNavigate={setActiveTab} />;
      default:
        return <DashboardScreen onNavigate={setActiveTab} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={getScreenTitle()} />
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  splash: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  splashText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
});
