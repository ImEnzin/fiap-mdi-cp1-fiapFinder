import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

export default function LoadingState({ message }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.message}>{message || 'Carregando...'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  message: {
    marginTop: 14,
    fontSize: 15,
    color: Colors.mediumGray,
  },
});
