// src/components/Background.js
// Fundo de céu azul com nuvens — usado em todas as telas
import React from 'react';
import { StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Background() {
  return (
    <>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1505533321630-975218a5f66f?w=800&q=80' }}
        style={styles.bg}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(10,20,60,0.38)', 'rgba(6,8,16,0.72)']}
        style={StyleSheet.absoluteFill}
      />
    </>
  );
}

const styles = StyleSheet.create({
  bg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
  },
});
