# 🎮 EsportPro - Plateforme de Tournois Esport

## 📋 **À propos**

EsportPro est une plateforme moderne de gestion de tournois esport développée avec **AdonisJS**, **Vue.js** et *
*Inertia.js**. Elle permet la création et la gestion de tournois, matchs, équipes avec un système de chat en temps réel.

## 🚀 **Fonctionnalités**

- 🏆 **Gestion de tournois** : Création, brackets, matchs
- 👥 **Système d'équipes** : Formation et gestion d'équipes
- 🎮 **Multi-jeux** : Support de différents jeux esport
- 💬 **Chat temps réel** : Communication via WebSockets
- 📊 **Analytics** : Intégration Matomo pour le suivi
- 🐛 **Monitoring** : Glitchtip pour le suivi d'erreurs
- 🔐 **Authentification** : Système de connexion sécurisé (Bonus : 2FA)

## 🛠️ **Stack technique**

### **Backend**

- **AdonisJS 6** - Framework Node.js
- **PostgreSQL** - Base de données
- **Transmit** - WebSockets temps réel
- **Lucid ORM** - Gestion base de données

### **Frontend**

- **Vue.js 3** - Framework JavaScript
- **Inertia.js** - SPA sans API
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS
- **Vite** - Build tool

### **Production**

- **Docker** - Containerisation
- **Caddy** - Reverse proxy avec SSL automatique
- **Matomo** - Analytics web
- **Glitchtip** - Monitoring d'erreurs

## 📁 **Structure du projet**

```
EsportPro/
├── 🎮 Application
│   ├── app/                     # Logique métier AdonisJS
│   │   ├── controllers/         # Contrôleurs HTTP
│   │   ├── models/             # Modèles de données
│   │   ├── services/           # Services métier
│   │   └── middleware/         # Middleware HTTP
│   │
│   ├── inertia/                # Frontend Vue.js
│   │   ├── components/         # Composants Vue
│   │   ├── pages/             # Pages de l'application
│   │   └── store/             # Gestion d'état
│   │
│   ├── database/              # Base de données
│   │   ├── migrations/        # Migrations DB
│   │   └── seeders/          # Données de test
│   │
│   └── resources/             # Ressources
│       ├── lang/             # Traductions i18n
│       └── views/            # Templates Edge
│
├── 🐳 Production
│   ├── docker-compose.prod.yml # Stack Docker production
│   ├── Dockerfile.prod        # Image app optimisée
│   ├── Dockerfile.caddy       # Image Caddy SSL
│   ├── Caddyfile             # Configuration proxy
│   └── deploy.sh             # Script de déploiement
│
├── ⚙️ Configuration
│   ├── config/               # Configuration AdonisJS
│   ├── start/               # Démarrage app
│   ├── .env.example         # Variables d'environnement
│   └── adonisrc.ts         # Configuration TypeScript
│
└── 📚 Documentation
    ├── README.md            # Ce fichier
    └── DEPLOY_ACCESS.md     # Guide d'accès déploiement
```

## 🚀 **Installation locale**

### **Prérequis**

- Node.js 18+
- PostgreSQL 14+
- npm

### **Configuration**

```bash
# 1. Cloner le projet
git clone <repo-url>
cd EsportPro

# 2. Lancer le docker
docker compose up -d 

# 3. Configuration environnement
cp .env.example .env
# ↳ Configurer votre base de données PostgreSQL

# 4. Base de données
node ace migration:run
node ace db:seed # (optionnel pour les fakes datas)
```

L'application sera disponible sur `http://localhost:3333`

## 🌐 **Déploiement production**

### **Utilisation rapide**

```bash
# 🚀 Déploiement complet
./deploy.sh deploy

# ⚡ Redémarrage rapide  
./deploy.sh restart

# 📊 État des services
./deploy.sh status

# 📝 Logs en temps réel
./deploy.sh logs [service]

# 🛑 Arrêt des services
./deploy.sh stop
```

### **Configuration initiale déploiement**

1. **Configurer l'environnement de production :**
   ```bash
   cp .env.example .env.production
   # ↳ Renseigner les vraies valeurs de production
   ```

2. **Configurer l'accès SSH :**
  - Voir le guide détaillé : [`DEPLOY_ACCESS.md`](./DEPLOY_ACCESS.md)
  - Configurer votre clé SSH et Docker context

3. **Première déploiement :**
   ```bash
   ./deploy.sh deploy
   ```

### **Services en production**

- **Site web :** https://esportpro.cloud
- **Analytics :** https://matomo.esportpro.cloud
- **Monitoring :** https://sentry.esportpro.cloud

## 🔐 **Sécurité**

### **Gestion SSH automatique**

Le script `deploy.sh` gère automatiquement :

- 🔑 Demande du mot de passe SSH à chaque usage
- ⏰ Timeout automatique (15 minutes)
- 🧹 Nettoyage sécurisé de la clé
- 🛡️ Protection interruption (Ctrl+C)

### **Variables sensibles**

- Toutes les variables sensibles sont dans `.env.production`
- Clés SSH stockées dans `~/.ssh/esportpro_vps`
- Certificats SSL gérés automatiquement par Caddy

## 🤝 **Déploiement collaboratif**

### **Accès équipe**

- **Un VPS** = **Un environnement de production**
- **Dernier déployé** = **Version active**
- **Base de données partagée**

### **Workflow équipe**

```bash
# Dev A fait ses changements
git push origin main
./deploy.sh deploy  # ← Version A active

# Dev B veut déployer
git pull origin main
./deploy.sh deploy  # ← Version B active (remplace A)
```

Pour donner accès à un collègue : voir [`DEPLOY_ACCESS.md`](./DEPLOY_ACCESS.md)

## 🆘 **Dépannage**

### **Erreurs communes**

**Docker context introuvable :**

```bash
# Vérifier la configuration
docker context ls
# Si absent, voir DEPLOY_ACCESS.md
```

**Problème SSH :**

```bash
# Vérifier la clé
ls -la ~/.ssh/esportpro_vps
chmod 600 ~/.ssh/esportpro_vps
```

**Services qui ne démarrent pas :**

```bash
# Logs détaillés
./deploy.sh logs app
./deploy.sh logs caddy

# Redémarrage propre
./deploy.sh stop
./deploy.sh deploy
```

## 📊 **Monitoring & Analytics**

### **Matomo Analytics**

- URL : https://matomo.esportpro.cloud
- Tracking automatique intégré
- Site ID : 1

### **Glitchtip Error Tracking**

- URL : https://sentry.esportpro.cloud
- Capture automatique des erreurs JavaScript
- DSN configuré dans l'app

**Développé avec ❤️ pour l'ESGI** 
