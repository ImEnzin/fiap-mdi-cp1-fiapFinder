import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

export default function Header({ title, showBack, rightAction }) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {rightAction ? rightAction : <View style={styles.spacer} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.black,
    paddingTop: 54,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomWidth: 4,
    borderBottomColor: Colors.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  spacer: {
    width: 44,
  },
  title: {
    flex: 1,
    color: Colors.white,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.8,
    marginHorizontal: 12,
  },
});
