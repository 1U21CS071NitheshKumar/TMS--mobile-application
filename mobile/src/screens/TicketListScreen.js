import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { colors, getStatusColor } from '../theme';

const STATUS_FILTERS = ['All', 'Pending', 'In-Progress', 'OnHold', 'Completed', 'Closed'];
const ALL_STATUSES = ['Pending', 'In-Progress', 'OnHold', 'Completed', 'Closed'];

const TicketListScreen = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Modals
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  const isSuperAdmin = user?.role === 'SuperAdmin' || user?.role?.name === 'SuperAdmin';

  const fetchTickets = async () => {
    try {
      const res = await api.get('/complaint/list');
      setTickets(res.data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStaff = async () => {
    if (!isSuperAdmin) return;
    try {
      const res = await api.get('/master/users');
      setStaff(res.data);
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchStaff();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedTicket) return;
    setUpdating(true);
    try {
      await api.patch(`/complaint/status/${selectedTicket._id}`, { status: newStatus });
      setStatusModalVisible(false);
      setSelectedTicket(null);
      fetchTickets();
      Alert.alert('Status Updated', `Ticket status changed to ${newStatus}.`);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error updating status';
      Alert.alert('Update Failed', msg);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssign = async (userId) => {
    if (!selectedTicket) return;
    setUpdating(true);
    try {
      await api.patch(`/complaint/assign/${selectedTicket._id}`, { assignedTo: userId });
      setAssignModalVisible(false);
      setSelectedTicket(null);
      fetchTickets();
      Alert.alert('Assigned', 'Ticket assigned successfully.');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error assigning ticket';
      Alert.alert('Assignment Failed', msg);
    } finally {
      setUpdating(false);
    }
  };

  const canUpdateStatus = (ticket) => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    return ticket.assignedTo?._id === user._id || ticket.assignedTo === user._id;
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesFilter = activeFilter === 'All' || t.status === activeFilter;
    const matchesSearch =
      search === '' ||
      t.type?.toLowerCase().includes(search.toLowerCase()) ||
      t.remarks?.toLowerCase().includes(search.toLowerCase()) ||
      t.block?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.roomNumber?.number?.toString().includes(search);
    return matchesFilter && matchesSearch;
  });

  const renderTicketCard = ({ item: ticket }) => {
    const sc = getStatusColor(ticket.status);
    const canEdit = canUpdateStatus(ticket);

    return (
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.statusBadge, { backgroundColor: sc.bg, borderColor: sc.border }]}>
              <Text style={[styles.statusText, { color: sc.text }]}>{ticket.status}</Text>
            </View>
            <Text style={styles.ticketId}>#{ticket._id?.slice(-6).toUpperCase()}</Text>
          </View>
          <Text style={styles.dateText}>
            {new Date(ticket.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <Text style={styles.ticketType}>{ticket.type}</Text>
        <Text style={styles.ticketRemarks}>{ticket.remarks}</Text>

        {/* Location & Details */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={14} color={colors.primary} />
            <Text style={styles.detailText}>
              {ticket.block?.name || 'N/A'} • Rm {ticket.roomNumber?.number || 'N/A'}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={14} color={colors.indigo} />
            <Text style={styles.detailText}>
              By: {ticket.raisedBy?.username || 'User'}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="build-outline" size={14} color={colors.secondary} />
            <Text style={styles.detailText}>
              To: {ticket.assignedTo?.username || 'Unassigned'}
            </Text>
          </View>
        </View>

        {/* Actions Bar */}
        {(canEdit || isSuperAdmin) && (
          <View style={styles.actionBar}>
            {canEdit && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  setSelectedTicket(ticket);
                  setStatusModalVisible(true);
                }}
              >
                <Ionicons name="sync-outline" size={14} color={colors.primary} />
                <Text style={styles.actionBtnText}>Update Status</Text>
              </TouchableOpacity>
            )}

            {isSuperAdmin && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.assignBtn]}
                onPress={() => {
                  setSelectedTicket(ticket);
                  setAssignModalVisible(true);
                }}
              >
                <Ionicons name="person-add-outline" size={14} color={colors.indigo} />
                <Text style={[styles.actionBtnText, { color: colors.indigo }]}>Assign</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by type, room, block, or remarks..."
          placeholderTextColor={colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textLight} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          {STATUS_FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.activeFilterChip]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterChipText, activeFilter === f && styles.activeFilterChipText]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Ticket List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching complaints...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTickets}
          keyExtractor={(item) => item._id}
          renderItem={renderTicketCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyTitle}>No complaints found</Text>
              <Text style={styles.emptySub}>
                {search ? 'Try adjusting your search criteria' : 'No tickets match the selected status filter'}
              </Text>
            </View>
          }
        />
      )}

      {/* Status Update Modal */}
      <Modal visible={statusModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalTop}>
              <Text style={styles.modalTitle}>Change Ticket Status</Text>
              <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Updating #{selectedTicket?._id?.slice(-6).toUpperCase()} • {selectedTicket?.type}
            </Text>

            <View style={styles.statusOptions}>
              {(isSuperAdmin
                ? ['In-Progress', 'OnHold', 'Completed', 'Closed']
                : ['In-Progress', 'OnHold', 'Completed']
              ).map((status) => {
                const sc = getStatusColor(status);
                const isCurrent = selectedTicket?.status === status;
                return (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOptionItem,
                      isCurrent && { borderColor: sc.text, backgroundColor: sc.bg }
                    ]}
                    onPress={() => handleUpdateStatus(status)}
                    disabled={updating}
                  >
                    <View style={[styles.statusDot, { backgroundColor: sc.text }]} />
                    <Text style={[styles.statusOptionText, isCurrent && { fontWeight: '700', color: sc.text }]}>
                      {status}
                    </Text>
                    {isCurrent && (
                      <Ionicons name="checkmark" size={18} color={sc.text} style={{ marginLeft: 'auto' }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Assign Modal */}
      <Modal visible={assignModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalTop}>
              <Text style={styles.modalTitle}>Assign Complaint</Text>
              <TouchableOpacity onPress={() => setAssignModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              <TouchableOpacity
                style={styles.staffItem}
                onPress={() => handleAssign(null)}
                disabled={updating}
              >
                <Ionicons name="close-outline" size={20} color={colors.textLight} />
                <Text style={styles.staffItemText}>Unassigned</Text>
              </TouchableOpacity>

              {staff.map((s) => (
                <TouchableOpacity
                  key={s._id}
                  style={styles.staffItem}
                  onPress={() => handleAssign(s._id)}
                  disabled={updating}
                >
                  <Ionicons name="person-circle-outline" size={22} color={colors.primary} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.staffName}>{s.username}</Text>
                    <Text style={styles.staffRole}>{s.role?.name || s.role || 'Staff'}</Text>
                  </View>
                  {selectedTicket?.assignedTo?._id === s._id && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  filterWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingVertical: 8,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  activeFilterChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  activeFilterChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  ticketId: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
  },
  dateText: {
    fontSize: 11,
    color: colors.textLight,
  },
  ticketType: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  ticketRemarks: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  actionBar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
  },
  assignBtn: {
    backgroundColor: colors.indigoBg,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  modalSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 16,
  },
  statusOptions: {
    gap: 8,
    marginBottom: 16,
  },
  statusOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  staffItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  staffItemText: {
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: 8,
  },
  staffName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  staffRole: {
    fontSize: 11,
    color: colors.textMuted,
  },
});

export default TicketListScreen;
