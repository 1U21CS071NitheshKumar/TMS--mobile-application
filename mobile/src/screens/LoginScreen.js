import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { colors } from '../theme';
import { DEFAULT_API_URL, getDefaultApiUrl } from '../api';

const LoginScreen = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  
  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showServerInput, setShowServerInput] = useState(false);
  
  const { login, register, serverUrl, updateServerUrl } = useContext(AuthContext);
  const [tempUrl, setTempUrl] = useState(serverUrl);

  useEffect(() => {
    setTempUrl(serverUrl);
  }, [serverUrl]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err.message || 'Invalid credentials or server unreachable');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (!regUsername.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('Please fill all required fields (Username, Email, and Password).');
      return;
    }
    setError('');
    setRegSuccess('');
    setSubmitting(true);
    try {
      await register({
        username: regUsername.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        roleName: 'User'
      });
      setRegSuccess('User account created and signed in successfully! 🎉');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick 1-tap demo logins for Admin, Staff, and User
  const handleQuickLogin = async (userPreset, passPreset) => {
    setUsername(userPreset);
    setPassword(passPreset);
    setError('');
    setSubmitting(true);
    try {
      await login(userPreset, passPreset);
    } catch (err) {
      setError(err.message || 'Invalid credentials or server unreachable');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveUrl = async () => {
    if (tempUrl.trim()) {
      await updateServerUrl(tempUrl.trim());
      setShowServerInput(false);
      Alert.alert('Server Saved', `API URL set to:\n${tempUrl.trim()}`);
    }
  };

  const handleResetUrl = async () => {
    const currentDefault = getDefaultApiUrl();
    await updateServerUrl(currentDefault);
    setTempUrl(currentDefault);
    setShowServerInput(false);
    Alert.alert('Server Reset', `API URL reset to:\n${currentDefault}`);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Logo Badge */}
          <View style={styles.logoBadge}>
            <Ionicons name="shield-checkmark" size={36} color="#FFFFFF" />
          </View>

          <Text style={styles.appTitle}>TMS Mobile</Text>
          <Text style={styles.subtitle}>Ticket Management System</Text>

          {/* Mode Switcher */}
          <View style={styles.modeTabs}>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'login' && styles.activeModeTab]}
              onPress={() => {
                setMode('login');
                setError('');
              }}
            >
              <Ionicons
                name="log-in-outline"
                size={16}
                color={mode === 'login' ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.modeTabText, mode === 'login' && styles.activeModeTabText]}>
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeTab, mode === 'register' && styles.activeModeTab]}
              onPress={() => {
                setMode('register');
                setError('');
              }}
            >
              <Ionicons
                name="person-add-outline"
                size={16}
                color={mode === 'register' ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.modeTabText, mode === 'register' && styles.activeModeTabText]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Success Message */}
          {regSuccess ? (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.successText}>{regSuccess}</Text>
            </View>
          ) : null}

          {mode === 'login' ? (
            /* ================= LOGIN FORM ================= */
            <View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Username</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={18} color={colors.textLight} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter username"
                    placeholderTextColor={colors.textLight}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.textLight} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Enter password"
                    placeholderTextColor={colors.textLight}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={colors.textLight}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleLogin}
                disabled={submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <View style={styles.buttonInner}>
                    <Text style={styles.submitText}>Sign In</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>

              {/* Quick Demo Login for All 3 Roles */}
              <Text style={styles.quickFillHeader}>One-Tap Demo Login:</Text>
              <View style={styles.quickFillGrid}>
                <TouchableOpacity
                  style={[styles.quickFillBtn, submitting && { opacity: 0.6 }]}
                  disabled={submitting}
                  onPress={() => handleQuickLogin('admin', 'adminpassword')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="shield" size={14} color="#7C3AED" />
                  <Text style={[styles.quickFillText, { color: '#7C3AED' }]}>Admin</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickFillBtn, submitting && { opacity: 0.6 }]}
                  disabled={submitting}
                  onPress={() => handleQuickLogin('staff', 'staffpassword')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="construct" size={14} color="#2563EB" />
                  <Text style={[styles.quickFillText, { color: '#2563EB' }]}>Staff</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickFillBtn, submitting && { opacity: 0.6 }]}
                  disabled={submitting}
                  onPress={() => handleQuickLogin('user', 'userpassword')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="person" size={14} color="#059669" />
                  <Text style={[styles.quickFillText, { color: '#059669' }]}>User</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* ================= REGISTER FORM ================= */
            <View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Username *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={18} color={colors.textLight} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. rahul123"
                    placeholderTextColor={colors.textLight}
                    value={regUsername}
                    onChangeText={setRegUsername}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={18} color={colors.textLight} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. rahul@example.com"
                    placeholderTextColor={colors.textLight}
                    value={regEmail}
                    onChangeText={setRegEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={18} color={colors.textLight} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 9876543210"
                    placeholderTextColor={colors.textLight}
                    value={regPhone}
                    onChangeText={setRegPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <View style={styles.userRoleInfoBadge}>
                  <Ionicons name="information-circle" size={16} color={colors.primary} />
                  <Text style={styles.userRoleInfoText}>
                    Creating account as <Text style={{ fontWeight: '700', color: colors.primary }}>User</Text> (can raise and track maintenance complaints).
                  </Text>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Password *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.textLight} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Create a strong password"
                    placeholderTextColor={colors.textLight}
                    value={regPassword}
                    onChangeText={setRegPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={colors.textLight}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Register Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleRegister}
                disabled={submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <View style={styles.buttonInner}>
                    <Text style={styles.submitText}>Create Account & Sign In</Text>
                    <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Server Config Toggle */}
          <TouchableOpacity
            style={styles.serverToggle}
            onPress={() => setShowServerInput(!showServerInput)}
          >
            <Ionicons name="wifi-outline" size={14} color={colors.textMuted} />
            <Text style={styles.serverToggleText}>
              Backend: {serverUrl}
            </Text>
            <Ionicons
              name={showServerInput ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          {showServerInput && (
            <View style={styles.serverBox}>
              <Text style={styles.serverBoxLabel}>Configure API Endpoint:</Text>
              <TextInput
                style={styles.serverInput}
                value={tempUrl}
                onChangeText={setTempUrl}
                placeholder="http://10.44.187.140:5000/api"
                autoCapitalize="none"
              />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <TouchableOpacity style={[styles.saveServerBtn, { flex: 1 }]} onPress={handleSaveUrl}>
                  <Text style={styles.saveServerText}>Save Endpoint</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveServerBtn, { flex: 1, backgroundColor: '#E2E8F0' }]}
                  onPress={handleResetUrl}
                >
                  <Text style={[styles.saveServerText, { color: '#334155' }]}>Reset Default</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2F6',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 16,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeModeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  activeModeTabText: {
    color: colors.primary,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.dangerBg,
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
    flex: 1,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    height: 46,
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  eyeBtn: {
    padding: 8,
  },
  userRoleInfoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  userRoleInfoText: {
    fontSize: 12,
    color: colors.primaryDark,
    flex: 1,
    lineHeight: 16,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  quickFillHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickFillGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  quickFillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  quickFillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  serverToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  serverToggleText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  serverBox: {
    marginTop: 12,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  serverBoxLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
  serverInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.text,
    marginBottom: 8,
  },
  saveServerBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveServerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default LoginScreen;
