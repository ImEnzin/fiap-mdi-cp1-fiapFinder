import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const PERFIS_OPTIONS = [
  {
    key: 'aluno',
    label: 'Aluno',
    icon: 'school',
    desc: '2 livros • 7 dias',
    email: 'aluno@fiap.com.br',
    senha: '123456',
    color: '#FF0055',
    bg: '#E3F2FD',
  },
  {
    key: 'professor',
    label: 'Professor',
    icon: 'briefcase',
    desc: '4 livros • 14 dias',
    email: 'professor@fiap.com.br',
    senha: '123456',
    color: '#FF0055',
    bg: '#F3E5F5',
  },
  {
    key: 'atendente',
    label: 'Atendente',
    icon: 'shield-checkmark',
    desc: 'Gestão completa',
    email: 'atendente@fiap.com.br',
    senha: '123456',
    color: '#FF0055',
    bg: '#FFF3E0',
  },
];

const BOOK_COVERS = [
  'https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg',
  'https://covers.openlibrary.org/b/isbn/9780201633610-M.jpg',
  'https://covers.openlibrary.org/b/isbn/9780135957059-M.jpg',
  'https://covers.openlibrary.org/b/isbn/9780596517748-M.jpg',
  'https://covers.openlibrary.org/b/isbn/9780134757599-M.jpg',
  'https://covers.openlibrary.org/b/isbn/9780596007126-M.jpg',
];

export default function Login() {
  const [email, setEmail] = useState('aluno@fiap.com.br');
  const [senha, setSenha] = useState('123456');
  const [perfilSelecionado, setPerfilSelecionado] = useState('aluno');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const selecionarPerfil = (key) => {
    setPerfilSelecionado(key);
    const perfil = PERFIS_OPTIONS.find((p) => p.key === key);
    if (perfil) {
      setEmail(perfil.email);
      setSenha(perfil.senha);
    }
  };

  const handleLogin = () => {
    if (!email.trim()) return Alert.alert('Atenção', 'Informe seu email.');
    if (!senha.trim()) return Alert.alert('Atenção', 'Informe sua senha.');
    setLoading(true);
    setTimeout(() => {
      const ok = login(email.trim(), senha, perfilSelecionado);
      setLoading(false);
      ok ? router.replace('/(tabs)') : Alert.alert('Erro', 'Não foi possível realizar o login.');
    }, 1000);
  };

  const active = PERFIS_OPTIONS.find((p) => p.key === perfilSelecionado);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero com livros flutuantes */}
        <View style={styles.heroSection}>
          <View style={styles.booksRow}>
            {BOOK_COVERS.map((uri, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.floatingBook,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { rotate: `${(i % 2 === 0 ? -1 : 1) * (2 + i * 1.5)}deg` },
                    ],
                  },
                ]}
              >
                <Image source={{ uri }} style={styles.floatingBookImg} />
              </Animated.View>
            ))}
          </View>

          <Animated.View style={[styles.logoArea, { opacity: fadeAnim }]}>
            <View style={styles.logoCircle}>
              <Ionicons name="library" size={30} color={Colors.white} />
            </View>
            <Text style={styles.appName}>FIAP Finder</Text>
            <Text style={styles.appTagline}>Biblioteca • Achados e Perdidos</Text>
          </Animated.View>
        </View>

        {/* Form Card */}
        <Animated.View style={[styles.formCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Seletor de Perfil */}
          <Text style={styles.sectionLabel}>Acessar como</Text>
          <View style={styles.perfilRow}>
            {PERFIS_OPTIONS.map((p) => {
              const isActive = perfilSelecionado === p.key;
              return (
                <TouchableOpacity
                  key={p.key}
                  style={[styles.perfilCard, isActive && { borderColor: p.color, backgroundColor: p.bg }]}
                  onPress={() => selecionarPerfil(p.key)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.perfilIconCircle, isActive && { backgroundColor: p.color }]}>
                    <Ionicons name={p.icon} size={20} color={isActive ? '#FFF' : '#AAA'} />
                  </View>
                  <Text style={[styles.perfilLabel, isActive && { color: p.color }]}>{p.label}</Text>
                  <Text style={styles.perfilDesc}>{p.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Inputs */}
          <Text style={styles.inputLabel}>Email institucional</Text>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={18} color={active?.color || '#AAA'} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="seu.email@fiap.com.br"
              placeholderTextColor="#BBB"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.inputLabel}>Senha</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color={active?.color || '#AAA'} />
            <TextInput
              style={styles.input}
              value={senha}
              onChangeText={setSenha}
              placeholder="••••••••"
              placeholderTextColor="#BBB"
              secureTextEntry={!showSenha}
            />
            <TouchableOpacity onPress={() => setShowSenha(!showSenha)}>
              <Ionicons name={showSenha ? 'eye-off-outline' : 'eye-outline'} size={20} color="#AAA" />
            </TouchableOpacity>
          </View>

          {/* Botão Login */}
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: active?.color || Colors.primary }, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Ionicons name={loading ? 'sync' : 'log-in-outline'} size={20} color="#FFF" />
            <Text style={styles.loginBtnText}>{loading ? 'Entrando...' : `Entrar como ${active?.label}`}</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.line} />
            <Text style={styles.footerText}>FIAP Finder v2.0</Text>
            <View style={styles.line} />
          </View>
          <Text style={styles.footerSub}>Projeto Acadêmico • CP01 Mobile</Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  scroll: { flexGrow: 1 },
  heroSection: { paddingTop: 50, paddingBottom: 6, alignItems: 'center' },
  booksRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingHorizontal: 16, marginBottom: 10 },
  floatingBook: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 8,
  },
  floatingBookImg: { width: 46, height: 66, borderRadius: 6, backgroundColor: '#333' },
  logoArea: { alignItems: 'center', paddingVertical: 12 },
  logoCircle: {
    width: 60, height: 60, borderRadius: 18, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 10,
  },
  appName: { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: 1.5 },
  appTagline: { fontSize: 11, color: '#777', marginTop: 3 },
  formCard: {
    flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40, marginTop: 4,
  },
  sectionLabel: { fontSize: 15, fontWeight: '800', color: '#222', marginBottom: 14, textAlign: 'center' },
  perfilRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  perfilCard: {
    flex: 1, backgroundColor: '#F5F5F5', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 6,
    alignItems: 'center', borderWidth: 2.5, borderColor: 'transparent',
  },
  perfilIconCircle: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#E0E0E0',
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  perfilLabel: { fontSize: 13, fontWeight: '800', color: '#999' },
  perfilDesc: { fontSize: 9, color: '#BBB', marginTop: 2, textAlign: 'center' },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#666', marginBottom: 6, marginTop: 10 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F8F8',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1.5, borderColor: '#EEE',
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#222' },
  loginBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 16, marginTop: 22,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
  },
  loginBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 28, gap: 12 },
  line: { height: 1, flex: 1, backgroundColor: '#EEE' },
  footerText: { color: '#CCC', fontSize: 11, fontWeight: '600' },
  footerSub: { textAlign: 'center', color: '#DDD', fontSize: 10, marginTop: 6 },
});
