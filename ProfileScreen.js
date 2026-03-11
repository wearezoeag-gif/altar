// src/screens/ProfileScreen.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Rect, Polyline } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

const MOCK_IMGS = [
  'https://images.unsplash.com/photo-1612350275854-f96a246cfc2a?w=300&q=80',
  'https://images.unsplash.com/photo-1614054111655-10c58a264433?w=300&q=80',
  'https://images.unsplash.com/photo-1520869578617-557561d7b114?w=300&q=80',
  'https://images.unsplash.com/photo-1617196288062-49bf97a38d9e?w=300&q=80',
  'https://images.unsplash.com/photo-1768776184929-614344eecfad?w=300&q=80',
  'https://images.unsplash.com/photo-1715808095915-588922b7a0fb?w=300&q=80',
];

const MOCK_EVENTS = [
  { id: 1, title: 'Noite de Adoração 2026', date: '15 Mar', city: 'São Paulo, SP', image: 'https://images.unsplash.com/photo-1614054111655-10c58a264433?w=300&q=80' },
  { id: 2, title: 'Estudo Bíblico para Jovens', date: '18 Mar', city: 'Rio de Janeiro, RJ', image: 'https://images.unsplash.com/photo-1520869578617-557561d7b114?w=300&q=80' },
];

function IcoPencil() { return <Svg width="16" height="16" viewBox="0 0 24 24" fill="none"><Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></Svg>; }

