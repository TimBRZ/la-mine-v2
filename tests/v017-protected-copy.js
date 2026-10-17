// Only the obsolete "no use" hint changes; every Atelier rule stays protected.
export function preserveWorkshopHint(file,bytes) {
  return file==='workshop.js'?Buffer.from(bytes.toString().replace("Jetons Grisou : échangeables contre une Caisse du Porion sur la page Caisses.","Jeton Grisou : garde-le au chaud. Aucun usage pour le moment.")):bytes;
}
