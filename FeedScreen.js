// src/screens/FeedScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, TextInput, Modal, ActivityIndicator, RefreshControl,
  Alert, Animated, Dimensions, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Polyline, Line, Rect } from 'react-native-svg';
import { postsAPI, formatTimeAgo } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

const { width: SW } = Dimensions.get('window');
const MENU_W = 272;

// ── Icons ─────────────────────────────────────────────────────────────────────
function IcoMenu() {
  return <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Line x1="3" y1="6" x2="21" y2="6" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    <Line x1="3" y1="12" x2="21" y2="12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    <Line x1="3" y1="18" x2="21" y2="18" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
  </Svg>;
}
function IcoSearch() {
  return <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke="white" strokeWidth="1.8" />
    <Path d="M21 21l-4.35-4.35" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
  </Svg>;
}
function IcoHeart({ filled }) {
  return <Svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#f472b6' : 'none'}>
    <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      stroke={filled ? '#f472b6' : 'rgba(255,255,255,0.55)'} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>;
}
function IcoComment() {
  return <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
      stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round" />
  </Svg>;
}
function IcoRepost() {
  return <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Polyline points="17,1 21,5 17,9" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M3 11V9a4 4 0 014-4h14" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round" />
    <Polyline points="7,23 3,19 7,15" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M21 13v2a4 4 0 01-4 4H3" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round" />
  </Svg>;
}
function IcoShare() {
  return <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round" />
    <Polyline points="16,6 12,2 8,6" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round" />
    <Line x1="12" y1="2" x2="12" y2="15" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round" />
  </Svg>;
}
function IcoSave({ filled }) {
  return <Svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#93c5fd' : 'none'}>
    <Path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"
      stroke={filled ? '#93c5fd' : 'rgba(255,255,255,0.55)'} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>;
}

