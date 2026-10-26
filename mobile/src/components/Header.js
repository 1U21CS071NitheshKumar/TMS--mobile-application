import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import api, { getDefaultApiUrl } from '../api';
import { colors } from '../theme';

const Header = ({ title }) => {
  const { user, logout, serverUrl, updateServerUrl } = useContext(AuthContext);
  const [showSettings, setShowSettings] = useState(false);
  const [inputUrl, setInputUrl] = useState(serverUrl);

  // Notification state
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      // Quiet fail if server unreachable
    }
  };

  const fetchNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
      fetchUnreadCount();
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleOpenNotifs = () => {
    setShowNotifs(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await api.patch(`/notifications/${notifId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleSaveUrl = async () => {
    if (!inputUrl.trim()) {
      Alert.alert('Invalid URL', 'Please enter a valid backend API URL.');
      return;
    }
    await updateServerUrl(inputUrl.trim());
    setShowSettings(false);
    Alert.alert('Updated', 'Backend API URL updated successfully.');
  };

  const roleName = user?.role?.name || user?.role || 'User';

  const getNotifIcon = (type) => {
    switch (type) {
      case 'complaint_raised':
        return { name: 'add-circle', color: colors.warning };
      case 'complaint_assigned':
        return { name: 'person-add', color: colors.indigo };
      case 'complaint_completed':
        return { name: 'checkmark-circle', color: colors.success };
      default:
        return { name: 'notifications', color: colors.primary };
    }
  };

  return (
    <>
      <View style={styles.header}>
        <View style={styles.left}>
          <View style={styles.logoBadge}>
            <Ionicons name="layers" size={18} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.title}>{title}</Text>
            {user && (
              <Text style={styles.subtitle}>
                {user.username} • <Text style={styles.roleText}>{roleName}</Text>
              </Text>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          {/* Notification Bell */}
          {user && (
            <TouchableOpacity style={styles.iconButton} onPress={handleOpenNotifs}>
              <Ionicons name="notifications-outline" size={20} color={colors.text} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Settings */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              setInputUrl(serverUrl);
              setShowSettings(true);
            }}
          >
            <Ionicons name="settings-outline" size={19} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Logout */}
          {user && (
            <TouchableOpacity style={[styles.iconButton, styles.logoutBtn]} onPress={logout}>
              <Ionicons name="log-out-outline" size={19} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notifications Modal */}
      <Modal visible={showNotifs} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.notifSheet}>
            <View style={styles.notifHeader}>
              <View style={styles.notifTitleRow}>
                <Ionicons name="notifications" size={20} color={colors.primary} />
                <Text style={styles.notifTitle}>Notifications</Text>
                {unreadCount > 0 && (
                  <View style={styles.headerCountBadge}>
                    <Text style={styles.headerCountText}>{unreadCount} new</Text>
                  </View>
                )}
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {notifications.some((n) => !n.read) && (
                  <TouchableOpacity onPress={handleMarkAllRead}>
                    <Text style={styles.markAllText}>Read all</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setShowNotifs(false)}>
                  <Ionicons name="close-circle" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {loadingNotifs ? (
              <View style={styles.notifCenter}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.notifLoadingText}>Loading notifications...</Text>
              </View>
            ) : notifications.length === 0 ? (
              <View style={styles.notifCenter}>
                <Ionicons name="notifications-off-outline" size={42} color={colors.textLight} />
                <Text style={styles.noNotifsTitle}>No notifications yet</Text>
                <Text style={styles.noNotifsSub}>
                  You will see updates when complaints are raised, assigned, or completed.
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.notifList}>
                {notifications.map((item) => {
                  const iconInfo = getNotifIcon(item.type);
                  return (
                    <TouchableOpacity
                      key={item._id}
                      style={[styles.notifItem, !item.read && styles.notifItemUnread]}
                      onPress={() => !item.read && handleMarkAsRead(item._id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.notifIconCircle, { backgroundColor: iconInfo.color + '15' }]}>
                        <Ionicons name={iconInfo.name} size={18} color={iconInfo.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={[styles.itemTitle, !item.read && styles.itemTitleUnread]}>
                            {item.title}
                          </Text>
                          <Text style={styles.itemDate}>
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                        <Text style={styles.itemMessage}>{item.message}</Text>
                      </View>
                      {!item.read && <View style={styles.unreadDot} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Server URL Config Modal */}
      <Modal visible={showSettings} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="server" size={22} color={colors.primary} />
              <Text style={styles.modalTitle}>Backend API Settings</Text>
            </View>
            <Text style={styles.modalDesc}>Set the backend API endpoint URL:</Text>
            <TextInput
              style={styles.input}
              value={inputUrl}
              onChangeText={setInputUrl}
              placeholder={getDefaultApiUrl()}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowSettings(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveUrl}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  roleText: {
    color: colors.primary,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  logoutBtn: {
    backgroundColor: colors.dangerBg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  notifSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingBottom: 24,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  headerCountBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  headerCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  notifCenter: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifLoadingText: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textMuted,
  },
  noNotifsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  noNotifsSub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  notifList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  notifItemUnread: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  notifIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  itemTitleUnread: {
    fontWeight: '700',
    color: '#0369A1',
  },
  itemDate: {
    fontSize: 10,
    color: colors.textLight,
  },
  itemMessage: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  modalCard: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  modalDesc: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default Header;
