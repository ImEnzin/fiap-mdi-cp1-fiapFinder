import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

export default function SearchBar({ value, onChangeText, placeholder }) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={Colors.mediumGray} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Buscar...'}
        placeholderTextColor={Colors.mediumGray}
      />
      {value ? (
        <Ionicons
          name="close-circle"
          size={20}
          color={Colors.mediumGray}
          onPress={() => onChangeText('')}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderGray,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: Colors.black,
  },
});
