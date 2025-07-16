#!/bin/bash

set -e

# Colors for the logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}GESTION ENVIRONNEMENT PRODUCTION${NC}"
echo "===================================="

# Function to show the current environment variables
show_current_env() {
    echo -e "${YELLOW} Variables d'environnement actuelles dans docker-compose.prod.yml:${NC}"
    echo "App service:"
    grep -A 20 "app:" ./docker-compose.prod.yml | grep -E "^\s+- [A-Z_]+" | head -15
    echo ""
    echo "Database service:"
    grep -A 10 "POSTGRES_" ./docker-compose.prod.yml
}

# Function to backup the compose file
backup_compose() {
    local backup_file="./docker-compose.prod.yml.backup.$(date +%Y%m%d_%H%M%S)"
    cp ./docker-compose.prod.yml "$backup_file"
    echo -e "${GREEN}Sauvegarde créée: $backup_file${NC}"
}

# Function to show the environment variables in the container
show_container_env() {
    echo -e "${YELLOW}Variables d'environnement dans le conteneur de production:${NC}"
    if ! docker context inspect esportpro_vps >/dev/null 2>&1; then
        echo -e "${RED}Contexte Docker 'esportpro_vps' non trouvé!${NC}"
        return 1
    fi

    echo "App container (esportpro-app):"
    docker --context esportpro_vps exec esportpro-app env | grep -E "(NODE_ENV|APP_KEY|DB_|LOG_LEVEL|PORT|HOST)" | sort
}

# Main menu
case "$1" in
    "show"|"voir")
        show_current_env
        ;;
    "live"|"container")
        show_container_env
        ;;
    "backup")
        backup_compose
        ;;
    *)
        echo -e "${GREEN}Utilisation:${NC}"
        echo "  $0 show                    - Voir les variables dans docker-compose.prod.yml"
        echo "  $0 live                    - Voir les variables dans le conteneur actuel"
        echo "  $0 backup                  - Sauvegarder la config actuelle"
        ;;
esac
