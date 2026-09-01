/**
 * services/auth.js
 *
 * ⚠️ ATENÇÃO — AUTENTICAÇÃO DEMONSTRATIVA, NÃO SEGURA PARA PRODUÇÃO.
 *
 * Isso existe só pra dar a experiência de "criar conta / entrar / sair"
 * num projeto 100% frontend, sem servidor. Especificamente:
 *
 * - A "senha" é transformada com um hash simples (djb2), sem salt por
 *   usuário, sem custo computacional (bcrypt/argon2 fariam isso de
 *   verdade). Qualquer pessoa com acesso ao localStorage do navegador
 *   consegue ver os hashes e, com esforço, quebrar senhas fracas.
 * - Não existe sessão assinada nem expiração real — é só uma flag
 *   guardada localmente dizendo "este navegador está logado como X".
 * - Não existe verificação de servidor nenhuma.
 *
 * Para produção de verdade: mover isso pra um backend com hash forte
 * (bcrypt/argon2), sessões com token assinado (JWT ou cookie de sessão
 * httpOnly), HTTPS obrigatório, e nunca guardar senha (nem hash) no
 * navegador do jeito que fazemos aqui.
 */

const AUTH_STORAGE_KEY = "financeapp_auth_v1";
const AUTH_SESSION_KEY = "financeapp_session_v1"; // usado com "lembrar de mim"

const Auth = {
  // ---------- "hash" (NÃO é criptografia de verdade, ver aviso acima) ----------
  _hash(text) {
    let hash = 5381;
    for (let i = 0; i < text.length; i++) {
      hash = (hash * 33) ^ text.charCodeAt(i);
    }
    return `demo_${(hash >>> 0).toString(16)}`;
  },

  _loadUsers() {
    try {
      return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  },

  _saveUsers(users) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
  },

  // ---------- Sessão ----------
  // "Lembrar de mim" marcado -> sessão em localStorage (sobrevive a fechar o navegador)
  // Desmarcado -> sessão em sessionStorage (some ao fechar a aba/navegador)
  _setSession(userId, remember) {
    const payload = JSON.stringify({ userId, at: new Date().toISOString() });
    if (remember) {
      localStorage.setItem(AUTH_SESSION_KEY, payload);
      sessionStorage.removeItem(AUTH_SESSION_KEY);
    } else {
      sessionStorage.setItem(AUTH_SESSION_KEY, payload);
      localStorage.removeItem(AUTH_SESSION_KEY);
    }
  },

  _getSession() {
    const raw = localStorage.getItem(AUTH_SESSION_KEY) || sessionStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  isAuthenticated() {
    return !!this._getSession();
  },

  currentUser() {
    const session = this._getSession();
    if (!session) return null;
    return this._loadUsers().find((u) => u.id === session.userId) || null;
  },

  logout() {
    localStorage.removeItem(AUTH_SESSION_KEY);
    sessionStorage.removeItem(AUTH_SESSION_KEY);
  },

  // ---------- Cadastro ----------
  signup({ name, email, password, confirmPassword }) {
    const emailNorm = (email || "").trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const error = Utils.Validate.firstError([
      Utils.Validate.required(name, "O nome"),
      Utils.Validate.required(email, "O e-mail"),
      !emailPattern.test(emailNorm) ? "Informe um e-mail válido." : null,
      !password || password.length < 6 ? "A senha precisa ter pelo menos 6 caracteres." : null,
      password !== confirmPassword ? "As senhas não conferem." : null,
    ]);
    if (error) return { success: false, error };

    const users = this._loadUsers();
    if (users.some((u) => u.email === emailNorm)) {
      return { success: false, error: "Já existe uma conta com este e-mail." };
    }

    const user = {
      id: Utils.uuid(),
      name: name.trim(),
      email: emailNorm,
      passwordHash: this._hash(password), // ver aviso no topo do arquivo
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    this._saveUsers(users);
    this._setSession(user.id, true);
    return { success: true, user };
  },

  // ---------- Login ----------
  login({ email, password, remember }) {
    const emailNorm = (email || "").trim().toLowerCase();
    const error = Utils.Validate.firstError([
      Utils.Validate.required(email, "O e-mail"),
      Utils.Validate.required(password, "A senha"),
    ]);
    if (error) return { success: false, error };

    const users = this._loadUsers();
    const user = users.find((u) => u.email === emailNorm);
    if (!user || user.passwordHash !== this._hash(password)) {
      return { success: false, error: "E-mail ou senha incorretos." };
    }
    this._setSession(user.id, !!remember);
    return { success: true, user };
  },

  // ---------- Perfil ----------
  updateProfile(userId, { name, email }) {
    const emailNorm = (email || "").trim().toLowerCase();
    const users = this._loadUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return { success: false, error: "Usuário não encontrado." };

    const error = Utils.Validate.firstError([
      Utils.Validate.required(name, "O nome"),
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm) ? "Informe um e-mail válido." : null,
      users.some((u) => u.id !== userId && u.email === emailNorm) ? "Já existe outra conta com este e-mail." : null,
    ]);
    if (error) return { success: false, error };

    user.name = name.trim();
    user.email = emailNorm;
    this._saveUsers(users);
    return { success: true, user };
  },

  // Garante que a conta de demonstração citada na tela de login exista,
  // pra quem quiser só espiar o app sem se cadastrar.
  ensureDemoUser() {
    const users = this._loadUsers();
    if (users.some((u) => u.email === "demo@financeapp.com")) return;
    users.push({
      id: "user_demo",
      name: "Rafael",
      email: "demo@financeapp.com",
      passwordHash: this._hash("demo123"),
      createdAt: new Date().toISOString(),
    });
    this._saveUsers(users);
  },
};
