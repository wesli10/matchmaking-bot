import * as Jimp from "jimp";
import * as textToImage from "text-to-image";
import { client } from "..";
import { GAME_LIST } from "./gameList";

const generateRankingImage = async (pontuation, jogo: GAME_LIST, option) => {
  const loadedImage = await Jimp.read("./assets/images/ranking.png");
  const logoJogo = logoGame(GAME_LIST[jogo]);

  // nome do jogo
  if (jogo !== "FREE_FIRE") {
    loadedImage.composite(
      await Jimp.read(await textoGame(GAME_LIST[jogo])),
      572,
      18
    );
  }

  // logo do jogo
  loadedImage.composite(
    await Jimp.read(logoJogo),
    jogo === "FREE_FIRE" ? 588 : 124,
    jogo === "FREE_FIRE" ? 28 : 28
  );

  let index = 0;

  for (const player of pontuation.slice(0, 10)) {
    if (arrStyles[index]) {
      const user = client.users.cache.get(player.user_id);

      if (!user) {
        continue;
      }

      if (index === 0) {
        const avatar = user.avatarURL({
          dynamic: true,
          format: "png",
          size: 56,
        });

        loadedImage.composite(await Jimp.read(avatar), 110, 110);
      }

      const nickPlayer = await generateTextImage(
        limitText(
          user.username + "#" + user.discriminator,
          arrStyles[index].sizeText
        ),
        arrStyles[index].nome
      );

      loadedImage.composite(
        await Jimp.read(nickPlayer),
        arrStyles[index].x,
        arrStyles[index].y
      );

      const ptsPlayer = await generateTextImage(
        player.actual_pontuation.toString() + "pts",
        arrStyles[index].pts
      );

      if (!arrStyles[index].xPts) continue;

      loadedImage.composite(
        await Jimp.read(ptsPlayer),
        arrStyles[index].xPts,
        arrStyles[index].yPts
      );
    }

    index++;
  }

  for (let i = 9; i > pontuation.length - 1; i--) {
    const nickPlayer = await generateTextImage("...", arrStyles[i].nome);

    loadedImage.composite(
      await Jimp.read(nickPlayer),
      arrStyles[i].x,
      arrStyles[i].y
    );
  }

  // texto do ranking
  const txtRanking = await generateTextImage(option, {
    fontFamily: "TT Travels Next DemiBold",
    fontSize: 32,
    bgColor: "transparent",
    textColor: "#FFFFFF",
    height: 50,
  });

  loadedImage.composite(await Jimp.read(txtRanking), 190, 20);

  const buffer = await loadedImage.getBufferAsync(Jimp.MIME_PNG);
  return buffer;
};

const logoGame = (game: GAME_LIST) => {
  switch (game) {
    case GAME_LIST.VALORANT:
      return "./assets/images/valorant.png";
      break;

    case GAME_LIST.FREE_FIRE:
      return "./assets/images/freefire.png";
      break;

    case GAME_LIST.LEAGUE_OF_LEGENDS:
      return "./assets/images/lol.png";
      break;
  }
};

const limitText = (text: string, limit: number) => {
  if (text.length > limit) {
    return text.substring(0, limit) + "...";
  }

  return text;
};

const generateTextImage = async (text, config) => {
  const dataUri = await textToImage.generate(text, config);
  return Buffer.from(dataUri.split(",").pop(), "base64");
};

const textoGame = (game: GAME_LIST) => {
  let texto = "";

  switch (game) {
    case GAME_LIST.VALORANT:
      texto = "VALORANT";
      break;

    case GAME_LIST.FREE_FIRE:
      texto = "FREE FIRE";

      break;

    case GAME_LIST.LEAGUE_OF_LEGENDS:
      texto = "LEAGUE OF LEGENDS";

      break;
  }

  return generateTextImage(texto, {
    fontFamily: "TT Travels Next Black",
    fontSize: game === GAME_LIST.LEAGUE_OF_LEGENDS ? 28 : 36,
    bgColor: "transparent",
    textColor: "#FD4A5C",
  });
};

