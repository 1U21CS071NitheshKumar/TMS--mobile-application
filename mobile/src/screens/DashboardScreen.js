import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { colors, getStatusColor } from '../theme';

const DashboardScreen = ({ onNavigate }) => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    completed: 0,
    closed: 0,
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        api.get('/complaint/dashboard'),
        api.get('/complaint/list'),
      ]);
      setStats(statsRes.data);
      setRecentTickets(ticketsRes.data.slice(0, 5));
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const statCards = [
    { title: 'Total', value: stats.total, icon: 'analytics-outline', color: '#2563EB', bg: '#EFF6FF' },
    { title: 'Pending', value: stats.pending, icon: 'time-outline', color: '#D97706', bg: '#FFFBEB' },
    { title: 'Assigned', value: stats.assigned, icon: 'clipboard-outline', color: '#4F46E5', bg: '#EEF2FF' },
    { title: 'Completed', value: stats.completed, icon: 'checkmark-circle-outline', color: '#059669', bg: '#ECFDF5' },
    { title: 'Closed', value: stats.closed, icon: 'close-circle-outline', color: '#475569', bg: '#F1F5F9' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
      {/* Welcome Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerText}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.username || 'User'} 👋</Text>
          <Text style={styles.userRoleBadge}>
            Role: {user?.role?.name || user?.role || 'User'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.raiseBtn}
          onPress={() => onNavigate('raise')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.raiseBtnText}>New Ticket</Text>
        </TouchableOpacity>
      </View>

      {/* Metrics Carousel / Grid */}
      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.statsGrid}>
        {statCards.map((card) => (
          <View key={card.title} style={styles.statCard}>
            <View style={[styles.statIconWrapper, { backgroundColor: card.bg }]}>
              <Ionicons name={card.icon} size={20} color={card.color} />
            </View>
            <Text style={styles.statValue}>{loading ? '...' : card.value}</Text>
            <Text style={styles.statLabel}>{card.title}</Text>
          </View>
        ))}
      </View>

      {/* Recent Activity */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Complaints</Text>
        <TouchableOpacity onPress={() => onNavigate('tickets')}>
          <Text style={styles.viewAllText}>View All ({stats.total})</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loaderText}>Loading complaints...</Text>
        </View>
      ) : recentTickets.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="file-tray-outline" size={44} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No complaints yet</Text>
          <Text style={styles.emptySub}>Complaints raised will appear here</Text>
        </View>
      ) : (
        <View style={styles.ticketsList}>
          {recentTickets.map((ticket) => {
            const sc = getStatusColor(ticket.status);
            return (
              <TouchableOpacity
                key={ticket._id}
                style={styles.ticketCard}
                onPress={() => onNavigate('tickets')}
                activeOpacity={0.7}
              >
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketType}>{ticket.type}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg, borderColor: sc.border }]}>
                    <Text style={[styles.statusText, { color: sc.text }]}>
                      {ticket.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.ticketRemarks} numberOfLines={2}>
                  {ticket.remarks}
                </Text>

                <View style={styles.ticketFooter}>
                  <View style={styles.footerItem}>
                    <Ionicons name="location-outline" size={13} color={colors.textLight} />
                    <Text style={styles.footerText}>
                      {ticket.block?.name || 'N/A'} - {ticket.roomNumber?.number || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.footerItem}>
                    <Ionicons name="time-outline" size={13} color={colors.textLight} />
                    <Text style={styles.footerText}>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  bannerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    color: '#BFDBFE',
    fontWeight: '600',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  userRoleBadge: {
    fontSize: 11,
    color: '#E0E7FF',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
    overflow: 'hidden',
  },
  raiseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  raiseBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '28%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  statIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  loaderBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 8,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  ticketsList: {
    gap: 10,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketType: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ticketRemarks: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 12,
    lineHeight: 18,
  },
  ticketFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 10,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    color: colors.textLight,
  },
});

export default DashboardScreen;
