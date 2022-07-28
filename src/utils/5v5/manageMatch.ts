export async function valorantMapsSelectionFunc() {
  const maps = [
    {
      name: "ASCENT",
      minimap:
        "https://static.wikia.nocookie.net/valorant/images/0/04/Ascent_minimap.png",
    },
    {
      name: "BIND",
      minimap:
        "https://static.wikia.nocookie.net/valorant/images/e/e6/Bind_minimap.png",
    },
    {
      name: "SPLIT",
      minimap:
        "https://static.wikia.nocookie.net/valorant/images/f/ff/Split_minimap.png",
    },
    {
      name: "HAVEN",
      minimap:
        "https://static.wikia.nocookie.net/valorant/images/2/25/Haven_minimap.png",
    },
    {
      name: "ICEBOX",
      minimap:
        "https://static.wikia.nocookie.net/valorant/images/c/cf/Icebox_minimap.png",
    },
    {
      name: "PEARL",
      minimap:
        "https://static.wikia.nocookie.net/valorant/images/6/63/Pearl_minimap.png",
    },
    {
      name: "FRACTURE",
      minimap:
        "https://static.wikia.nocookie.net/valorant/images/1/18/Fracture_minimap.png",
    },
    {
      name: "BREEZE",
      minimap:
        "https://static.wikia.nocookie.net/valorant/images/7/78/Breeze_minimap.png",
    },
  ];

  const mapSelect = maps[Math.floor(Math.random() * maps.length)];

  return mapSelect;
}

export const roles = [
  {
    name: "Mid-laner",
    icon: "https://static.wikia.nocookie.net/leagueoflegends/images/9/98/Middle_icon.png/revision/latest/scale-to-width-down/40",
  },
  {
    name: "Top-laner",
    icon: "https://static.wikia.nocookie.net/leagueoflegends/images/e/ef/Top_icon.png/revision/latest/scale-to-width-down/40",
  },
  {
    name: "AD Carry",
    icon: "https://static.wikia.nocookie.net/leagueoflegends/images/9/97/Bottom_icon.png/revision/latest/scale-to-width-down/40",
  },
  {
    name: "Support",
    icon: "https://static.wikia.nocookie.net/leagueoflegends/images/e/e0/Support_icon.png/revision/latest/scale-to-width-down/40",
  },
  {
    name: "Jungler",
    icon: "https://static.wikia.nocookie.net/leagueoflegends/images/1/1b/Jungle_icon.png/revision/latest/scale-to-width-down/40",
  },
];