function AgendaCalendar({ events }) {
  const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const eventDays = events.map(e => parseInt(e.date));
  return (
    <View style={styles.calendar}>
      <View style={styles.calRow}>
        {days.map((d, i) => (
          <View key={i} style={styles.calCell}>
            <Text style={styles.calDayHdr}>{d}</Text>
          </View>
        ))}
      </View>
      <View style={styles.calRow}>
        {Array.from({ length: 31 }, (_, i) => i + 1).map(n => {
          const hasEv = eventDays.includes(n);
          return (
            <TouchableOpacity key={n} style={[styles.calCell, hasEv && styles.calCellEv]}>
              <Text style={[styles.calDate, hasEv && styles.calDateEv]}>{n}</Text>
              {hasEv && <View style={styles.calDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [tab, setTab]       = useState('posts');
  const [agView, setAgView] = useState('list');

  const TABS = [
    { key: 'posts',  label: 'Posts' },
    { key: 'saved',  label: 'Salvos' },
    { key: 'liked',  label: 'Curtidos' },
    { key: 'agenda', label: 'Eventos' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Image source={{ uri: 'https://images.unsplash.com/photo-1505533321630-975218a5f66f?w=800&q=80' }}
        style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient colors={['rgba(10,20,60,0.4)', 'rgba(6,8,16,0.9)']} style={StyleSheet.absoluteFill} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Cover */}
        <View style={styles.cover}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1614054111655-10c58a264433?w=700&q=80' }}
            style={StyleSheet.absoluteFill} resizeMode="cover" />
          <LinearGradient colors={['transparent', 'rgba(6,8,16,0.9)']} style={StyleSheet.absoluteFill} />
          <TouchableOpacity style={styles.logoutBtn}
            onPress={() => Alert.alert('Sair', 'Deseja sair?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Sair', style: 'destructive', onPress: logout },
            ])}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Sair</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Image source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?img=47' }} style={styles.avatar} />
          <Text style={styles.name}>{user?.name || 'Usuário'}</Text>
          <Text style={styles.username}>@{user?.username || 'usuario'}</Text>
          {user?.location ? <Text style={styles.loc}>📍 {user.location}</Text> : null}
          {user?.website  ? <Text style={styles.web}>🔗 {user.website}</Text>  : null}

          {/* Stats */}
          <BlurView intensity={30} tint="dark" style={styles.statsCard}>
            {[
              { n: user?.followingCount || 0, l: 'Seguindo' },
              { n: user?.followersCount || 0, l: 'Seguidores' },
              { n: 89,                         l: 'Posts' },
            ].map((s, i, arr) => (
              <React.Fragment key={s.l}>
                <View style={styles.stat}>
                  <Text style={styles.statN}>{s.n}</Text>
                  <Text style={styles.statL}>{s.l}</Text>
                </View>
                {i < arr.length - 1 && <View style={styles.statDiv} />}
              </React.Fragment>
            ))}
          </BlurView>

          {/* Bio */}
          {user?.bio ? (
            <BlurView intensity={25} tint="dark" style={styles.bioCard}>
              <Text style={styles.bio}>{user.bio}</Text>
            </BlurView>
          ) : null}

          {/* Edit button */}
          <TouchableOpacity style={styles.editBtn}>
            <IcoPencil />
            <Text style={styles.editTxt}>Editar Perfil</Text>
          </TouchableOpacity>

          {/* Tabs */}
          <View style={styles.tabBar}>
            {TABS.map(t => (
              <TouchableOpacity key={t.key}
                style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
                onPress={() => setTab(t.key)}>
                <Text style={[styles.tabTxt, tab === t.key && styles.tabTxtActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          {tab === 'agenda' ? (
            <View style={{ width: '100%' }}>
              <View style={styles.agToggle}>
                {[{ key: 'list', label: 'Lista' }, { key: 'calendar', label: 'Calendário' }].map(a => (
                  <TouchableOpacity key={a.key}
                    style={[styles.agBtn, agView === a.key && styles.agBtnActive]}
                    onPress={() => setAgView(a.key)}>
                    <Text style={[styles.agTxt, agView === a.key && styles.agTxtActive]}>{a.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {agView === 'list' ? (
                <View style={{ gap: 10 }}>
                  {MOCK_EVENTS.map(ev => (
                    <BlurView key={ev.id} intensity={25} tint="dark" style={styles.evCard}>
                      <Image source={{ uri: ev.image }} style={styles.evImg} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.evTitle}>{ev.title}</Text>
                        <Text style={styles.evMeta}>📅 {ev.date}</Text>
                        <Text style={styles.evMeta}>📍 {ev.city}</Text>
                      </View>
                    </BlurView>
                  ))}
                </View>
              ) : (
                <AgendaCalendar events={MOCK_EVENTS} />
              )}
            </View>
          ) : (
            <View style={styles.grid}>
              {MOCK_IMGS.slice(0, tab === 'liked' ? 4 : 6).map((img, i) => (
                <Image key={i} source={{ uri: img }} style={styles.gridImg} resizeMode="cover" />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cover: { height: 200 },
  logoutBtn: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  info: { alignItems: 'center', marginTop: -56, paddingHorizontal: 16 },
  avatar: { width: 104, height: 104, borderRadius: 52, borderWidth: 3, borderColor: 'rgba(255,255,255,0.65)' },
  name: { color: 'white', fontSize: 20, fontWeight: '700', marginTop: 10 },
  username: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  loc: { color: colors.textDim, fontSize: 12, marginTop: 4 },
  web: { color: colors.primaryLight, fontSize: 12, marginTop: 2 },
  statsCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, paddingVertical: 14, width: '100%', marginTop: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  stat: { flex: 1, alignItems: 'center' },
  statN: { color: 'white', fontWeight: '700', fontSize: 18 },
  statL: { color: colors.textMuted, fontSize: 11 },
  statDiv: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.12)' },
  bioCard: { borderRadius: 16, padding: 14, width: '100%', marginTop: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  bio: { color: 'rgba(255,255,255,0.82)', fontSize: 13, lineHeight: 20 },
  editBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 12, paddingVertical: 11, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 50 },
  editTxt: { color: 'white', fontWeight: '600', fontSize: 14 },
  tabBar: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 4, width: '100%', marginTop: 14 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 14 },
  tabBtnActive: { backgroundColor: colors.primary },
  tabTxt: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  tabTxtActive: { color: 'white' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14, width: '100%' },
  gridImg: { width: '47%', aspectRatio: 1, borderRadius: 14 },
  agToggle: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 3, width: '100%', marginTop: 14, marginBottom: 12 },
  agBtn: { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: 11 },
  agBtnActive: { backgroundColor: colors.primary },
  agTxt: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  agTxtActive: { color: 'white' },
  evCard: { flexDirection: 'row', gap: 12, alignItems: 'center', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  evImg: { width: 60, height: 50, borderRadius: 10 },
  evTitle: { color: 'white', fontWeight: '600', fontSize: 13, marginBottom: 3 },
  evMeta: { color: colors.textMuted, fontSize: 11 },
  calendar: { width: '100%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  calRow: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  calCellEv: { backgroundColor: 'rgba(37,99,235,0.3)', borderRadius: 8 },
  calDayHdr: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '600' },
  calDate: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  calDateEv: { color: colors.primaryLight, fontWeight: '700' },
  calDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary, marginTop: 1 },
});
