import Tournament from '#models/tournament'
import { DateTime } from 'luxon'

// Création d'un mock de Tournament
const mockTournament = new Tournament()
mockTournament.id = '1'
mockTournament.name = 'Tournoi League of Legends'
mockTournament.city = 'Paris'
mockTournament.address = '7 Bld Des Champs'
mockTournament.postalCode = '75009'
mockTournament.country = 'France'
mockTournament.startDate = DateTime.fromISO('2025-07-01')
mockTournament.endDate = DateTime.fromISO('2025-07-03')
mockTournament.rules = 'BO3'
mockTournament.image = new Uint8Array()

export default mockTournament
