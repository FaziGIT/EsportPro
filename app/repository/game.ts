import Game from '#models/game'

export const getAllGamesWithoutImages = () => {
  return Game.query().select(['id', 'name', 'platform', 'created_at', 'updated_at'])
}