// Side menu SVG icons
function IcoAlt() { return <Svg width="20" height="20" viewBox="0 0 24 24" fill="none"><Path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round" /></Svg>; }
function IcoBook() { return <Svg width="20" height="20" viewBox="0 0 24 24" fill="none"><Path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round" /><Path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round" /></Svg>; }
function IcoUsers() { return <Svg width="20" height="20" viewBox="0 0 24 24" fill="none"><Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round" /><Circle cx="9" cy="7" r="4" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" /><Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round" /></Svg>; }
function IcoMusic() { return <Svg width="20" height="20" viewBox="0 0 24 24" fill="none"><Path d="M9 18V5l12-2v13" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round" /><Circle cx="6" cy="18" r="3" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" /><Circle cx="18" cy="16" r="3" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" /></Svg>; }
function IcoCal() { return <Svg width="20" height="20" viewBox="0 0 24 24" fill="none"><Rect x="3" y="4" width="18" height="18" rx="2" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" /><Line x1="16" y1="2" x2="16" y2="6" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round" /><Line x1="8" y1="2" x2="8" y2="6" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round" /><Line x1="3" y1="10" x2="21" y2="10" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round" /></Svg>; }
function IcoSettings() { return <Svg width="20" height="20" viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="3" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" /><Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" /></Svg>; }
function IcoLogout() { return <Svg width="20" height="20" viewBox="0 0 24 24" fill="none"><Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="#f87171" strokeWidth="1.6" strokeLinecap="round" /><Polyline points="16,17 21,12 16,7" stroke="#f87171" strokeWidth="1.6" strokeLinecap="round" /><Line x1="21" y1="12" x2="9" y2="12" stroke="#f87171" strokeWidth="1.6" strokeLinecap="round" /></Svg>; }

// ── Side Menu ─────────────────────────────────────────────────────────────────
function SideMenu({ visible, onClose, user, onLogout }) {
  const slideX  = useRef(new Animated.Value(-MENU_W)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const insets  = useSafeAreaInsets();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.spring(slideX,  { toValue: 0,      useNativeDriver: true, tension: 80, friction: 12 }),
        Animated.timing(opacity, { toValue: 1,      duration: 200,         useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideX,  { toValue: -MENU_W, duration: 220, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0,        duration: 180, useNativeDriver: true }),
      ]).start(() => setMounted(false));
    }
  }, [visible]);

  if (!mounted) return null;

  const ITEMS = [
    { Icon: IcoAlt,      label: 'Meu Altar' },
    { Icon: IcoBook,     label: 'Devocional Diário' },
    { Icon: IcoUsers,    label: 'Grupos' },
    { Icon: IcoMusic,    label: 'Louvor' },
    { Icon: IcoCal,      label: 'Agenda' },
    { Icon: IcoSettings, label: 'Configurações' },
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents={visible ? 'auto' : 'none'}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} />
        </TouchableOpacity>
      </Animated.View>
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideX }], paddingTop: insets.top }]}>
        <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.drawerInner}>
          <View style={styles.drawerProfile}>
            <Image source={{ uri: user?.avatar }} style={styles.drawerAvatar} />
            <View>
              <Text style={styles.drawerName}>{user?.name}</Text>
              <Text style={styles.drawerUser}>@{user?.username}</Text>
            </View>
          </View>
          <View style={styles.drawerDivider} />
          {ITEMS.map(({ Icon, label }, i) => (
            <TouchableOpacity key={i} style={styles.menuRow} onPress={onClose}>
              <Icon />
              <Text style={styles.menuLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={[styles.menuRow, { marginBottom: 20 }]} onPress={onLogout}>
            <IcoLogout />
            <Text style={[styles.menuLabel, { color: '#f87171' }]}>Sair</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

// ── Composer ──────────────────────────────────────────────────────────────────
function ComposeBox({ user, onSubmit }) {
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  async function submit() {
    if (!text.trim()) return;
    setPosting(true);
    await onSubmit(text.trim());
    setText('');
    setPosting(false);
  }

  return (
    <View style={styles.composeBox}>
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.composeInner}>
        {user?.avatar ? <Image source={{ uri: user.avatar }} style={styles.composeAvatar} /> : null}
        <TextInput
          style={styles.composeInput}
          placeholder="O que está em seu coração? 🙏"
          placeholderTextColor="rgba(255,255,255,0.35)"
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity
          style={[styles.composeBtn, { opacity: text.trim() && !posting ? 1 : 0.4 }]}
          onPress={submit}
          disabled={!text.trim() || posting}
        >
          {posting
            ? <ActivityIndicator color="white" size="small" />
            : <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <Line x1="22" y1="2" x2="11" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <Path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="white" />
              </Svg>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Feed Screen ───────────────────────────────────────────────────────────────
export default function FeedScreen({ navigation, composerRef }) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState('');
  const [posting, setPosting] = useState(false);

  // Expose modal opener for + button
  FeedScreen.openComposer = () => setModalVisible(true);

  useEffect(() => { loadFeed(); }, []);

  async function loadFeed() {
    try {
      const data = await postsAPI.feed();
      setPosts(data.map(p => ({ ...p, time: formatTimeAgo(p.createdAt), likes: p.likesCount, comments: p.commentsCount })));
    } catch (e) { console.warn(e.message); }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true); await loadFeed(); setRefreshing(false);
  }, []);

  async function createPost(text) {
    try {
      const data = await postsAPI.create(text, null);
      setPosts(ps => [{ ...data, time: 'agora', likes: 0, comments: 0, liked: false, saved: false }, ...ps]);
    } catch (e) { Alert.alert('Erro', e.message); }
  }

  async function submitModal() {
    if (!modalText.trim()) return;
    setPosting(true);
    await createPost(modalText.trim());
    setModalText(''); setModalVisible(false); setPosting(false);
  }

  async function toggleLike(id) {
    setPosts(ps => ps.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p));
    try { await postsAPI.like(id); } catch { setPosts(ps => ps.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p)); }
  }

  async function toggleSave(id) {
    setPosts(ps => ps.map(p => p.id === id ? { ...p, saved: !p.saved } : p));
    try { await postsAPI.save(id); } catch { setPosts(ps => ps.map(p => p.id === id ? { ...p, saved: !p.saved } : p)); }
  }

  function renderPost({ item: p }) {
    return (
      <View style={styles.card}>
        <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.cardInner}>
          <View style={styles.postHdr}>
            <Image source={{ uri: p.author?.avatar }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                <Text style={styles.authorName}>{p.author?.name}</Text>
                <Text style={styles.authorUser}> @{p.author?.username}</Text>
                <Text style={styles.postTime}>{p.time}</Text>
              </View>
              <Text style={styles.postText}>{p.content}</Text>
            </View>
          </View>
          {p.image ? <Image source={{ uri: p.image }} style={styles.postImg} resizeMode="cover" /> : null}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.aBtn} onPress={() => toggleLike(p.id)}>
              <IcoHeart filled={p.liked} />
              <Text style={[styles.aCnt, p.liked && { color: '#f472b6' }]}>{p.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.aBtn}><IcoComment /><Text style={styles.aCnt}>{p.comments}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.aBtn}><IcoRepost /><Text style={styles.aCnt}>{p.reposts || 0}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.aBtn}><IcoShare /></TouchableOpacity>
            <TouchableOpacity style={styles.aBtn} onPress={() => toggleSave(p.id)}><IcoSave filled={p.saved} /></TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const HEADER_H = insets.top + 52;

  return (
    <View style={styles.container}>
      {/* Sky background */}
      <Image source={{ uri: 'https://images.unsplash.com/photo-1505533321630-975218a5f66f?w=800&q=80' }}
        style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient colors={['rgba(10,20,60,0.4)', 'rgba(6,8,16,0.78)']} style={StyleSheet.absoluteFill} />

      {/* Header — respects safe area */}
      <View style={[styles.header, { paddingTop: insets.top, height: HEADER_H }]}>
        <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.headerBorder} />
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.hBtn} onPress={() => setMenuVisible(true)}>
            <IcoMenu />
          </TouchableOpacity>
          <Text style={styles.logo}>ALTAR</Text>
          <TouchableOpacity style={styles.hBtn} onPress={() => navigation.navigate && navigation.getParent()?.navigate('Search')}>
            <IcoSearch />
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed list */}
      <FlatList
        data={posts}
        keyExtractor={p => String(p.id)}
        renderItem={renderPost}
        contentContainerStyle={[styles.list, { paddingTop: HEADER_H + 8 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />}
        ListHeaderComponent={
          <ComposeBox user={user} onSubmit={createPost} />
        }
        ListEmptyComponent={<View style={{ padding: 40, alignItems: 'center' }}><ActivityIndicator color="white" /></View>}
      />

      {/* Side Menu */}
      <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} user={user} onLogout={() => { setMenuVisible(false); logout(); }} />

      {/* Modal composer (opened by + button) */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <BlurView intensity={65} tint="dark" style={styles.modalSheet}>
            <View style={styles.modalHdr}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ color: colors.textMuted, fontWeight: '600', fontSize: 15 }}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Nova Publicação</Text>
              <TouchableOpacity
                style={[styles.pubBtn, { opacity: modalText.trim() && !posting ? 1 : 0.4 }]}
                onPress={submitModal} disabled={!modalText.trim() || posting}
              >
                {posting ? <ActivityIndicator color="white" size="small" /> : <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>Publicar</Text>}
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, padding: 16 }}>
              {user?.avatar ? <Image source={{ uri: user.avatar }} style={styles.modalAvatar} /> : null}
              <TextInput
                style={styles.modalInput}
                placeholder="O que está em seu coração hoje? 🙏"
                placeholderTextColor="rgba(255,255,255,0.35)"
                multiline maxLength={280}
                value={modalText} onChangeText={setModalText} autoFocus
              />
            </View>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060810' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, overflow: 'hidden' },
  headerBorder: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  headerRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  hBtn: { width: 38, height: 38, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  logo: { color: 'white', fontSize: 22, fontWeight: '700', letterSpacing: 4 },
  list: { paddingHorizontal: 14, gap: 12, paddingBottom: 120 },
  card: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  cardInner: { padding: 14 },
  postHdr: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  authorName: { color: 'white', fontWeight: '700', fontSize: 14 },
  authorUser: { color: colors.textMuted, fontSize: 12 },
  postTime: { color: colors.textDim, fontSize: 11, marginLeft: 'auto' },
  postText: { color: 'rgba(255,255,255,0.88)', fontSize: 14, lineHeight: 21 },
  postImg: { width: '100%', height: 200, borderRadius: 14, marginTop: 10 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  aBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  aCnt: { color: 'rgba(255,255,255,0.55)', fontSize: 12 },

  // Compose box (inline)
  composeBox: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', marginBottom: 12 },
  composeInner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  composeAvatar: { width: 36, height: 36, borderRadius: 18 },
  composeInput: { flex: 1, color: 'white', fontSize: 14, maxHeight: 80 },
  composeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },

  // Side menu
  drawer: { position: 'absolute', top: 0, bottom: 0, left: 0, width: MENU_W, overflow: 'hidden', borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  drawerInner: { flex: 1, paddingTop: 16 },
  drawerProfile: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, marginBottom: 16 },
  drawerAvatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  drawerName: { color: 'white', fontWeight: '700', fontSize: 15 },
  drawerUser: { color: colors.textMuted, fontSize: 12 },
  drawerDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 8 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  menuLabel: { color: 'rgba(255,255,255,0.82)', fontSize: 15, fontWeight: '500' },

  // Modal composer
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingBottom: 44, minHeight: 220, overflow: 'hidden' },
  modalHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  pubBtn: { backgroundColor: colors.primary, borderRadius: 50, paddingHorizontal: 18, paddingVertical: 7 },
  modalAvatar: { width: 40, height: 40, borderRadius: 20, marginTop: 2 },
  modalInput: { flex: 1, color: 'white', fontSize: 16, lineHeight: 24, minHeight: 80 },
});
