import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { colors } from '../theme';

const BottomNav = ({ activeTab, onSelectTab }) => {
  const { user } = useContext(AuthContext);
  const isSuperAdmin = user?.role === 'SuperAdmin' || user?.role?.name === 'SuperAdmin';

  const tabs = [
    { key: 'dashboard', label: 'Home', icon: 'grid-outline', activeIcon: 'grid' },
    { key: 'tickets', label: 'Tickets', icon: 'list-outline', activeIcon: 'list' },
    { key: 'raise', label: 'Raise', icon: 'add-circle-outline', activeIcon: 'add-circle', isAccent: true },
  ];

  if (isSuperAdmin) {
    tabs.push({ key: 'masters', label: 'Masters', icon: 'business-outline', activeIcon: 'business' });
    tabs.push({ key: 'reports', label: 'Reports', icon: 'stats-chart-outline', activeIcon: 'stats-chart' });
  }

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, tab.isAccent && styles.accentTab]}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.7}
          >
            {tab.isAccent ? (
              <View style={styles.accentCircle}>
                <Ionicons name="add" size={26} color="#FFFFFF" />
              </View>
            ) : (
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={isActive ? colors.primary : colors.textLight}
              />
            )}
            <Text
              style={[
                styles.tabLabel,
                isActive && styles.activeTabLabel,
                tab.isAccent && styles.accentLabel
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingVertical: 6,
    paddingBottom: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  accentTab: {
    top: -12,
  },
  accentCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  accentLabel: {
    marginTop: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textLight,
    marginTop: 3,
  },
  activeTabLabel: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default BottomNav;
