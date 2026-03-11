// src/navigation/AppNavigator.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Svg, { Path, Circle, Polyline, Line, Rect } from 'react-native-svg';

import FeedScreen       from '../screens/FeedScreen';
import EventsScreen     from '../screens/EventsScreen';
import MessagesScreen   from '../screens/MessagesScreen';
import ProfileScreen    from '../screens/ProfileScreen';
import { colors }       from '../theme';

const Tab = createBottomTabNavigator();

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IC = (active) => ({ stroke: active ? 'white' : 'rgba(255,255,255,0.38)', sw: '1.8', fill: 'none' });

function IcoHome({ active }) {
  const { stroke, sw } = IC(active);
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
        fill={active ? 'rgba(255,255,255,0.1)' : 'none'} />
      <Polyline points="9,22 9,12 15,12 15,22" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IcoCalendar({ active }) {
  const { stroke, sw } = IC(active);
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={stroke} strokeWidth={sw} strokeLinecap="round"
        fill={active ? 'rgba(255,255,255,0.1)' : 'none'} />
      <Line x1="16" y1="2" x2="16" y2="6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="8" y1="2" x2="8" y2="6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="3" y1="10" x2="21" y2="10" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    </Svg>
  );
}

function IcoMsg({ active }) {
  const { stroke, sw } = IC(active);
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
        stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
        fill={active ? 'rgba(255,255,255,0.1)' : 'none'} />
    </Svg>
  );
}

function IcoUser({ active }) {
  const { stroke, sw } = IC(active);
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
        stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="7" r="4" stroke={stroke} strokeWidth={sw}
        fill={active ? 'rgba(255,255,255,0.1)' : 'none'} />
    </Svg>
  );
}

const TABS = [
  { name: 'Feed',     label: 'Início',    Icon: IcoHome },
  { name: 'Events',   label: 'Eventos',   Icon: IcoCalendar },
  { name: 'Messages', label: 'Mensagens', Icon: IcoMsg },
  { name: 'Profile',  label: 'Perfil',    Icon: IcoUser },
];

// ── Custom Tab Bar ─────────────────────────────────────────────────────────────
function CustomTabBar({ state, navigation, onPressCreate }) {
  const insets = useSafeAreaInsets();
  const left  = TABS.slice(0, 2); // Feed, Events
  const right = TABS.slice(2);    // Messages, Profile

  function renderTab({ name, label, Icon }) {
    const routeIndex = state.routes.findIndex(r => r.name === name);
    const focused = state.index === routeIndex;
    const onPress = () => {
      const ev = navigation.emit({ type: 'tabPress', target: state.routes[routeIndex]?.key, canPreventDefault: true });
      if (!focused && !ev.defaultPrevented) navigation.navigate(name);
    };
    return (
      <TouchableOpacity key={name} style={styles.tabItem} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
          <Icon active={focused} />
        </View>
        <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.barOuter, { paddingBottom: insets.bottom || 18 }]}>
      <BlurView intensity={65} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.borderTop} />
      <View style={styles.barRow}>
        <View style={styles.side}>{left.map(renderTab)}</View>

        {/* Center + */}
        <TouchableOpacity style={styles.plusWrap} onPress={onPressCreate} activeOpacity={0.85}>
          <View style={styles.plusBtn}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Line x1="12" y1="5" x2="12" y2="19" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <Line x1="5" y1="12" x2="19" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </Svg>
          </View>
        </TouchableOpacity>

        <View style={styles.side}>{right.map(renderTab)}</View>
      </View>
    </View>
  );
}

// ── Navigator ──────────────────────────────────────────────────────────────────
export default function AppNavigator({ onPressCreate }) {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} onPressCreate={onPressCreate} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Feed"     component={FeedScreen} />
      <Tab.Screen name="Events"   component={EventsScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile"  component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  barOuter: { position: 'absolute', bottom: 0, left: 0, right: 0, overflow: 'hidden' },
  borderTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.18)' },
  barRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 10, paddingHorizontal: 6 },
  side: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  tabItem: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 2 },
  iconWrap: { width: 44, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  iconWrapActive: { backgroundColor: 'rgba(37,99,235,0.28)' },
  tabLabel: { color: 'rgba(255,255,255,0.38)', fontSize: 9, fontWeight: '500' },
  tabLabelActive: { color: 'white' },
  plusWrap: { width: 68, alignItems: 'center', marginBottom: 10 },
  plusBtn: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.65, shadowRadius: 14, elevation: 10,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.28)',
  },
});
