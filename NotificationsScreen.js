// src/screens/NotificationsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { notificationsAPI, formatTimeAgo } from '../services/api';
import { colors } from '../theme';

const ICON = { like: '❤️', follow: '👤', comment: '💬', event: '📅' };

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsAPI.list()
      .then(data => setNotifs(data))
      .catch(e => console.warn(e.message))
      .finally(() => setLoading(false));
  }, []);

  function renderItem({ item: n }) {
    const user = n.fromUser || n.user || {};
    return (
      <TouchableOpacity style={styles.card}>
        <View style={styles.avatarWrap}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View style={styles.iconBadge}>
            <Text style={{ fontSize: 11 }}>{ICON[n.type] || '🔔'}</Text>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.text}>
            <Text style={{ fontWeight: '700', color: 'white' }}>{user.name} </Text>
            <Text style={{ color: colors.textMuted }}>{n.text}</Text>
          </Text>
          <Text style={styles.time}>{n.time || formatTimeAgo(n.createdAt)}</Text>
        </View>
        {n.thumb ? (
          <Image source={{ uri: n.thumb }} style={styles.thumb} />
        ) : null}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0a1440', '#060810']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.logo}>ALTAR</Text>
        <Text style={styles.headerSub}>Notificações</Text>
      </View>

      {loading
        ? <ActivityIndicator color="white" style={{ marginTop: 40 }} />
        : (
          <FlatList
            data={notifs}
            keyExtractor={n => String(n.id)}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 14, gap: 10 }}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', marginTop: 60 }}>
                <Text style={{ fontSize: 36, marginBottom: 12 }}>🔔</Text>
                <Text style={{ color: colors.textMuted, fontSize: 14 }}>Nenhuma notificação ainda</Text>
              </View>
            }
          />
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  logo: { color: 'white', fontSize: 22, fontWeight: '700', letterSpacing: 4 },
  headerSub: { color: colors.textMuted, fontSize: 13 },
  card: {
    flexDirection: 'row', gap: 12, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  iconBadge: {
    position: 'absolute', bottom: -2, right: -2,
    backgroundColor: '#1e293b', borderRadius: 10,
    width: 22, height: 22, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
  },
  text: { fontSize: 13, lineHeight: 19, flexShrink: 1 },
  time: { color: colors.textDim, fontSize: 11, marginTop: 3 },
  thumb: { width: 44, height: 44, borderRadius: 10 },
});
