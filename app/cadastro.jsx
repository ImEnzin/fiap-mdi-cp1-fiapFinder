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
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  validateEmail,
  validateSenha,
  validateConfirmSenha,
  validateNome,
  validateRM,
  validateSala,
} from '../utils/validators';

const PERFIS_OPTIONS = [
  { key: 'aluno', label: 'Aluno', icon: 'school', desc: '2 livros • 7 dias' },
  { key: 'professor', label: 'Professor', icon: 'briefcase', desc: '4 livros • 14 dias' },
];

function getPasswordStrength(value) {
  let score = 0;
  if (value.length >= 6) score += 1;
  if (value.length >= 10) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  if (!value) return { label: 'Digite uma senha', color: '#666', width: '0%' };
  if (score <= 1) return { label: 'Senha fraca', color: Colors.error, width: '33%' };
  if (score <= 3) return { label: 'Senha média', color: Colors.warning, width: '66%' };
  return { label: 'Senha forte', color: Colors.success, width: '100%' };
}

export default function Cadastro() {
  const router = useRouter();
  const { register } = useAuth();
  const { theme } = useTheme();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [rm, setRm] = useState('');
  const [sala, setSala] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [perfil, setPerfil] = useState('aluno');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [erros, setErros] = useState({
    nome: '', email: '', rm: '', sala: '', senha: '', confirmar: '',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = () => {
    const e = {
      nome: validateNome(nome),
      email: validateEmail(email),
      rm: validateRM(rm),
      sala: validateSala(sala),
      senha: validateSenha(senha),
      confirmar: validateConfirmSenha(senha, confirmar),
    };
    setErros(e);
    return !Object.values(e).some(Boolean);
  };

  const handleCadastro = async () => {
    setErro('');
    setSucesso('');
    if (!validate()) return;
    setLoading(true);
    const result = await register({ nome, email, senha, perfil, rm, sala });
    setLoading(false);
    if (result.ok) {
      if (result.aprovado === false) {
        setSucesso('Cadastro realizado! Aguardando aprovação do atendente...');
        setTimeout(() => router.replace('/aguardando'), 1200);
      } else {
        setSucesso('Cadastro realizado! Entrando...');
        setTimeout(() => router.replace('/(tabs)'), 800);
      }
    } else {
      if (result.erro && result.erro.toLowerCase().includes('e-mail')) {
        setErros((prev) => ({ ...prev, email: result.erro }));
      }
      setErro(result.erro);
    }
  };

  const isValid =
    !validateNome(nome) &&
    !validateEmail(email) &&
    !validateRM(rm) &&
    !validateSala(sala) &&
    !validateSenha(senha) &&
    !validateConfirmSenha(senha, confirmar);
  const passwordStrength = getPasswordStrength(senha);

  const renderField = ({ label, icon, value, onChangeText, erroKey, ...props }) => (
    <>
      <Text style={[styles.label, { color: theme.subText }]}>{label}</Text>
      <View style={[
        styles.inputBox,
        { backgroundColor: theme.input, borderColor: erros[erroKey] ? Colors.error : theme.inputBorder },
      ]}>
        <Ionicons name={icon} size={18} color={erros[erroKey] ? Colors.error : Colors.primary} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            setErros((e) => ({ ...e, [erroKey]: null }));
            setErro('');
          }}
          placeholderTextColor={theme.placeholder}
          {...props}
        />
      </View>
      {!!erros[erroKey] && <Text style={styles.erroField}>{erros[erroKey]}</Text>}
    </>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.logoCircle}>
            <Ionicons name="person-add" size={28} color="#FFF" />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Criar conta</Text>
          <Text style={[styles.subtitle, { color: theme.subText }]}>
            Preencha todos os dados para se cadastrar
          </Text>
        </Animated.View>

        {/* Form Card */}
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.border, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Seletor de Perfil */}
          <Text style={[styles.label, { color: theme.subText }]}>Tipo de conta</Text>
          <View style={styles.perfilRow}>
            {PERFIS_OPTIONS.map((p) => (
              <TouchableOpacity
                key={p.key}
                style={[
                  styles.perfilBtn,
                  { borderColor: theme.border, backgroundColor: theme.cardAlt },
                  perfil === p.key && styles.perfilBtnActive,
                ]}
                onPress={() => setPerfil(p.key)}
              >
                <Ionicons name={p.icon} size={20} color={perfil === p.key ? Colors.primary : theme.icon} />
                <Text style={[styles.perfilLabel, { color: perfil === p.key ? Colors.primary : theme.text }]}>{p.label}</Text>
                <Text style={[styles.perfilDesc, { color: theme.subText }]}>{p.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Nome */}
          {renderField({
            label: 'Nome completo',
            icon: 'person-outline',
            value: nome,
            onChangeText: setNome,
            erroKey: 'nome',
            placeholder: 'Seu nome completo',
            autoCapitalize: 'words',
          })}

          {/* Email */}
          {renderField({
            label: 'E-mail',
            icon: 'mail-outline',
            value: email,
            onChangeText: setEmail,
            erroKey: 'email',
            placeholder: 'seu@email.com',
            keyboardType: 'email-address',
            autoCapitalize: 'none',
          })}

          {/* RM + Sala em row */}
          <View style={styles.rowFields}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.subText }]}>RM (6 dígitos)</Text>
              <View style={[
                styles.inputBox,
                { backgroundColor: theme.input, borderColor: erros.rm ? Colors.error : theme.inputBorder },
              ]}>
                <Ionicons name="id-card-outline" size={18} color={erros.rm ? Colors.error : Colors.primary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={rm}
                  onChangeText={(v) => { setRm(v.replace(/\D/g, '').slice(0, 6)); setErros((e) => ({ ...e, rm: null })); }}
                  placeholder="550XXX"
                  placeholderTextColor={theme.placeholder}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
              {!!erros.rm && <Text style={styles.erroField}>{erros.rm}</Text>}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.subText }]}>Sala/Turma</Text>
              <View style={[
                styles.inputBox,
                { backgroundColor: theme.input, borderColor: erros.sala ? Colors.error : theme.inputBorder },
              ]}>
                <Ionicons name="school-outline" size={18} color={erros.sala ? Colors.error : Colors.primary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={sala}
                  onChangeText={(v) => { setSala(v); setErros((e) => ({ ...e, sala: null })); }}
                  placeholder="ESPF-2026"
                  placeholderTextColor={theme.placeholder}
                  autoCapitalize="characters"
                />
              </View>
              {!!erros.sala && <Text style={styles.erroField}>{erros.sala}</Text>}
            </View>
          </View>

          {/* Senha */}
          <Text style={[styles.label, { color: theme.subText }]}>Senha</Text>
          <View style={[styles.inputBox, { backgroundColor: theme.input, borderColor: erros.senha ? Colors.error : theme.inputBorder }]}>
            <Ionicons name="lock-closed-outline" size={18} color={erros.senha ? Colors.error : Colors.primary} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={senha}
              onChangeText={(v) => { setSenha(v); setErros((e) => ({ ...e, senha: validateSenha(v), confirmar: validateConfirmSenha(v, confirmar) })); setErro(''); }}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={theme.placeholder}
              secureTextEntry={!showSenha}
            />
            <TouchableOpacity onPress={() => setShowSenha((s) => !s)}>
              <Ionicons name={showSenha ? 'eye-off' : 'eye'} size={18} color={theme.icon} />
            </TouchableOpacity>
          </View>
          {!!erros.senha && <Text style={styles.erroField}>{erros.senha}</Text>}
          {!!senha && (
            <View style={styles.strengthWrap}>
              <View style={styles.strengthTrack}>
                <View style={[styles.strengthFill, { width: passwordStrength.width, backgroundColor: passwordStrength.color }]} />
              </View>
              <Text style={[styles.strengthText, { color: passwordStrength.color }]}>{passwordStrength.label}</Text>
            </View>
          )}

          {/* Confirmar Senha */}
          <Text style={[styles.label, { color: theme.subText }]}>Confirmar senha</Text>
          <View style={[styles.inputBox, { backgroundColor: theme.input, borderColor: erros.confirmar ? Colors.error : theme.inputBorder }]}>
            <Ionicons name="lock-closed-outline" size={18} color={erros.confirmar ? Colors.error : Colors.primary} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={confirmar}
              onChangeText={(v) => { setConfirmar(v); setErros((e) => ({ ...e, confirmar: validateConfirmSenha(senha, v) })); setErro(''); }}
              placeholder="Repita a senha"
              placeholderTextColor={theme.placeholder}
              secureTextEntry={!showConfirmar}
            />
            <TouchableOpacity onPress={() => setShowConfirmar((s) => !s)}>
              <Ionicons name={showConfirmar ? 'eye-off' : 'eye'} size={18} color={theme.icon} />
            </TouchableOpacity>
          </View>
          {!!erros.confirmar && <Text style={styles.erroField}>{erros.confirmar}</Text>}

          {/* Feedback global */}
          {!!erro && (
            <View style={styles.erroBanner}>
              <Ionicons name="alert-circle" size={16} color={Colors.error} />
              <Text style={styles.erroBannerText}>{erro}</Text>
            </View>
          )}
          {!!sucesso && (
            <View style={styles.sucessoBanner}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.sucessoBannerText}>{sucesso}</Text>
            </View>
          )}

          {/* Info aprovação */}
          <View style={[styles.aprovacaoInfo, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}>
            <Ionicons name="time-outline" size={16} color={Colors.warning} />
            <Text style={[styles.aprovacaoText, { color: theme.subText }]}>
              Após o cadastro, sua conta será analisada por um atendente FIAP em até 24h.
            </Text>
          </View>

          {/* Botão */}
          <TouchableOpacity
            style={[styles.btn, !isValid && styles.btnDisabled]}
            onPress={handleCadastro}
            disabled={loading || !isValid}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="person-add-outline" size={18} color="#FFF" />
                <Text style={styles.btnText}>Criar conta</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Link Login */}
          <TouchableOpacity style={styles.linkRow} onPress={() => router.replace('/login')}>
            <Text style={[styles.linkText, { color: theme.subText }]}>Já tem conta? </Text>
            <Text style={styles.linkHighlight}>Fazer login</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 24 },
  backBtn: { position: 'absolute', top: 60, left: 0, padding: 8 },
  logoCircle: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '900', marginBottom: 6 },
  subtitle: { fontSize: 14, textAlign: 'center' },
  card: { borderRadius: 24, padding: 20, borderWidth: 1, marginBottom: 30 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1.5, gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  rowFields: { flexDirection: 'row', gap: 10 },
  erroField: { color: Colors.error, fontSize: 12, marginTop: 4, marginLeft: 4 },
  strengthWrap: { marginTop: 8 },
  strengthTrack: { height: 6, borderRadius: 999, backgroundColor: 'rgba(120,120,120,0.22)', overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: 999 },
  strengthText: { fontSize: 11, fontWeight: '800', marginTop: 4, marginLeft: 4 },
  erroBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(244,67,54,0.1)',
    borderRadius: 10, padding: 12, gap: 8, marginTop: 16,
  },
  erroBannerText: { color: Colors.error, fontSize: 13, flex: 1 },
  sucessoBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(76,175,80,0.1)',
    borderRadius: 10, padding: 12, gap: 8, marginTop: 16,
  },
  sucessoBannerText: { color: Colors.success, fontSize: 13, flex: 1 },
  aprovacaoInfo: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderRadius: 12, padding: 12, marginTop: 16, borderWidth: 1,
  },
  aprovacaoText: { fontSize: 12, flex: 1, lineHeight: 18 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 16,
    marginTop: 20, gap: 8,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  perfilRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  perfilBtn: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1.5 },
  perfilBtnActive: { borderColor: Colors.primary },
  perfilLabel: { fontSize: 13, fontWeight: '800', marginTop: 4 },
  perfilDesc: { fontSize: 10, marginTop: 2 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, paddingBottom: 10 },
  linkText: { fontSize: 14 },
  linkHighlight: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
});

