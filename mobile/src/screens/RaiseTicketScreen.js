import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api';
import { colors } from '../theme';

const COMPLAINT_TYPES = [
  'PC Hardware',
  'PC Software',
  'Application Issues',
  'Network',
  'Electronics',
  'Plumbing',
  'Others',
];

const RaiseTicketScreen = ({ onNavigate }) => {
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingMasters, setLoadingMasters] = useState(true);

  // Picker modals
  const [modalType, setModalType] = useState(null); // 'block' | 'room' | 'type'

  useEffect(() => {
    loadMasters();
  }, []);

  const loadMasters = async () => {
    try {
      const [blocksRes, roomsRes] = await Promise.all([
        api.get('/master/blocks'),
        api.get('/master/rooms'),
      ]);
      setBlocks(blocksRes.data || []);
      const sorted = (roomsRes.data || []).sort((a, b) =>
        String(a.number).localeCompare(String(b.number), undefined, { numeric: true })
      );
      setAllRooms(sorted);
    } catch (err) {
      console.error('Error fetching blocks/rooms:', err);
      Alert.alert('Load Error', 'Could not load building blocks.');
    } finally {
      setLoadingMasters(false);
    }
  };

  const handleSelectBlock = (block) => {
    setSelectedBlock(block);
    setSelectedRoom(null);
    const filtered = allRooms
      .filter((r) => {
        const bId = r.block?._id || r.block;
        return bId && bId.toString() === block._id.toString();
      })
      .sort((a, b) =>
        String(a.number).localeCompare(String(b.number), undefined, { numeric: true })
      );
    setRooms(filtered);
    setModalType(null);
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setModalType(null);
  };

  const handleSelectType = (type) => {
    setSelectedType(type);
    setModalType(null);
  };

  const handleSubmit = async () => {
    if (!selectedBlock) {
      Alert.alert('Required Field', 'Please select a Block.');
      return;
    }
    if (!selectedRoom) {
      Alert.alert('Required Field', 'Please select a Room.');
      return;
    }
    if (!selectedType) {
      Alert.alert('Required Field', 'Please choose a Complaint Type.');
      return;
    }
    if (!remarks.trim()) {
      Alert.alert('Required Field', 'Please write a brief description of the issue.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/complaint/raise', {
        block: selectedBlock._id,
        roomNumber: selectedRoom._id,
        type: selectedType,
        remarks: remarks.trim(),
        attachment: '',
      });

      Alert.alert(
        'Success! 🎉',
        'Complaint raised successfully. Our team will review and assign it.',
        [
          {
            text: 'View Tickets',
            onPress: () => onNavigate('tickets'),
          },
          {
            text: 'Raise Another',
            onPress: () => {
              setSelectedRoom(null);
              setSelectedType('');
              setRemarks('');
            },
          },
        ]
      );
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error submitting complaint';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingMasters) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading blocks and rooms...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerIcon}>
            <Ionicons name="document-text" size={24} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.title}>Raise a Complaint</Text>
            <Text style={styles.subtitle}>Fill in details of the maintenance or IT issue</Text>
          </View>
        </View>

        {/* Block Selector */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Block / Building *</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setModalType('block')}
          >
            <Ionicons name="business-outline" size={18} color={colors.textLight} />
            <Text style={[styles.pickerValue, !selectedBlock && styles.placeholder]}>
              {selectedBlock ? selectedBlock.name : 'Select Block'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Room Selector */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Room / Lab Number *</Text>
          <TouchableOpacity
            style={[styles.pickerButton, !selectedBlock && styles.disabledPicker]}
            onPress={() => {
              if (!selectedBlock) {
                Alert.alert('Select Block First', 'Please choose a block to see rooms.');
                return;
              }
              setModalType('room');
            }}
          >
            <Ionicons name="cube-outline" size={18} color={colors.textLight} />
            <Text style={[styles.pickerValue, !selectedRoom && styles.placeholder]}>
              {selectedRoom ? `Room ${selectedRoom.number}` : selectedBlock ? 'Select Room' : 'Select a block first'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Type Selector */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Complaint Category *</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setModalType('type')}
          >
            <Ionicons name="pricetag-outline" size={18} color={colors.textLight} />
            <Text style={[styles.pickerValue, !selectedType && styles.placeholder]}>
              {selectedType || 'Select Category'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Remarks Input */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Issue Description / Remarks *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe the complaint in detail (e.g. PC won't power on, projector blinking red, AC leaking)..."
            placeholderTextColor={colors.textLight}
            value={remarks}
            onChangeText={setRemarks}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.btnRow}>
              <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Submit Complaint</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Universal Modal Picker */}
      <Modal visible={modalType !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalTop}>
              <Text style={styles.modalTitle}>
                {modalType === 'block' && 'Select Block'}
                {modalType === 'room' && 'Select Room'}
                {modalType === 'type' && 'Select Complaint Category'}
              </Text>
              <TouchableOpacity onPress={() => setModalType(null)}>
                <Ionicons name="close-circle" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {modalType === 'block' &&
                blocks.map((b) => (
                  <TouchableOpacity
                    key={b._id}
                    style={styles.modalItem}
                    onPress={() => handleSelectBlock(b)}
                  >
                    <Ionicons name="business" size={18} color={colors.primary} />
                    <Text style={styles.modalItemText}>{b.name}</Text>
                  </TouchableOpacity>
                ))}

              {modalType === 'room' &&
                rooms.map((r) => (
                  <TouchableOpacity
                    key={r._id}
                    style={styles.modalItem}
                    onPress={() => handleSelectRoom(r)}
                  >
                    <Ionicons name="cube" size={18} color={colors.secondary} />
                    <Text style={styles.modalItemText}>Room {r.number}</Text>
                  </TouchableOpacity>
                ))}

              {modalType === 'room' && rooms.length === 0 && (
                <View style={styles.emptyRooms}>
                  <Text style={styles.emptyRoomsText}>No rooms found for this block.</Text>
                </View>
              )}

              {modalType === 'type' &&
                COMPLAINT_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={styles.modalItem}
                    onPress={() => handleSelectType(t)}
                  >
                    <Ionicons name="pricetag" size={18} color={colors.indigo} />
                    <Text style={styles.modalItemText}>{t}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  disabledPicker: {
    opacity: 0.5,
  },
  pickerValue: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  placeholder: {
    color: colors.textLight,
  },
  textArea: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    height: 100,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
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
    maxHeight: '60%',
    padding: 20,
  },
  modalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  modalList: {
    marginBottom: 16,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  modalItemText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  emptyRooms: {
    padding: 24,
    alignItems: 'center',
  },
  emptyRoomsText: {
    fontSize: 13,
    color: colors.textMuted,
  },
});

export default RaiseTicketScreen;
