// theme.js
export const blueTheme = {
  body: "#EDF9FE",
  text: "#001C55",
  highlight: "#A6E1FA",
  dark: "#00072D",
  secondaryText: "#7F8DAA",
  imageHighlight: "#0E6BA8",
  compImgHighlight: "#E6E6E6",
  jacketColor: "#0A2472",
  headerColor: "#0E6BA877",
};

export const brownTheme = {
  body: "#FFFEFD",
  text: "#5D2A42",
  highlight: "#FFF9EC",
  dark: "#00072D",
  secondaryText: "#8D697A",
  imageHighlight: "#E29F95",
  compImgHighlight: "#E6E6E6",
  jacketColor: "#FB6376",
  headerColor: "#E29F9577",
};

export const purpleTheme = {
  body: "#F8EFF4",
  text: "#231942",
  highlight: "#E0B1CB",
  dark: "#00072D",
  secondaryText: "#655E7A",
  imageHighlight: "#BE95C4",
  compImgHighlight: "#E6E6E6",
  jacketColor: "#5E548E",
  headerColor: "#BE95C477",
};

export const yelGreenTheme = {
  body: "#FFFFEB",
  text: "#003F2F",
  highlight: "#dddf00",
  dark: "#00072D",
  secondaryText: "#4CA58F",
  imageHighlight: "#55a630",
  compImgHighlight: "#E6E6E6",
  jacketColor: "#007f5f",
  headerColor: "#55a63077",
};

export const redTheme = {
  body: "#FFF8E6",
  text: "#6a040f",
  highlight: "#ffba08",
  dark: "#03071e",
  secondaryText: "#964F56",
  imageHighlight: "#dc2f02",
  compImgHighlight: "#E6E6E6",
  jacketColor: "#9d0208",
  headerColor: "#dc2f0277",
};

export const blackTheme = {
  body: "#E5E5E5",
  text: "#14213d",
  highlight: "#ffffff",
  dark: "#000000",
  secondaryText: "#5A6377",
  imageHighlight: "#fca311",
  compImgHighlight: "#E6E6E6",
  jacketColor: "#8d99ae",
  headerColor: "#fca31177",
};

export const lightTheme = {
  body: "#E5E5E5",
  text: "#14213d",
  highlight: "#ffffff",
  dark: "#000000",
  secondaryText: "#5A6377",
  imageHighlight: "#fca311",
  compImgHighlight: "#E6E6E6",
  jacketColor: "#8d99ae",
  headerColor: "#fca31177",
};

export const pinkTheme = {
  body: "#FEE9F2",
  text: "#620E34",
  highlight: "#FBA7CD",
  dark: "#31071A",
  secondaryText: "#ef476f",
  imageHighlight: "#ef476f",
  compImgHighlight: "#E6E6E6",
  jacketColor: "#8d99ae",
  headerColor: "#ef476f77",
};

export const violetTheme = {
  body: "#F4EEFC",
  text: "#430A58",
  highlight: "#D6BEF4",
  dark: "#21052C",
  secondaryText: "#875599",
  imageHighlight: "#9b5de5",
  compImgHighlight: "#E6E6E6",
  jacketColor: "#763D8B",
  headerColor: "#9b5de577",
};

export const greenTheme = {
  body: "#E6FAF5",
  text: "#084c61",
  highlight: "#9BEED8",
  dark: "#031E26",
  secondaryText: "#528190",
  imageHighlight: "#07beb8",
  compImgHighlight: "#E6E6E6",
  jacketColor: "#56a3a6",
  headerColor: "#07beb877",
};

export const orangeTheme = {
  body: "#FFF0EA",
  text: "#99401F",
  highlight: "#FFB59A",
  dark: "#33150A",
  secondaryText: "#CC552A",
  imageHighlight: "#FF6B35",
  compImgHighlight: "#E6E6E6",
  jacketColor: "#d7263d",
  headerColor: "#FF6B3577",
};

export const themes = [
  {
    id: "t1",
    title: "Orange Theme",
    color: "#FF6B35",
    fasIcon: "fas fa-eye",
    theme: orangeTheme,
  },
  {
    id: "t2",
    title: "Blue Theme",
    color: "#0E6BA8",
    fasIcon: "fas fa-eye",
    theme: blueTheme,
  },
  // {
  //   id: "t3",
  //   title: "Brown Theme",
  //   color: "#8D697A",
  //   fasIcon: "fas fa-eye",
  //   theme: brownTheme
  // },
  {
    id: "t4",
    title: "Purple Theme",
    color: "#BE95C4",
    fasIcon: "fas fa-eye",
    theme: purpleTheme,
  },
  // {
  //   id: "t5",
  //   title: "Yellow Theme",
  //   color: "#dddf00",
  //   fasIcon: "fas fa-eye",
  //   theme: yelGreenTheme
  // },
  // {
  //   id: "t6",
  //   title: "Red Theme",
  //   color: "#964F56",
  //   fasIcon: "fas fa-eye",
  //   theme: redTheme
  // },
  {
    id: "t8",
    title: "Pink Theme",
    color: "#ef476f",
    fasIcon: "fas fa-eye",
    theme: pinkTheme,
  },
  {
    id: "t9",
    title: "Green Theme",
    color: "#07beb8",
    fasIcon: "fas fa-eye",
    theme: greenTheme,
  },
  {
    id: "t10",
    title: "Violet Theme",
    color: "#875599",
    fasIcon: "fas fa-eye",
    theme: violetTheme,
  },
];

export const chosenTheme = yelGreenTheme;


export const chromeCommandThemes = {
  modal: "chrome-modal",
  overlay: "chrome-overlay",
  header: "chrome-header",
  container: "chrome-container",
  content: "chrome-content",
  containerOpen: "chrome-containerOpen",
  input: "chrome-input",
  inputOpen: "chrome-inputOpen",
  inputFocused: "chrome-inputFocused",
  spinner: "chrome-spinner",
  suggestionsContainer: "chrome-suggestionsContainer",
  suggestionsContainerOpen: "chrome-suggestionsContainerOpen",
  suggestionsList: "chrome-suggestionsList",
  suggestion: "chrome-suggestion",
  suggestionFirst: "chrome-suggestionFirst",
  suggestionHighlighted: "chrome-suggestionHighlighted",
  trigger: "chrome-trigger"
}

export const sublimeCommandThemes = {
  modal: "sublime-modal",
  overlay: "sublime-overlay",
  container: "sublime-container",
  header: "sublime-header",
  content: "sublime-content",
  containerOpen: "sublime-containerOpen",
  input: "sublime-input",
  inputOpen: "sublime-inputOpen",
  inputFocused: "sublime-inputFocused",
  spinner: "sublime-spinner",
  suggestionsContainer: "sublime-suggestionsContainer",
  suggestionsContainerOpen: "sublime-suggestionsContainerOpen",
  suggestionsList: "sublime-suggestionsList",
  suggestion: "sublime-suggestion",
  suggestionFirst: "sublime-suggestionFirst",
  suggestionHighlighted: "sublime-suggestionHighlighted",
  trigger: "sublime-trigger"
}