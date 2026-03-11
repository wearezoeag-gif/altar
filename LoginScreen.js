// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Background from '../components/Background';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) return Alert.alert('Atenção', 'Preencha email e senha.');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      Alert.alert('Erro de Login', e.message || 'Não foi possível entrar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Background />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={styles.logoWrap}>
            <LinearGradient colors={['rgba(96,165,250,0.6)', 'rgba(37,99,235,0.25)']} style={styles.orb}>
              <Text style={styles.orbLetter}>A</Text>
            </LinearGradient>
            <Text style={styles.logoText}>ALTAR</Text>
            <Text style={styles.logoSub}>Conecte-se com sua comunidade de fé</Text>
          </View>

          {/* Card */}
          <BlurView intensity={40} tint="dark" style={styles.card}>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="Seu e-mail"
                placeholderTextColor={colors.textDim}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Senha"
                placeholderTextColor={colors.textDim}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}
              />
              <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>{showPwd ? 'Ocultar' : 'Mostrar'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
              <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.btnGrad}>
                {loading
                  ? <ActivityIndicator color="white" />
                  : <Text style={styles.btnText}>Entrar</Text>}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.divLine} />
              <Text style={styles.divText}>Não tem conta?</Text>
              <View style={styles.divLine} />
            </View>

            <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.btnOutlineText}>Criar minha conta</Text>
            </TouchableOpacity>
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 0 },
  logoWrap: { alignItems: 'center', paddingVertical: 48 },
  orb: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  orbLetter: { color: 'white', fontSize: 32, fontWeight: '700' },
  logoText: { color: 'white', fontSize: 34, fontWeight: '700', letterSpacing: 8, marginBottom: 8 },
  logoSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center' },
  card: {
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    padding: 28, paddingBottom: 56, gap: 14,
    overflow: 'hidden',
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
  },
  inputIcon: { fontSize: 16 },
  input: { flex: 1, color: 'white', fontSize: 15 },
  btn: { borderRadius: 16, overflow: 'hidden' },
  btnGrad: { paddingVertical: 15, alignItems: 'center', borderRadius: 16 },
  btnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  divLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  divText: { color: 'rgba(255,255,255,0.35)', fontSize: 12 },
  btnOutline: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16, paddingVertical: 14, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  btnOutlineText: { color: 'white', fontSize: 15, fontWeight: '600' },
});
