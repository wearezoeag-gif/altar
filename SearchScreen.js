// src/screens/SearchScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, Image, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { usersAPI, eventsAPI } from '../services/api';
import { colors } from '../theme';

function IcoSearch() {
  return <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" />
    <Path d="M21 21l-4.35-4.35" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round" />
  </Svg>;
}
function IcoBack() {
  return <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 5l-7 7 7 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}

export default function SearchScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery]     = useState('');
  const [filter, setFilter]   = useState('users');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(text) {
    setQuery(text);
    if (!text.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      if (filter === 'users') {
        const data = await usersAPI.search(text);
        setResults(data);
      } else {
        const data = await eventsAPI.list();
        setResults(data.filter(e => e.title.toLowerCase().includes(text.toLowerCase())));
      }
    } catch (e) { console.warn(e.message); }
    finally { setLoading(false); }
  }

  function changeFilter(f) {
    setFilter(f); setResults([]); setQuery('');
  }

  function renderUser({ item: u }) {
    return (
      <TouchableOpacity style={styles.card}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <Image source={{ uri: u.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{u.name}</Text>
          <Text style={styles.sub}>@{u.username}</Text>
          {u.bio ? <Text style={styles.bio} numberOfLines={1}>{u.bio}</Text> : null}
        </View>
        <TouchableOpacity style={styles.followBtn}>
          <Text style={styles.followTxt}>Seguir</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  function renderEvent({ item: e }) {
    return (
      <TouchableOpacity style={styles.card}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <Image source={{ uri: e.image }} style={styles.evImg} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{e.title}</Text>
          <Text style={styles.sub}>📅 {e.date}</Text>
          <Text style={styles.sub}>📍 {e.city}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Image source={{ uri: 'https://images.unsplash.com/photo-1505533321630-975218a5f66f?w=800&q=80' }}
        style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient colors={['rgba(10,20,60,0.5)', 'rgba(6,8,16,0.85)']} style={StyleSheet.absoluteFill} />

      {/* Search bar */}
      <BlurView intensity={40} tint="dark" style={styles.searchBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <IcoBack />
        </TouchableOpacity>
        <View style={styles.searchWrap}>
          <IcoSearch />
          <TextInput
            style={styles.searchInput}
            placeholder={filter === 'users' ? 'Buscar usuários...' : 'Buscar eventos...'}
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={query} onChangeText={handleSearch}
            autoCorrect={false} autoCapitalize="none" autoFocus
          />
          {query ? (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
              <Text style={{ color: colors.textMuted, fontSize: 17 }}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </BlurView>

      {/* Filter */}
      <View style={styles.tabBar}>
        {[{ key: 'users', label: 'Usuários' }, { key: 'events', label: 'Eventos' }].map(t => (
          <TouchableOpacity key={t.key}
            style={[styles.tabBtn, filter === t.key && styles.tabBtnActive]}
            onPress={() => changeFilter(t.key)}>
            <Text style={[styles.tabTxt, filter === t.key && styles.tabTxtActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading
        ? <ActivityIndicator color="white" style={{ marginTop: 40 }} />
        : (
          <FlatList data={results} keyExtractor={i => String(i.id)}
            renderItem={filter === 'users' ? renderUser : renderEvent}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              !query ? (
                <View style={{ alignItems: 'center', marginTop: 60, gap: 12 }}>
                  <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <Circle cx="11" cy="11" r="8" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                    <Path d="M21 21l-4.35-4.35" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
                  </Svg>
                  <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center' }}>
                    {filter === 'users' ? 'Encontre pessoas da comunidade' : 'Descubra eventos cristãos'}
                  </Text>
                </View>
              ) : (
                <View style={{ alignItems: 'center', marginTop: 40 }}>
                  <Text style={{ color: colors.textMuted, fontSize: 14 }}>Nenhum resultado encontrado</Text>
                </View>
              )
            }
          />
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  searchInput: { flex: 1, color: 'white', fontSize: 15 },
  tabBar: { flexDirection: 'row', margin: 14, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  tabBtnActive: { backgroundColor: colors.primary },
  tabTxt: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  tabTxtActive: { color: 'white' },
  list: { paddingHorizontal: 14, gap: 10, paddingBottom: 120 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, padding: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  evImg: { width: 64, height: 50, borderRadius: 10 },
  name: { color: 'white', fontWeight: '600', fontSize: 14, marginBottom: 2 },
  sub: { color: colors.textMuted, fontSize: 12 },
  bio: { color: colors.textDim, fontSize: 11, marginTop: 2 },
  followBtn: { backgroundColor: colors.primary, borderRadius: 50, paddingHorizontal: 14, paddingVertical: 7 },
  followTxt: { color: 'white', fontSize: 12, fontWeight: '600' },
});
