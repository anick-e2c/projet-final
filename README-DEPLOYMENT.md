# Guide de déploiement sur Render

## Prérequis
- Compte GitHub/GitLab avec votre code
- Compte Render.com (gratuit)
- Base de données MongoDB (MongoDB Atlas recommandé)

## Étapes de déploiement

### 1. Préparer MongoDB Atlas (gratuit)
1. Allez sur [mongodb.com/atlas](https://mongodb.com/atlas)
2. Créez un compte gratuit
3. Créez un nouveau cluster (M0 Sandbox - gratuit)
4. Créez un utilisateur de base de données
5. Autorisez l'accès depuis n'importe quelle IP (0.0.0.0/0)
6. Copiez la chaîne de connexion

### 2. Déployer sur Render
1. Allez sur [render.com](https://render.com)
2. Connectez votre compte GitHub/GitLab
3. Cliquez sur "New +" → "Web Service"
4. Sélectionnez votre repository
5. Configurez :
   - **Name** : `aklive-chat-backend`
   - **Environment** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Plan** : `Free`

### 3. Variables d'environnement
Dans les paramètres de votre service Render, ajoutez :

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aklive-chat
JWT_SECRET=votre-secret-jwt-super-securise
```

### 4. Configurer le frontend
Une fois le backend déployé, vous obtiendrez une URL comme :
`https://aklive-chat-backend.onrender.com`

Mettez à jour votre frontend pour utiliser cette URL au lieu de localhost.

### 5. Test
Votre API sera disponible à :
- Health check : `https://votre-app.onrender.com/api/health`
- Auth : `https://votre-app.onrender.com/api/auth/login`

## Notes importantes

### Limitations du plan gratuit Render :
- Le service se met en veille après 15 minutes d'inactivité
- Premier démarrage peut prendre 30-60 secondes
- 750 heures par mois (suffisant pour les tests)

### Sécurité :
- Changez le JWT_SECRET en production
- Configurez les CORS pour votre domaine frontend
- Utilisez HTTPS uniquement

### Monitoring :
- Render fournit des logs en temps réel
- Health check automatique sur `/api/health`

## Dépannage

### Service ne démarre pas :
1. Vérifiez les logs dans Render Dashboard
2. Assurez-vous que `npm start` fonctionne localement
3. Vérifiez les variables d'environnement

### Erreurs de connexion MongoDB :
1. Vérifiez la chaîne de connexion MONGODB_URI
2. Assurez-vous que l'IP 0.0.0.0/0 est autorisée
3. Vérifiez les credentials utilisateur

### Erreurs CORS :
1. Ajoutez votre domaine frontend dans server/index.js
2. Redéployez le service