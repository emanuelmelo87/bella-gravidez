# 📱 Gerar os apps Android e iOS (Capacitor)

O Bella Gravidez é um app web (PWA) que também pode ser empacotado como app
nativo Android/iOS usando **Capacitor**. O código web é o mesmo — o Capacitor
só "embrulha" num app instalável nas lojas.

> ⚠️ Estes passos exigem ferramentas nativas instaladas **na sua máquina**:
> - **Android:** [Android Studio](https://developer.android.com/studio)
> - **iOS:** macOS + [Xcode](https://developer.apple.com/xcode/) (só funciona em Mac)

---

## Opção mais simples: PWA (já funciona!)

Sem fazer nada do Capacitor, o app já é instalável:
- **Android (Chrome):** abra https://bella-gravidez.web.app → menu ⋮ → "Instalar app"
- **iPhone (Safari):** abra o site → botão Compartilhar → "Adicionar à Tela de Início"

Funciona offline, abre em tela cheia, tem ícone próprio. Para a maioria dos
testes, isso já basta.

---

## Android (app nativo / Play Store)

```bash
# 1. Adiciona a plataforma Android (só na primeira vez)
npm run cap:add:android

# 2. Sempre que mudar o código web, sincronize:
npm run cap:sync

# 3. Abre no Android Studio para rodar/gerar o APK/AAB
npm run cap:android
```

No Android Studio: **Run** (▶) para testar no emulador/celular, ou
**Build → Generate Signed Bundle/APK** para publicar na Play Store.

---

## iOS (app nativo / App Store)

```bash
# Só em macOS com Xcode instalado
npm run cap:add:ios
npm run cap:sync
npm run cap:ios
```

No Xcode: selecione um simulador/dispositivo e **Run** (▶).
Para publicar precisa de conta Apple Developer (US$ 99/ano) e do **login Apple**
configurado no Firebase Auth.

---

## Login Google/Apple nativo

No app nativo, o login por redirect web funciona, mas o ideal é usar
`@capacitor-firebase/authentication` para login nativo. Passo futuro.

---

## Checklist antes de publicar nas lojas

- [ ] Login Apple ativado no Firebase (obrigatório na App Store)
- [ ] Ícones e splash screen definitivos (`npm run icons` gera os base)
- [ ] Política de Privacidade e Termos publicados (já existem no app)
- [ ] Conta Google Play Developer (US$ 25 único) / Apple Developer (US$ 99/ano)
