/** Retorna string de erro ou null se válido */

export function validateEmail(email) {
  if (!email || !email.trim()) return 'E-mail é obrigatório.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim())) return 'E-mail inválido.';
  return null;
}

export function validateSenha(senha) {
  if (!senha || !senha.trim()) return 'Senha é obrigatória.';
  if (senha.length < 6) return 'Senha deve ter no mínimo 6 caracteres.';
  return null;
}

export function validateConfirmSenha(senha, confirmar) {
  if (!confirmar || !confirmar.trim()) return 'Confirmação de senha é obrigatória.';
  if (senha !== confirmar) return 'As senhas não conferem.';
  return null;
}

export function validateNome(nome) {
  if (!nome || !nome.trim()) return 'Nome é obrigatório.';
  if (nome.trim().length < 3) return 'Nome deve ter no mínimo 3 caracteres.';
  return null;
}

export function validateRM(rm) {
  if (!rm || !rm.trim()) return 'RM é obrigatório.';
  const digits = rm.trim().replace(/\D/g, '');
  if (digits.length !== 6) return 'RM deve ter exatamente 6 dígitos.';
  return null;
}

export function validateSala(sala) {
  if (!sala || !sala.trim()) return 'Sala/Turma é obrigatória.';
  if (sala.trim().length < 2) return 'Informe a sala/turma corretamente.';
  return null;
}

