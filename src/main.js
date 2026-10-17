const fatal = (message) => { const node = document.querySelector('#fatal'); node.textContent = message; node.hidden = false; };
if (!window.Phaser) {
  fatal('Phaser n’a pas été chargé. Dans ce dossier, lance npm install puis npm start, et ouvre l’adresse affichée.');
} else {
  try {
    const { RoomScene } = await import('./room-scene.js');
    new Phaser.Game({
      type: Phaser.AUTO, parent: 'game', width: 450, height: 800,
      backgroundColor: '#182326', audio: { noAudio: true },
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      render: { antialias: true, powerPreference: 'low-power' },
      fps: { target: 60 }, input: { activePointers: 3 },
      scene: [RoomScene],
    });
  } catch (error) {
    console.error(error);
    fatal('Le prototype n’a pas pu démarrer. Recharge la page et vérifie la console du navigateur.');
  }
}
