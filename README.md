# ALTAR Mobile 📱

App React Native (Expo) da plataforma social cristã ALTAR.

## Estrutura do Projeto

```
altar-mobile/
├── App.js                          ← Raiz do app
├── app.json                        ← Config Expo
├── package.json
├── src/
│   ├── context/
│   │   └── AuthContext.js          ← Estado global de autenticação
│   ├── navigation/
│   │   ├── AppNavigator.js         ← Tabs (app logado)
│   │   └── AuthNavigator.js        ← Stack (login/signup)
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── SignupScreen.js
│   │   ├── FeedScreen.js
│   │   ├── EventsScreen.js
│   │   ├── MessagesScreen.js
│   │   ├── NotificationsScreen.js
│   │   └── ProfileScreen.js
│   ├── services/
│   │   └── api.js                  ← Todas as chamadas ao backend
│   └── theme.js                    ← Cores e fontes
```

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo Go app no celular **ou** simulador iOS/Android

## Instalação

```bash
# 1. Entre na pasta
cd altar-mobile

# 2. Instale as dependências
npm install

# 3. Inicie o Expo
npx expo start
```

## Rodar no celular (mais fácil)

1. Instale o app **Expo Go** na App Store ou Google Play
2. Rode `npx expo start`
3. Escaneie o QR code com a câmera (iOS) ou com o Expo Go (Android)

## ⚠️ Configurar IP do backend

Por padrão a API aponta para `localhost:3001`.  
No simulador iOS/Android isso funciona.  
No **celular físico**, edite `src/services/api.js`:

```js
// Troque pelo IP local da sua máquina (ex: ifconfig ou ipconfig)
export const API_URL = 'http://192.168.1.100:3001/api';
```

O backend deve estar rodando:
```bash
cd altar-backend
npm run dev
```

## Publicar nas App Stores

### Passo 1 — Instalar EAS CLI
```bash
npm install -g eas-cli
eas login
```

### Passo 2 — Configurar build
```bash
eas build:configure
```

### Passo 3 — Build Android (Google Play)
```bash
eas build --platform android
```

### Passo 4 — Build iOS (App Store)
```bash
eas build --platform ios
# Requer conta Apple Developer ($99/ano)
```

### Passo 5 — Submeter
```bash
eas submit --platform android
eas submit --platform ios
```

## Usuários de teste

| Email | Senha |
|---|---|
| ana@altar.app | senha123 |
| lucas@altar.app | senha123 |
| gabriela@altar.app | senha123 |

## Próximos passos sugeridos

- [ ] Notificações push (expo-notifications)
- [ ] Upload de foto de perfil (expo-image-picker)
- [ ] Google Sign-In (expo-auth-session)
- [ ] Animações (react-native-reanimated)
- [ ] Dark/light mode
- [ ] Tela de busca de usuários
