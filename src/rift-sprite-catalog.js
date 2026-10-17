// Offline approved Zone 4 masters; presentation only.
export const RIFT_SHEETS = {
  "crawler": {
    "id": "crawler",
    "name": "Rampant de Grisou",
    "key": "enemy-v035b-crawler",
    "url": "./src/assets/enemies-v035b/crawler.svg",
    "width": 384,
    "height": 128,
    "columns": 6,
    "cell": 64,
    "frames": 11,
    "displayWidth": 48,
    "displayHeight": 48,
    "originY": 0.5,
    "orientation": "fixed",
    "boss": false,
    "clips": {
      "idle": {
        "first": 0,
        "count": 2,
        "fps": 3,
        "loop": true
      },
      "move": {
        "first": 2,
        "count": 4,
        "fps": 9,
        "loop": true
      },
      "hit": {
        "first": 6,
        "count": 1,
        "fps": 18,
        "loop": false
      },
      "death": {
        "first": 7,
        "count": 4,
        "fps": 10,
        "loop": false
      }
    },
    "master": "v035a-r4-rampant-outil/master/rampant-outil-final.svg",
    "masterSha256": "acf27de6cf2bc9a4777d6cd451b7304c40db2348630ade1086ec79c4097683d5",
    "bytes": 15081,
    "textureBytes": 196608
  },
  "spitter": {
    "id": "spitter",
    "name": "Cracheur",
    "key": "enemy-v035b-spitter",
    "url": "./src/assets/enemies-v035b/spitter.svg",
    "width": 384,
    "height": 256,
    "columns": 6,
    "cell": 64,
    "frames": 19,
    "displayWidth": 48,
    "displayHeight": 48,
    "originY": 0.5,
    "orientation": "fixed",
    "boss": false,
    "clips": {
      "idle": {
        "first": 0,
        "count": 2,
        "fps": 3,
        "loop": true
      },
      "move": {
        "first": 2,
        "count": 4,
        "fps": 9,
        "loop": true
      },
      "prepare": {
        "first": 6,
        "count": 3,
        "fps": 0,
        "loop": false
      },
      "attack": {
        "first": 9,
        "count": 3,
        "fps": 12,
        "loop": true
      },
      "recovery": {
        "first": 12,
        "count": 2,
        "fps": 7,
        "loop": false
      },
      "hit": {
        "first": 14,
        "count": 1,
        "fps": 18,
        "loop": false
      },
      "death": {
        "first": 15,
        "count": 4,
        "fps": 10,
        "loop": false
      }
    },
    "master": "v035a-r6-cracheur-final/master/cracheur-final.svg",
    "masterSha256": "5c2371e10629d603fb159375e992c49933cbbb1b43851bb03bec57865ab50b1a",
    "bytes": 14229,
    "textureBytes": 393216
  },
  "burster": {
    "id": "burster",
    "name": "Éclateur",
    "key": "enemy-burster-bonbonne-v1-0f6a3bcc",
    "url": "./src/assets/enemies-v035b/burster-bonbonne-v1.svg",
    "width": 384,
    "height": 256,
    "columns": 6,
    "cell": 64,
    "frames": 20,
    "displayWidth": 48,
    "displayHeight": 48,
    "originY": 0.5,
    "orientation": "fixed",
    "boss": false,
    "clips": {
      "idle": {
        "first": 0,
        "count": 1,
        "fps": 3,
        "loop": true
      },
      "move": {
        "first": 1,
        "count": 3,
        "fps": 9,
        "loop": true
      },
      "prepare": {
        "first": 4,
        "count": 5,
        "fps": 0,
        "loop": false
      },
      "attack": {
        "first": 9,
        "count": 3,
        "fps": 12,
        "loop": true
      },
      "recovery": {
        "first": 12,
        "count": 2,
        "fps": 7,
        "loop": false
      },
      "hit": {
        "first": 14,
        "count": 2,
        "fps": 18,
        "loop": false
      },
      "death": {
        "first": 16,
        "count": 4,
        "fps": 10,
        "loop": false
      }
    },
    "master": "v035a-eclateur-bonbonne-final/master/eclateur-bonbonne.svg",
    "masterSha256": "15da4e802254979cea8111badfe08b03128aba9cdab47043d2b68953f63285ff",
    "bytes": 76116,
    "textureBytes": 393216
  },
  "splitter": {
    "id": "splitter",
    "name": "Le Fendeur",
    "key": "enemy-v035b-splitter",
    "url": "./src/assets/enemies-v035b/splitter.svg",
    "width": 528,
    "height": 440,
    "columns": 6,
    "cell": 88,
    "frames": 28,
    "displayWidth": 84,
    "displayHeight": 84,
    "originY": 0.5,
    "orientation": "fixed",
    "boss": true,
    "clips": {
      "idle": {
        "first": 0,
        "count": 2,
        "fps": 3,
        "loop": true
      },
      "move": {
        "first": 2,
        "count": 4,
        "fps": 9,
        "loop": true
      },
      "prepare": {
        "first": 6,
        "count": 3,
        "fps": 0,
        "loop": false
      },
      "attack": {
        "first": 9,
        "count": 3,
        "fps": 12,
        "loop": true
      },
      "recovery": {
        "first": 12,
        "count": 2,
        "fps": 7,
        "loop": false
      },
      "hit": {
        "first": 14,
        "count": 1,
        "fps": 18,
        "loop": false
      },
      "death": {
        "first": 15,
        "count": 5,
        "fps": 10,
        "loop": false
      },
      "prepare_fan8": {
        "first": 20,
        "count": 2,
        "fps": 0,
        "loop": false
      },
      "attack_fan8": {
        "first": 22,
        "count": 2,
        "fps": 10,
        "loop": true
      },
      "prepare_fissures": {
        "first": 24,
        "count": 2,
        "fps": 0,
        "loop": false
      },
      "attack_fissures": {
        "first": 26,
        "count": 2,
        "fps": 10,
        "loop": true
      }
    },
    "master": "v035a-fendeuse-final/master/fendeuse.svg",
    "masterSha256": "ac41ae5394c294cc97306079674fd44653989d513cda9c67917de094cbaea2b4",
    "bytes": 83311,
    "textureBytes": 929280
  },
  "blower": {
    "id": "blower",
    "name": "Le Souffleur",
    "key": "enemy-v035b-blower",
    "url": "./src/assets/enemies-v035b/blower.svg",
    "width": 528,
    "height": 440,
    "columns": 6,
    "cell": 88,
    "frames": 28,
    "displayWidth": 84,
    "displayHeight": 84,
    "originY": 0.5,
    "orientation": "fixed",
    "boss": true,
    "clips": {
      "idle": {
        "first": 0,
        "count": 2,
        "fps": 3,
        "loop": true
      },
      "move": {
        "first": 2,
        "count": 4,
        "fps": 9,
        "loop": true
      },
      "prepare": {
        "first": 6,
        "count": 3,
        "fps": 0,
        "loop": false
      },
      "attack": {
        "first": 9,
        "count": 3,
        "fps": 12,
        "loop": true
      },
      "recovery": {
        "first": 12,
        "count": 2,
        "fps": 7,
        "loop": false
      },
      "hit": {
        "first": 14,
        "count": 1,
        "fps": 18,
        "loop": false
      },
      "death": {
        "first": 15,
        "count": 5,
        "fps": 10,
        "loop": false
      },
      "prepare_pockets": {
        "first": 20,
        "count": 2,
        "fps": 0,
        "loop": false
      },
      "attack_pockets": {
        "first": 22,
        "count": 2,
        "fps": 10,
        "loop": true
      },
      "prepare_cone": {
        "first": 24,
        "count": 2,
        "fps": 0,
        "loop": false
      },
      "attack_cone": {
        "first": 26,
        "count": 2,
        "fps": 10,
        "loop": true
      }
    },
    "master": "v035a-souffleur-final/master/souffleur.svg",
    "masterSha256": "0357126d5de3548ef4b0596fafd55fa88b2abedde2150956ebb3fbb5906e2e1b",
    "bytes": 88925,
    "textureBytes": 929280
  },
  "core": {
    "id": "core",
    "name": "Le Cœur de Grisou",
    "key": "enemy-v035b-core",
    "url": "./src/assets/enemies-v035b/core.svg",
    "width": 528,
    "height": 440,
    "columns": 6,
    "cell": 88,
    "frames": 28,
    "displayWidth": 84,
    "displayHeight": 84,
    "originY": 0.5,
    "orientation": "fixed",
    "boss": true,
    "clips": {
      "idle": {
        "first": 0,
        "count": 2,
        "fps": 3,
        "loop": true
      },
      "move": {
        "first": 2,
        "count": 4,
        "fps": 9,
        "loop": true
      },
      "prepare": {
        "first": 6,
        "count": 3,
        "fps": 0,
        "loop": false
      },
      "attack": {
        "first": 9,
        "count": 3,
        "fps": 12,
        "loop": true
      },
      "recovery": {
        "first": 12,
        "count": 2,
        "fps": 7,
        "loop": false
      },
      "hit": {
        "first": 14,
        "count": 1,
        "fps": 18,
        "loop": false
      },
      "death": {
        "first": 15,
        "count": 5,
        "fps": 10,
        "loop": false
      },
      "prepare_rain": {
        "first": 20,
        "count": 2,
        "fps": 0,
        "loop": false
      },
      "attack_rain": {
        "first": 22,
        "count": 2,
        "fps": 10,
        "loop": true
      },
      "prepare_orb": {
        "first": 24,
        "count": 2,
        "fps": 0,
        "loop": false
      },
      "attack_orb": {
        "first": 26,
        "count": 2,
        "fps": 10,
        "loop": true
      }
    },
    "master": "v035a-coeur-grisou-final/master/coeur-grisou.svg",
    "masterSha256": "9599258ee63a7b270bdba8bda1212af8a1573742e31985970321641372062306",
    "bytes": 92478,
    "textureBytes": 929280
  }
};
