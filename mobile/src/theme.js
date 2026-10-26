export const colors = {
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  primaryLight: '#DBEAFE',
  secondary: '#4F46E5',
  background: '#F8FAFC',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  text: '#0F172A',
  textMuted: '#64748B',
  textLight: '#94A3B8',
  danger: '#EF4444',
  dangerBg: '#FEE2E2',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  success: '#10B981',
  successBg: '#D1FAE5',
  info: '#3B82F6',
  infoBg: '#EFF6FF',
  indigo: '#6366F1',
  indigoBg: '#EEF2FF',
  purple: '#8B5CF6',
  purpleBg: '#F5F3FF',
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'Pending':
      return { text: '#B45309', bg: '#FEF3C7', border: '#FDE68A' };
    case 'Assigned':
      return { text: '#4338CA', bg: '#EEF2FF', border: '#C7D2FE' };
    case 'In-Progress':
      return { text: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' };
    case 'OnHold':
      return { text: '#BE123C', bg: '#FFE4E6', border: '#FECDD3' };
    case 'Completed':
      return { text: '#047857', bg: '#D1FAE5', border: '#A7F3D0' };
    case 'Closed':
      return { text: '#475569', bg: '#F1F5F9', border: '#E2E8F0' };
    default:
      return { text: '#475569', bg: '#F1F5F9', border: '#E2E8F0' };
  }
};
