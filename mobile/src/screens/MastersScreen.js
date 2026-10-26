import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api';
import { colors } from '../theme';

const MASTER_TABS = [
  { key: 'departments', label: 'Departments', endpoint: '/master/departments', icon: 'business-outline', fieldName: 'name' },
  { key: 'programmes', label: 'Programmes', endpoint: '/master/programmes', icon: 'school-outline', fieldName: 'name' },
  { key: 'blocks', label: 'Blocks', endpoint: '/master/blocks', icon: 'cube-outline', fieldName: 'name' },
  { key: 'rooms', label: 'Rooms', endpoint: '/master/rooms', icon: 'grid-outline', fieldName: 'number' },
  { key: 'roles', label: 'Roles', endpoint: '/master/roles', icon: 'key-outline', fieldName: 'name' },
  { key: 'users', label: 'Users', endpoint: '/master/users', icon: 'people-outline', fieldName: 'username' },
];

const MastersScreen = () => {
  const [activeTab, setActiveTab] = useState(MASTER_TABS[0]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal for Add/Edit
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchItems = async (tab) => {
    setLoading(true);
    try {
      const res = await api.get(tab.endpoint);
      setItems(res.data);
    } catch (err) {
      console.error(`Error fetching ${tab.key}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(activeTab);
  }, [activeTab]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setInputValue('');
    setModalVisible(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setInputValue(item[activeTab.fieldName]?.toString() || '');
    setModalVisible(true);
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${item[activeTab.fieldName]}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`${activeTab.endpoint}/${item._id}`);
              fetchItems(activeTab);
            } catch (err) {
              const msg = err.response?.data?.error || err.message || 'Error deleting item';
              Alert.alert('Delete Failed', msg);
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!inputValue.trim()) {
      Alert.alert('Required', `Please enter a ${activeTab.fieldName}.`);
      return;
    }

    setSaving(true);
    try {
      const payload = { [activeTab.fieldName]: inputValue.trim() };
      if (editingItem) {
        await api.put(`${activeTab.endpoint}/${editingItem._id}`, payload);
      } else {
        await api.post(activeTab.endpoint, payload);
      }
      setModalVisible(false);
      setInputValue('');
      setEditingItem(null);
      fetchItems(activeTab);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error saving item';
      Alert.alert('Save Failed', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Category Tabs */}
      <View style={styles.tabsHeader}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsList}>
          {MASTER_TABS.map((tab) => {
            const isActive = activeTab.key === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabChip, isActive && styles.activeTabChip]}
                onPress={() => setActiveTab(tab)}
              >
                <Ionicons
                  name={tab.icon}
                  size={15}
                  color={isActive ? '#FFFFFF' : colors.textMuted}
                />
                <Text style={[styles.tabChipText, isActive && styles.activeTabChipText]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main List */}
      <View style={styles.body}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {activeTab.label} ({items.length})
          </Text>
          <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add New</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Loading {activeTab.label.toLowerCase()}...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="folder-open-outline" size={40} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No {activeTab.label.toLowerCase()} yet</Text>
            <Text style={styles.emptySub}>Tap 'Add New' above to create one</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.itemsList}>
            {items.map((item) => (
              <View key={item._id} style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>
                    {item[activeTab.fieldName] || 'Untitled'}
                  </Text>
                  {item.email && <Text style={styles.itemMeta}>{item.email}</Text>}
                  {item.block && <Text style={styles.itemMeta}>Block: {item.block?.name || item.block}</Text>}
                </View>

                <View style={styles.itemActions}>
                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => handleOpenEdit(item)}
                  >
                    <Ionicons name="pencil-outline" size={16} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionIconBtn, styles.deleteBtn]}
                    onPress={() => handleDelete(item)}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalTop}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Edit' : 'Add'} {activeTab.label.slice(0, -1)}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>
              {activeTab.fieldName.toUpperCase()}:
            </Text>
            <TextInput
              style={styles.textInput}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={`Enter ${activeTab.fieldName}...`}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
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
  tabsHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingVertical: 10,
  },
  tabsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  activeTabChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  activeTabChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  body: {
    flex: 1,
    padding: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  itemsList: {
    gap: 8,
    paddingBottom: 24,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: colors.dangerBg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: colors.textMuted,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  modalCancelText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  modalSaveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default MastersScreen;
