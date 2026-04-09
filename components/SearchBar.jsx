import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

export default function SearchBar({ value, onChangeText, placeholder }) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={Colors.primary} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Buscar...'}
        placeholderTextColor="#777"
        selectionColor={Colors.primary} 
      />
      {value ? (
        <Ionicons
          name="close-circle"
          size={20}
          color="#777"
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
    backgroundColor: Colors.darkGray, 
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderGray, 
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: Colors.white, 
  },
});