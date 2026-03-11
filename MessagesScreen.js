// src/screens/MessagesScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, TextInput, KeyboardAvoidingView, Platform,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg';
import { messagesAPI, notificationsAPI, formatTimeAgo } from '../services/api';
import { colors } from '../theme';

const ICON_TYPE = { like: '❤️', follow: '👤', comment: '💬', event: '📅' };

function IcoBack() { return <Svg width="22" height="22" viewBox="0 0 24 24" fill="none"><Path d="M19 12H5M12 5l-7 7 7 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IcoSend() { return <Svg width="20" height="20" viewBox="0 0 24 24" fill="none"><Path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="white" /></Svg>; }

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter]   = useState('messages'); // 'messages' | 'notifications'
  const [convs, setConvs]     = useState([]);
  const [notifs, setNotifs]   = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages]     = useState([]);
  const [text, setText]             = useState('');
  const [loading, setLoading]       = useState(true);
  const listRef = useRef(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [c, n] = await Promise.all([messagesAPI.conversations(), notificationsAPI.list()]);
      setConvs(c); setNotifs(n);
    } catch (e) { console.warn(e.message); }
    finally { setLoading(false); }
  }

  async function openConv(conv) {
    setActiveConv(conv);
    try {
      const data = await messagesAPI.messages(conv.id);
      setMessages(data.messages || []);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
    } catch (e) { console.warn(e.message); }
  }

  async function sendMessage() {
    if (!text.trim() || !activeConv) return;
    const msg = { id: Date.now(), text: text.trim(), mine: true, time: 'agora' };
    setMessages(ms => [...ms, msg]); setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    try { await messagesAPI.send(activeConv.id, msg.text); } catch (e) { console.warn(e.message); }
  }

  // ── Chat view ──────────────────────────────────────────────────────────────
  if (activeConv) {
    const participant = activeConv.participant || activeConv.user || {};
    return (
      <KeyboardAvoidingView style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1505533321630-975218a5f66f?w=800&q=80' }}
          style={StyleSheet.absoluteFill} resizeMode="cover" />
        <LinearGradient colors={['rgba(10,20,60,0.5)', 'rgba(6,8,16,0.85)']} style={StyleSheet.absoluteFill} />

        <BlurView intensity={45} tint="dark" style={styles.chatHdr}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setActiveConv(null)}>
            <IcoBack />
          </TouchableOpacity>
          <Image source={{ uri: participant.avatar }} style={styles.chatAvatar} />
          <View>
            <Text style={styles.chatName}>{participant.name}</Text>
            <Text style={styles.chatUser}>@{participant.username}</Text>
          </View>
        </BlurView>

        <FlatList ref={listRef} data={messages} keyExtractor={m => String(m.id)}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 20 }}
          renderItem={({ item: m }) => (
            <View style={{ alignItems: m.mine ? 'flex-end' : 'flex-start' }}>
              <View style={[styles.bubble, m.mine ? styles.bubbleMine : styles.bubbleOther]}>
                <Text style={{ color: 'white', fontSize: 14, lineHeight: 21 }}>{m.text}</Text>
                <Text style={styles.bubbleTime}>{m.time}</Text>
              </View>
            </View>
          )}
        />

        <BlurView intensity={45} tint="dark" style={styles.inputBar}>
          <TextInput style={styles.chatInput} placeholder="Escreva uma mensagem..."
            placeholderTextColor={colors.textDim} value={text} onChangeText={setText}
            onSubmitEditing={sendMessage} returnKeyType="send" />
          <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}><IcoSend /></TouchableOpacity>
        </BlurView>
      </KeyboardAvoidingView>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Image source={{ uri: 'https://images.unsplash.com/photo-1505533321630-975218a5f66f?w=800&q=80' }}
        style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient colors={['rgba(10,20,60,0.5)', 'rgba(6,8,16,0.85)']} style={StyleSheet.absoluteFill} />

      {/* Filter tabs */}
      <BlurView intensity={40} tint="dark" style={styles.filterBar}>
        {['messages', 'notifications'].map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}>
            <Text style={[styles.filterTxt, filter === f && styles.filterTxtActive]}>
              {f === 'messages' ? 'Mensagens' : 'Notificações'}
            </Text>
          </TouchableOpacity>
        ))}
      </BlurView>

      {loading
        ? <ActivityIndicator color="white" style={{ marginTop: 60 }} />
        : filter === 'messages'
          ? (
            <FlatList data={convs} keyExtractor={c => String(c.id)}
              contentContainerStyle={styles.listContent}
              refreshControl={<RefreshControl refreshing={false} onRefresh={loadAll} tintColor="white" />}
              renderItem={({ item: c }) => {
                const u = c.participant || c.user || {};
                return (
                  <TouchableOpacity style={styles.convCard} onPress={() => openConv(c)}>
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    <View style={{ position: 'relative' }}>
                      <Image source={{ uri: u.avatar }} style={styles.convAvatar} />
                      {c.unread && <View style={styles.unreadDot} />}
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={styles.convMeta}>
                        <Text style={styles.convName}>{u.name}</Text>
                        <Text style={styles.convTime}>{c.time || formatTimeAgo(c.lastMessageAt)}</Text>
                      </View>
                      <Text style={[styles.convLast, c.unread && { color: 'white', fontWeight: '600' }]}
                        numberOfLines={1}>{c.lastMsg || c.lastMessage}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={<View style={{ alignItems: 'center', marginTop: 60 }}>
                <Text style={{ color: colors.textMuted, fontSize: 14 }}>Nenhuma mensagem ainda</Text>
              </View>}
            />
          ) : (
            <FlatList data={notifs} keyExtractor={n => String(n.id)}
              contentContainerStyle={styles.listContent}
              renderItem={({ item: n }) => {
                const u = n.fromUser || n.user || {};
                return (
                  <TouchableOpacity style={styles.convCard}>
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    <View style={styles.notifAvatarWrap}>
                      <Image source={{ uri: u.avatar }} style={styles.convAvatar} />
                      <View style={styles.notifIcon}>
                        <Text style={{ fontSize: 10 }}>{ICON_TYPE[n.type] || '🔔'}</Text>
                      </View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, lineHeight: 19 }}>
                        <Text style={{ fontWeight: '700', color: 'white' }}>{u.name} </Text>
                        <Text style={{ color: colors.textMuted }}>{n.text}</Text>
                      </Text>
                      <Text style={styles.convTime}>{n.time || formatTimeAgo(n.createdAt)}</Text>
                    </View>
                    {n.thumb ? <Image source={{ uri: n.thumb }} style={styles.notifThumb} /> : null}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={<View style={{ alignItems: 'center', marginTop: 60 }}>
                <Text style={{ color: colors.textMuted, fontSize: 14 }}>Nenhuma notificação ainda</Text>
              </View>}
            />
          )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterBar: {
    flexDirection: 'row', overflow: 'hidden',
    borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  filterBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderColor: 'transparent' },
  filterBtnActive: { borderColor: colors.primary },
  filterTxt: { color: 'rgba(255,255,255,0.45)', fontSize: 14, fontWeight: '600' },
  filterTxtActive: { color: 'white' },
  listContent: { padding: 14, gap: 10, paddingBottom: 120 },
  convCard: { flexDirection: 'row', gap: 12, alignItems: 'center', borderRadius: 18, padding: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  convAvatar: { width: 50, height: 50, borderRadius: 25 },
  unreadDot: { position: 'absolute', top: 1, right: 1, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary, borderWidth: 2, borderColor: 'rgba(6,8,16,0.9)' },
  convMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  convName: { color: 'white', fontWeight: '600', fontSize: 14 },
  convTime: { color: colors.textDim, fontSize: 11 },
  convLast: { color: colors.textMuted, fontSize: 13 },
  notifAvatarWrap: { position: 'relative' },
  notifIcon: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#1e293b', borderRadius: 10, width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)' },
  notifThumb: { width: 44, height: 44, borderRadius: 10 },

  // Chat
  chatHdr: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 8 },
  chatAvatar: { width: 36, height: 36, borderRadius: 18 },
  chatName: { color: 'white', fontWeight: '600', fontSize: 14 },
  chatUser: { color: colors.textMuted, fontSize: 11 },
  bubble: { maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: 'rgba(255,255,255,0.18)', borderBottomLeftRadius: 4 },
  bubbleTime: { color: 'rgba(255,255,255,0.45)', fontSize: 10, marginTop: 3 },
  inputBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingBottom: 28, overflow: 'hidden' },
  chatInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 50, paddingHorizontal: 16, paddingVertical: 10, color: 'white', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
