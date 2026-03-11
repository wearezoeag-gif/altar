// src/screens/EventsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, Modal, ScrollView, RefreshControl, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { eventsAPI } from '../services/api';
import Background from '../components/Background';
import { colors } from '../theme';

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents() {
    try {
      const data = await eventsAPI.list();
      setEvents(data);
      setSavedIds(data.filter(e => e.saved).map(e => e.id));
    } catch (e) { console.warn(e.message); }
  }

  async function toggleAgenda(id) {
    setSavedIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
    try { await eventsAPI.save(id); }
    catch { setSavedIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]); }
  }

  function renderEvent({ item: ev }) {
    const saved = savedIds.includes(ev.id);
    return (
      <TouchableOpacity style={styles.card} onPress={() => setSelectedEvent(ev)}>
        <View style={styles.imgWrap}>
          <Image source={{ uri: ev.image }} style={styles.img} resizeMode="cover" />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={StyleSheet.absoluteFill} />
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>{ev.date}</Text>
          </View>
          {saved && (
            <View style={styles.savedBadge}>
              <Text style={styles.savedBadgeText}>✓ Na Agenda</Text>
            </View>
          )}
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.evTitle}>{ev.title}</Text>
          <Text style={styles.evDetail}>📅 {ev.fullDate}</Text>
          <Text style={styles.evLocation}>📍 {ev.city}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Background />

      <FlatList
        data={events}
        keyExtractor={e => String(e.id)}
        renderItem={renderEvent}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => { setRefreshing(true); await loadEvents(); setRefreshing(false); }}
            tintColor="white"
          />
        }
        ListEmptyComponent={<ActivityIndicator color="white" style={{ marginTop: 40 }} />}
        ListHeaderComponent={
          <BlurView intensity={30} tint="dark" style={styles.listHeader}>
            <Text style={styles.listHeaderTxt}>Eventos Cristãos</Text>
          </BlurView>
        }
      />

      {/* Event Detail Modal */}
      <Modal visible={!!selectedEvent} animationType="slide" transparent>
        {selectedEvent && (
          <View style={styles.modalOuter}>
            <Background />
            <ScrollView style={styles.modalScroll} bounces={false}>
              <View style={{ height: 240 }}>
                <Image source={{ uri: selectedEvent.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                <LinearGradient colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']} style={StyleSheet.absoluteFill} />
                <TouchableOpacity style={[styles.closeBtn, { top: insets.top + 12 }]} onPress={() => setSelectedEvent(null)}>
                  <Text style={{ color: 'white', fontSize: 20 }}>←</Text>
                </TouchableOpacity>
                <View style={[styles.evDateBadge, { top: insets.top + 12 }]}>
                  <Text style={styles.dateBadgeText}>{selectedEvent.date}</Text>
                </View>
              </View>

              <BlurView intensity={25} tint="dark" style={styles.detailCard}>
                <Text style={styles.detailTitle}>{selectedEvent.title}</Text>
                <Text style={styles.detailMeta}>📅 {selectedEvent.fullDate}</Text>
                <Text style={styles.detailMeta}>📍 {selectedEvent.location} · {selectedEvent.city}</Text>

                <View style={styles.infoRow}>
                  <View style={styles.infoBadge}>
                    <Text style={styles.infoLabel}>VALOR</Text>
                    <Text style={styles.infoValue}>{selectedEvent.price}</Text>
                  </View>
                  <View style={styles.infoBadge}>
                    <Text style={styles.infoLabel}>CAPACIDADE</Text>
                    <Text style={styles.infoValue}>{selectedEvent.cap}</Text>
                  </View>
                </View>

                <View style={styles.divider} />
                <Text style={styles.sectionLabel}>SOBRE O EVENTO</Text>
                <Text style={styles.detailDesc}>{selectedEvent.desc}</Text>

                <TouchableOpacity style={styles.buyBtn}>
                  <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.buyBtnGrad}>
                    <Text style={styles.buyBtnText}>🎟️  Comprar Ingresso</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.agendaBtn, savedIds.includes(selectedEvent.id) && styles.agendaBtnSaved]}
                  onPress={() => toggleAgenda(selectedEvent.id)}
                >
                  <Text style={[styles.agendaBtnText, savedIds.includes(selectedEvent.id) && { color: colors.primaryLight }]}>
                    {savedIds.includes(selectedEvent.id) ? '✓ Adicionado à Agenda' : '📅 Adicionar à Minha Agenda'}
                  </Text>
                </TouchableOpacity>
              </BlurView>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listHeader: {
    marginHorizontal: 0, marginBottom: 8, paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 0, overflow: 'hidden',
    borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  listHeaderTxt: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '600', letterSpacing: 1.5 },
  list: { padding: 14, gap: 14, paddingBottom: 120 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  imgWrap: { height: 170, position: 'relative' },
  img: { width: '100%', height: '100%' },
  dateBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: colors.primary, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  dateBadgeText: { color: 'white', fontSize: 11, fontWeight: '600' },
  savedBadge: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: colors.primary,
  },
  savedBadgeText: { color: colors.primaryLight, fontSize: 10, fontWeight: '600' },
  cardBody: { padding: 14 },
  evTitle: { color: 'white', fontWeight: '700', fontSize: 15, marginBottom: 5 },
  evDetail: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 3 },
  evLocation: { color: 'rgba(255,255,255,0.45)', fontSize: 12 },

  // Modal
  modalOuter: { flex: 1 },
  modalScroll: { flex: 1 },
  closeBtn: {
    position: 'absolute', left: 16,
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 12, padding: 10,
  },
  evDateBadge: {
    position: 'absolute', right: 16,
    backgroundColor: colors.primary, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  detailCard: {
    borderRadius: 22, margin: 12, marginTop: -28, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  detailTitle: { color: 'white', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  detailMeta: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 5 },
  infoRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  infoBadge: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12, padding: 10, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  infoLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginBottom: 3 },
  infoValue: { color: 'white', fontWeight: '700', fontSize: 14 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 14 },
  sectionLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8 },
  detailDesc: { color: 'rgba(255,255,255,0.82)', fontSize: 14, lineHeight: 22 },
  buyBtn: { borderRadius: 50, overflow: 'hidden', marginTop: 20 },
  buyBtnGrad: { paddingVertical: 13, alignItems: 'center' },
  buyBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
  agendaBtn: {
    marginTop: 10, borderRadius: 50, paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  agendaBtnSaved: { backgroundColor: 'rgba(37,99,235,0.2)', borderColor: colors.primary },
  agendaBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },
});
