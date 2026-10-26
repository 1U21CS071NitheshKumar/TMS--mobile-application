import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api';
import { colors, getStatusColor } from '../theme';

const ReportsScreen = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

      const query = new URLSearchParams(params).toString();
      const res = await api.get(`/complaint/report?${query}`);
      setReports(res.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, typeFilter]);

  const handleDelete = (id, type) => {
    Alert.alert(
      'Delete Record',
      `Permanently delete this "${type}" complaint record?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/complaint/delete/${id}`);
              fetchReports();
              Alert.alert('Deleted', 'Record removed successfully.');
            } catch (err) {
              const msg = err.response?.data?.error || err.message || 'Error deleting record';
              Alert.alert('Delete Failed', msg);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Info */}
      <View style={styles.headerBox}>
        <View style={styles.headerIcon}>
          <Ionicons name="bar-chart" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>System Reports</Text>
          <Text style={styles.subtitle}>Audit logs, summary metrics & complaint records</Text>
        </View>
      </View>

      {/* Filter Row */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Filter by Status:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
          {['', 'Pending', 'In-Progress', 'Completed', 'Closed'].map((s) => (
            <TouchableOpacity
              key={s || 'all'}
              style={[styles.filterChip, statusFilter === s && styles.activeChip]}
              onPress={() => setStatusFilter(s)}
            >
              <Text style={[styles.filterChipText, statusFilter === s && styles.activeChipText]}>
                {s || 'All Statuses'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Reports List */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          Records Found: <Text style={{ color: colors.primary }}>{reports.length}</Text>
        </Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchReports}>
          <Ionicons name="refresh" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Generating report...</Text>
        </View>
      ) : reports.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="document-outline" size={40} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No matching records</Text>
          <Text style={styles.emptySub}>Try clearing filters to see all complaints</Text>
        </View>
      ) : (
        <View style={styles.cardsList}>
          {reports.map((item) => {
            const sc = getStatusColor(item.status);
            return (
              <View key={item._id} style={styles.reportCard}>
                <View style={styles.cardTop}>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg, borderColor: sc.border }]}>
                    <Text style={[styles.statusText, { color: sc.text }]}>{item.status}</Text>
                  </View>
                  <Text style={styles.dateText}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <Text style={styles.reportType}>{item.type}</Text>
                <Text style={styles.reportRemarks}>{item.remarks}</Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={13} color={colors.textLight} />
                    <Text style={styles.metaText}>
                      {item.block?.name || 'N/A'} - {item.roomNumber?.number || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="person-outline" size={13} color={colors.textLight} />
                    <Text style={styles.metaText}>By: {item.raisedBy?.username || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.cardBottom}>
                  <Text style={styles.assigneeText}>
                    Assignee: <Text style={{ color: colors.text, fontWeight: '700' }}>{item.assignedTo?.username || 'Unassigned'}</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item._id, item.type)}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
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
    paddingBottom: 36,
  },
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 8,
  },
  filterChips: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  activeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  activeChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  refreshBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
  },
  center: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: colors.textMuted,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 36,
    alignItems: 'center',
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
  cardsList: {
    gap: 12,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 11,
    color: colors.textLight,
  },
  reportType: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  reportRemarks: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textLight,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  assigneeText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.dangerBg,
  },
});

export default ReportsScreen;