const arrStyles = [
  {
    nome: {
      fontFamily: "TT Travels Next Bold",
      fontSize: 20,
      bgColor: "transparent",
      textColor: "#1A1A1A",
    },
    sizeText: 21,
    x: 170,
    y: 114,
    pts: {
      fontFamily: "TT Commons",
      fontWeight: "bold",
      fontSize: 24,
      bgColor: "transparent",
      textColor: "#1A1A1A",
    },
    xPts: 800,
    yPts: 116,
  },
  {
    nome: {
      fontFamily: "TT Travels Next Bold",
      fontSize: 16,
      bgColor: "transparent",
      textColor: "#FD4A5C",
    },
    sizeText: 17,
    x: 86,
    y: 186,
    pts: {
      fontFamily: "TT Commons",
      fontWeight: "bold",
      fontSize: 18,
      bgColor: "transparent",
      textColor: "#FD4A5C",
    },
    xPts: 800,
    yPts: 190,
  },
  {
    nome: {
      fontFamily: "TT Travels Next Bold",
      fontSize: 16,
      bgColor: "transparent",
      textColor: "#FD4A5C",
    },
    sizeText: 12,
    x: 86,
    y: 245,
    pts: {
      fontFamily: "TT Commons",
      fontWeight: "bold",
      fontSize: 18,
      bgColor: "transparent",
      textColor: "#FD4A5C",
    },
    xPts: 800,
    yPts: 246,
  },
  {
    nome: {
      fontFamily: "TT Travels Next Bold",
      fontSize: 16,
      bgColor: "transparent",
      textColor: "#F2F2F2",
    },
    sizeText: 12,
    x: 86,
    y: 302,
    pts: {
      fontFamily: "TT Commons",
      fontWeight: "bold",
      fontSize: 18,
      bgColor: "transparent",
      textColor: "#F2F2F2",
    },
    xPts: 800,
    yPts: 302,
  },
  {
    nome: {
      fontFamily: "TT Travels Next Bold",
      fontSize: 16,
      bgColor: "transparent",
      textColor: "#F2F2F2",
    },
    sizeText: 12,
    x: 86,
    y: 360,
    pts: {
      fontFamily: "TT Commons",
      fontWeight: "bold",
      fontSize: 18,
      bgColor: "transparent",
      textColor: "#F2F2F2",
    },
    xPts: 800,
    yPts: 362,
  },
  {
    nome: {
      fontFamily: "TT Travels Next Bold",
      fontSize: 14,
      bgColor: "transparent",
      textColor: "#F2F2F2",
    },
    sizeText: 12,
    x: 86,
    y: 418,
    pts: {
      fontFamily: "TT Commons",
      fontWeight: "bold",
      fontSize: 18,
      bgColor: "transparent",
      textColor: "#F2F2F2",
    },
    xPts: 380,
    yPts: 418,
  },
  {
    nome: {
      fontFamily: "TT Travels Next Bold",
      fontSize: 14,
      bgColor: "transparent",
      textColor: "#F2F2F2",
    },
    sizeText: 12,
    x: 542,
    y: 418,
    pts: {
      fontFamily: "TT Commons",
      fontWeight: "bold",
      fontSize: 18,
      bgColor: "transparent",
      textColor: "#F2F2F2",
    },
    xPts: 800,
    yPts: 418,
  },
  {
    nome: {
      fontFamily: "TT Travels Next Bold",
      fontSize: 14,
      bgColor: "transparent",
      textColor: "#F2F2F2",
    },
    sizeText: 12,
    x: 86,
    y: 472,
    pts: {
      fontFamily: "TT Commons",
      fontWeight: "bold",
      fontSize: 18,
      bgColor: "transparent",
      textColor: "#F2F2F2",
    },
    xPts: 244,
    yPts: 474,
  },
  {
    nome: {
      fontFamily: "TT Travels Next Bold",
      fontSize: 14,
      bgColor: "transparent",
      textColor: "#F2F2F2",
    },
    sizeText: 12,
    x: 380,
    y: 472,
    pts: {
      fontFamily: "TT Commons",
      fontWeight: "bold",
      fontSize: 18,
      bgColor: "transparent",
      textColor: "#F2F2F2",
    },
    xPts: 536,
    yPts: 474,
  },
  {
    nome: {
      fontFamily: "TT Travels Next Bold",
      fontSize: 14,
      bgColor: "transparent",
      textColor: "#F2F2F2",
    },
    sizeText: 12,
    x: 680,
    y: 472,
    pts: {
      fontFamily: "TT Commons",
      fontWeight: "bold",
      fontSize: 18,
      bgColor: "transparent",
      textColor: "#F2F2F2",
    },
    xPts: 830,
    yPts: 474,
  },
];

export default generateRankingImage;
