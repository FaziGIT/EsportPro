#!/bin/bash

set -euo pipefail

# Configuration
DOCKER_CONTEXT_NAME="production"
COMPOSE_FILE="./docker-compose.prod.yml"
ENV_FILE=".env.production"
SSH_KEY="$HOME/.ssh/esportpro_vps"
TIMEOUT_MINUTES=15
TIMEOUT_SECONDS=$((TIMEOUT_MINUTES * 60))

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check if the SSH key is loaded
check_ssh_key() {
    if ssh-add -l 2>/dev/null | grep -q "EsportPro_VPS"; then
        return 0  # Clé trouvée
    else
        return 1  # Clé non trouvée
    fi
}

# Load the SSH key with timeout
load_ssh_key() {
    log "Gestion sécurisée de la clé SSH..."

    if check_ssh_key; then
        success "Clé SSH déjà chargée dans l'agent"
        return 0
    fi

    echo -e "${YELLOW}Veuillez saisir le mot de passe de votre clé SSH${NC}"
    echo -e "${YELLOW}La clé sera supprimée automatiquement dans $TIMEOUT_MINUTES minutes${NC}"
    echo ""

    # Charger la clé avec timeout
    if ssh-add -t "$TIMEOUT_SECONDS" "$SSH_KEY"; then
        success "Clé SSH chargée avec timeout de $TIMEOUT_MINUTES minutes"
    else
        error "Échec du chargement de la clé SSH"
    fi
}

# Clean up the SSH key
cleanup_ssh() {
    if check_ssh_key; then
        log "Nettoyage automatique de sécurité..."
        ssh-add -d "$SSH_KEY" 2>/dev/null || true
        success "Clé SSH supprimée automatiquement de l'agent"
    fi
}

# Checks
check() {
    log "Vérification des prérequis..."

    # Check the environment file
    if [ ! -f "$ENV_FILE" ]; then
        error "Fichier $ENV_FILE manquant. Copiez env.production.example vers $ENV_FILE"
    fi

    # Check the Docker context
    if ! docker context inspect "$DOCKER_CONTEXT_NAME" &> /dev/null; then
        error "CONTEXTE DOCKER '$DOCKER_CONTEXT_NAME' INTROUVABLE!
    Ce contexte n'est pas configuré sur votre machine.
    Pour configurer l'accès au déploiement, consultez : DEPLOY_ACCESS.md"
    fi

    # Load the SSH key before checking the connection
    load_ssh_key

    # Check the SSH connection
    if ! ssh -o ConnectTimeout=5 -o BatchMode=yes esportpro_vps "echo 'SSH OK'" &> /dev/null; then
        error "Impossible de se connecter au VPS via SSH.

    Vérifiez :
    - Votre configuration ~/.ssh/config
    - Votre clé privée ~/.ssh/esportpro_vps
    - Les permissions (chmod 600 ~/.ssh/esportpro_vps)"
    fi

    success "Prérequis OK - Connexion VPS vérifiée"
}

# Deployment
deploy() {
    log "Déploiement sur le contexte: $DOCKER_CONTEXT_NAME"

    docker context use "$DOCKER_CONTEXT_NAME"

    log "Arrêt des services existants"
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down --remove-orphans || true

    log "Construction et démarrage"
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build --force-recreate

    # Wait 8 seconds
    log "Attente de 8 secondes"
    for i in {8..1}; do
        echo -ne "\rAttente $i secondes..."
        sleep 1
    done
    echo -e "\r Attente terminée!"

    log "Exécution des migrations"
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec app node ace migration:run --force

    success "Déploiement terminé!"

    # Show the status
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

    echo ""
    # Secure cleanup
    cleanup_ssh
}

# Function for other commands requiring SSH
run_with_ssh() {
    local action="$1"
    shift

    # Load the SSH key if necessary
    load_ssh_key

    # Execute the action
    case "$action" in
        "logs")
            docker context use "$DOCKER_CONTEXT_NAME"
            docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f "${1:-}"
            ;;
        "status")
            docker context use "$DOCKER_CONTEXT_NAME"
            docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
            ;;
        "stop")
            docker context use "$DOCKER_CONTEXT_NAME"
            docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down
            ;;
        "restart")
            docker context use "$DOCKER_CONTEXT_NAME"
            docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" restart
            ;;
    esac

    # Secure cleanup
    echo ""
    cleanup_ssh
}

# Trap for automatic cleanup in case of interruption
trap 'cleanup_ssh' EXIT INT TERM

# Menu for the script
case "${1:-deploy}" in
    "deploy")
        check
        deploy
        ;;
    "logs"|"status"|"stop"|"restart")
        run_with_ssh "$1" "${@:2}"
        ;;
    *)
        echo ""
        echo -e "${GREEN} Utilisation:${NC}"
        echo "  $0 deploy                 - Déploiement complet avec build"
        echo "  $0 restart                - Redémarrage rapide des services"
        echo "  $0 logs [service]         - Consultation des logs"
        echo "  $0 status                 - État des services"
        echo "  $0 stop                   - Arrêt des services"
        echo ""
        echo -e "${YELLOW}Exemples:${NC}"
        echo "  $0 deploy                 # Déploiement complet"
        echo "  $0 restart                # Redémarrage rapide"
        echo "  $0 logs app               # Logs de l'application"
        echo "  $0 status                 # Voir l'état des conteneurs"
        echo ""
        exit 1
        ;;
esac
