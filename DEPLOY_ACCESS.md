# 🚀 Configuration d'accès au déploiement - EsportPro

## 📋 **À propos**

Ce guide explique comment configurer l'accès au déploiement production pour les nouveaux développeurs de l'équipe EsportPro.

## 🎯 **Prérequis**

- Accès au dépôt Git du projet
- Docker installé localement
- Accès SSH au VPS 

## 🔐 **Configuration pour un nouveau développeur**

### **1. Générer votre clé SSH**

```bash
# Générer une nouvelle clé SSH (recommandé : ed25519)
ssh-keygen -t ed25519 -f ~/.ssh/esportpro_vps -C "votre-email@example.com"

# Définir les bonnes permissions
chmod 600 ~/.ssh/esportpro_vps
chmod 644 ~/.ssh/esportpro_vps.pub
```

### **2. Demander l'ajout de votre clé au VPS**

```bash
# Afficher votre clé publique
cat ~/.ssh/esportpro_vps.pub
```

**Envoyer cette clé à l'administrateur du VPS** pour qu'il l'ajoute aux clés autorisées :
```bash
# L'admin exécute sur le VPS :
echo "votre-cle-publique-ici" >> ~/.ssh/authorized_keys
```

### **3. Configurer SSH**

Ajouter dans votre fichier `~/.ssh/config` :

```bash
Host esportpro_vps
  User deploy
  Hostname <ip>
  PreferredAuthentications publickey
  IdentityFile ~/.ssh/esportpro_vps
  AddKeysToAgent yes
```

### **4. Tester la connexion SSH**

```bash
# Test de connexion
ssh esportpro_vps "echo 'Connexion SSH OK'"
```

Si la connexion fonctionne, vous devriez voir `Connexion SSH OK`.

### **5. Créer le contexte Docker**

```bash
# Créer le contexte Docker pour la production
docker context create production --docker "host=ssh://esportpro_vps"

# Vérifier que le contexte est créé
docker context ls
```

### **6. Configurer l'environnement**

```bash
# Cloner le projet (si pas déjà fait)
git clone <repo-url>
cd EsportPro

# Copier et configurer les variables d'environnement
cp .env.example .env.production
```

**Demander les vraies valeurs** des variables de production à l'équipe :
- `DB_PASSWORD` - Mot de passe PostgreSQL
- `APP_KEY` - Clé de chiffrement AdonisJS  
- `MATOMO_DB_PASSWORD` - Mot de passe MariaDB Matomo
- `GLITCHTIP_SECRET_KEY` - Clé secrète Glitchtip
- Etc.

### **7. Test de déploiement**

```bash
# Vérifier que tout fonctionne
./deploy.sh status

# Si ça marche, vous pouvez déployer
./deploy.sh deploy
```

## 🚀 **Utilisation quotidienne**

Une fois configuré, vous pouvez utiliser les commandes de déploiement :

```bash
# Déploiement complet (build + redémarrage)
./deploy.sh deploy

# Redémarrage rapide (sans build)
./deploy.sh restart

# Consulter les logs
./deploy.sh logs [service]

# État des services
./deploy.sh status

# Arrêt des services
./deploy.sh stop
```

## 🔄 **Workflow collaboratif**

### **Principe important :**
- **1 VPS = 1 environnement de production**
- **Le dernier déployé remplace le précédent**
- **Base de données partagée entre tous les déploiements**

### **Workflow type :**

```bash
# 1. Récupérer les derniers changements
git pull origin main

# 2. Vérifier que l'application fonctionne localement
docker compose up -d
# Tester sur http://localhost:3333

# 3. Déployer en production
./deploy.sh deploy

# 4. Vérifier le déploiement
./deploy.sh status
./deploy.sh logs app
```

## 🆘 **Résolution de problèmes**

### **Erreur : "Docker context 'production' not found"**

```bash
# Vérifier les contextes existants
docker context ls

# Recréer le contexte si nécessaire
docker context create production --docker "host=ssh://esportpro_vps"
```

### **Erreur SSH : "Permission denied"**

```bash
# Vérifier les permissions de la clé
ls -la ~/.ssh/esportpro_vps
chmod 600 ~/.ssh/esportpro_vps

# Tester la connexion
ssh -v esportpro_vps
```

### **Erreur : "Could not resolve hostname"**

Vérifier votre configuration SSH dans `~/.ssh/config`.

### **Services qui ne démarrent pas**

```bash
# Logs détaillés pour diagnostiquer
./deploy.sh logs app
./deploy.sh logs caddy
./deploy.sh logs db

# Redémarrage complet
./deploy.sh stop
./deploy.sh deploy
```

## 🔐 **Sécurité**

### **Bonnes pratiques :**

- ✅ **Utilisez des clés SSH individuelles** (pas de partage)
- ✅ **Mot de passe sur votre clé privée** (recommandé)
- ✅ **Timeout automatique** géré par `deploy.sh`
- ✅ **Variables sensibles** uniquement dans `.env.production`

### **Le script `deploy.sh` gère automatiquement :**

- 🔑 Demande du mot de passe SSH à chaque usage
- ⏰ Timeout de 15 minutes pour la clé
- 🧹 Nettoyage automatique de la clé après usage
- 🛡️ Protection contre les interruptions (Ctrl+C)

## 📞 **Support**

En cas de problème avec cette configuration :

1. **Vérifiez cette documentation** en premier
2. **Testez chaque étape** une par une
3. **Demandez de l'aide** à l'équipe avec les logs d'erreur
4. **Mettez à jour** cette documentation si vous trouvez des améliorations

---

**Configuration mise à jour pour EsportPro - ESGI**
