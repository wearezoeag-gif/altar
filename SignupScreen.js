// src/screens/SignupScreen.js
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

export default function SignupScreen({ navigation }) {
  const { signup } = useAuth();
  const [form, setForm] = useState({ firstName:'', lastName:'', username:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSignup() {
    if (!form.firstName || !form.email || !form.password)
      return Alert.alert('Atenção', 'Preencha nome, email e senha.');
    setLoading(true);
    try {
      await signup(form);
    } catch (e) {
      Alert.alert('Erro', e.message || 'Não foi possível criar conta.');
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { key: 'firstName', placeholder: 'Nome', icon: '👤' },
    { key: 'lastName',  placeholder: 'Sobrenome', icon: '👤' },
    { key: 'username',  placeholder: 'Nome de usuário', icon: '@', autoCapitalize: 'none' },
    { key: 'email',     placeholder: 'E-mail', icon: '✉️', keyboardType: 'email-address', autoCapitalize: 'none' },
  ];

  return (
    <View style={styles.container}>
      <Background />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logoWrap}>
            <Text style={styles.logoText}>ALTAR</Text>
            <Text style={styles.logoSub}>Crie sua conta e junte-se à comunidade</Text>
          </View>

          <BlurView intensity={40} tint="dark" style={styles.card}>
            {fields.map(f => (
              <View key={f.key} style={styles.inputWrap}>
                <Text style={styles.inputIcon}>{f.icon}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.textDim}
                  value={form[f.key]}
                  onChangeText={set(f.key)}
                  keyboardType={f.keyboardType}
                  autoCapitalize={f.autoCapitalize || 'words'}
                  autoCorrect={false}
                />
              </View>
            ))}

            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Senha"
                placeholderTextColor={colors.textDim}
                value={form.password}
                onChangeText={set('password')}
                secureTextEntry={!showPwd}
              />
              <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>{showPwd ? 'Ocultar' : 'Mostrar'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.btn} onPress={handleSignup} disabled={loading}>
              <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.btnGrad}>
                {loading
                  ? <ActivityIndicator color="white" />
                  : <Text style={styles.btnText}>Criar Conta</Text>}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignItems: 'center', paddingVertical: 4 }}>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Já tenho conta</Text>
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
  scroll: { flexGrow: 1, justifyContent: 'flex-end' },
  logoWrap: { alignItems: 'center', paddingVertical: 36 },
  logoText: { color: 'white', fontSize: 34, fontWeight: '700', letterSpacing: 8, marginBottom: 8 },
  logoSub: { color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center' },
  card: {
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    padding: 28, paddingBottom: 56, gap: 12,
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
  btn: { borderRadius: 16, overflow: 'hidden', marginTop: 4 },
  btnGrad: { paddingVertical: 15, alignItems: 'center', borderRadius: 16 },
  btnText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
