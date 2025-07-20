import Tournament from '#models/tournament'

export const getAllTournamentsWithoutImages = () => {
  return Tournament.query().select([
    'id',
    'name',
    'tier',
    'format',
    'price',
    'rules',
    'number_participants',
    'number_players_per_team',
    'region',
    'address',
    'city',
    'country',
    'postal_code',
    'start_date',
    'end_date',
    'is_started',
    'winner_id',
    'creator_id',
    'is_validated',
    'game_id',
    'created_at',
    'updated_at',
  ])
}
