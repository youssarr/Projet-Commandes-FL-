"use strict";

window.addEventListener("load", demarrer);

// SAM Design Pattern : http://sam.js.org/
let samActions, samModel, samState, samView;

function demarrer() {
  console.info("Go!");

  samActions.executeAction({
    do: "init",
    artiPart1: artiPart1Data,
    artiPart2: artiPart2Data,
  });

  // pour un nombre de lignes pleines d'articles quelque soit la largeur du navigateur
  window.addEventListener("resize", () => {
    samActions.executeAction({ do: "mettreAJourPagination" });
  });
}

//----------------------------------------------------------------- Actions ---
// Actions appelées dans le code HTML quand des événements surviennent
//

samActions = {
  executeAction(data) {
    let enableAnimation = true; // pour les animations sur l'interface graphique
    let proposal;
    switch (data.do) {
      case "init":
        {
          console.log("samActions.init");
          proposal = {
            do: data.do,
            artiPart1: data.artiPart1,
            artiPart2: data.artiPart2,
          };
          enableAnimation = false;
        }
        break;
      // Display
      case "viewCartToggle":
      case "gridListView":
        {
          proposal = {
            do: data.do,
            view: data.view, // 'grid' ou 'list'
          };
        }
        break; // Filters
      case "filterToggle":
        {
          proposal = {
            do: data.do,
            type: data.type,
            value: data.value,
            // Ajout d'une propriété pour savoir si c'est "toutes"
            isAll: data.value === "toutes",
          };
        }
        break;
      // Settings
      case "imagesToggle":
      case "animationsToggle":
      // Pagination
      case "paginationSetPage": {
        proposal = {
          do: data.do,
          page: parseInt(data.page),
        };
        break;
      }
      case "paginationSetLinesPerPage": {
        proposal = {
          do: data.do,
          lines: parseInt(data.lines),
        };
        break;
      }
      // Cart
      case "cartSort":
        {
          proposal = {
            do: data.do,
            property: data.property,
          };
        }
        break;
      case "addToCart":
      case "mettreAJourPanierItem":
        {
          proposal = {
            do: data.do,
            articleId: data.articleId,
            quantity: parseInt(data.quantity),
          };
        }
        break;

      case "searchSetText":
        {
          proposal = {
            do: data.do,
            text: data.value,
          };
        }
        break;
      case "searchToggleGlobal":
        {
          proposal = {
            do: data.do,
          };
        }
        break;

      case "with animation":
        proposal = data;
        break;

      // Articles
      case "darkThemeToggle":
      case "mettreAJourPagination":

      case "without animation":
        enableAnimation = false;
        proposal = data;
        break;

      default:
        console.error("samActions - Action non prise en compte : ", data);
        return;
    }
    if (enableAnimation && samModel.model.settings.animations)
      setTimeout(() => samModel.updateModel(proposal), 200);
    else samModel.updateModel(proposal);
  },
};
//-------------------------------------------------------------------- Model ---
// Unique source de vérité de l'application
//

const initialModel = {
  authors: ["ARRIM Youssef"],

  artiPart1: [],
  artiPart2: [],
  articles: {
    values: [],
    hasChanged: true,
  },
  categories: [],
  origins: [],

  filters: {
    categories: {
      booleans: {}, // filtre actif ou non pour chaque catégorie
      count: {}, // nombre d'articles de chaque catégorie
    },
    origins: {
      booleans: {},
      count: {},
    },
    search: {
      global: false,
      text: "",
      hasChanged: true, // Ajouter cette ligne pour forcer le premier rendu
    },
  },
  settings: {
    articleImages: true,
    animations: true,
    darkTheme: false,
  },
  display: {
    cartView: true, // panier visible ou non
    articlesView: "grid", // affichage en 'grid' ou 'list'
  },
  pagination: {
    grid: {
      currentPage: 1,
      linesPerPage: 1,
      linesPerPageOptions: [1, 2, 3],
    },
    list: {
      currentPage: 1,
      linesPerPage: 6,
      linesPerPageOptions: [3, 6, 9],
    },
  },

  cartSort: {
    property: "name", // tri du panier selon cette propriété
    ascending: {
      // ordre du tri pour chaque propriété
      name: true,
      quantity: true,
      total: true,
    },
    hasChanged: true,
  },
};

samModel = {
  model: initialModel,

  // Demande au modèle de se mettre à jour en fonction des données qu'on
  // lui présente.
  // l'argument data est un objet confectionné dans les actions.
  // Les propriétés de data désignent la modification à faire sur le modèle.
  updateModel(data) {
    switch (data.do) {
      case "init":
        {
          console.log("samModel.init");
          // this.model.artiPart1 = data.artiPart1;
          // this.model.artiPart2 = data.artiPart2;
          this.assignerModele("artiPart1", data.artiPart1);
          this.assignerModele("artiPart2", data.artiPart2);
          this.creerArticles();
          this.extraireCategories();
          this.extractOrigins();
        }
        break;
      case "cartSort":
        {
          const sort = this.model.cartSort;
          if (sort.property === data.property) {
            // Inverse l'ordre si même colonne
            sort.ascending[data.property] = !sort.ascending[data.property];
          } else {
            // Change la colonne de tri
            sort.property = data.property;
          }
          sort.hasChanged = true;
        }
        break;
      case "addToCart":
        {
          const article = this.model.articles.values.find(
            (a) => a.id === data.articleId
          );
          if (article && data.quantity > 0) {
            article.quantity = data.quantity;
            article.inCart = true;
          }
        }
        break;
      case "mettreAJourPanierItem":
        {
          const article = this.model.articles.values.find(
            (a) => a.id === data.articleId
          );
          if (article) {
            if (data.quantity > 0) {
              article.quantity = data.quantity;
            } else {
              article.inCart = false;
              article.quantity = 0;
            }
          }
        }
        break;
      case "viewCartToggle":
        this.toggleModelProperty("display.cartView");
        break;
      case "imagesToggle":
        this.toggleModelProperty("settings.articleImages");
        break;
      case "animationsToggle":
        this.toggleModelProperty("settings.animations");
        break;
      case "darkThemeToggle":
        this.toggleModelProperty("settings.darkTheme");
        break;
      case "gridListView":
        {
          this.assignerModele("display.articlesView", data.view);
        }
        break;
      case "searchToggleGlobal":
        {
          this.assignerModele(
            "filters.search.global",
            !this.model.filters.search.global
          );
          this.model.filters.search.hasChanged = true;
        }
        break;
      case "searchSetText":
        {
          this.assignerModele("filters.search.text", data.text);
          this.model.filters.search.hasChanged = true;
        }
        break;
      case "filterToggle":
        {
          const filters = this.model.filters[data.type].booleans;

          if (data.value === "toutes") {
            const newState = !filters.toutes;
            filters.toutes = newState;
            Object.keys(filters).forEach((key) => {
              if (key !== "toutes") {
                filters[key] = newState;
              }
            });
          } else {
            filters[data.value] = !filters[data.value];
            filters.toutes = Object.keys(filters)
              .filter((key) => key !== "toutes")
              .every((key) => filters[key]);
          }
        }
        break;
      case "mettreAJourPagination": {
        this.model.pagination[
          this.model.display.articlesView
        ].hasChanged = true;
        break;
      }
      case "paginationPrevPage":
        {
          const view = this.model.display.articlesView;
          if (this.model.pagination[view].currentPage > 1) {
            this.model.pagination[view].currentPage--;
          }
        }
        break;
      case "paginationNextPage":
        {
          const view = this.model.display.articlesView;
          const pagination = this.model.pagination[view];
          if (pagination.currentPage < pagination.numberOfPages) {
            pagination.currentPage++;
          }
        }
        break;
      case "paginationSetLinesPerPage": {
        const view = this.model.display.articlesView;
        // Mise à jour du nombre de lignes
        this.model.pagination[view].linesPerPage = data.lines;
        // Retour à la première page
        this.model.pagination[view].currentPage = 1;
        // Force le recalcul
        this.model.pagination[view].hasChanged = true;
        break;
      }
      case "paginationSetPage": {
        const view = this.model.display.articlesView;
        // Mise à jour de la page courante
        this.model.pagination[view].currentPage = data.page;
        // Force le recalcul
        this.model.pagination[view].hasChanged = true;
        break;
      }

      default:
        console.error(
          "updateModel() - proposition non prise en compte : ",
          data
        );
        return;
    }

    // Demande à l'état de l'application de prendre en compte la modification
    // du modèle
    samState.updateState(this.model);

    this.model.articles.hasChanged = false;
    this.model.cartSort.hasChanged = false;
  },

  /**
   * Cadeau : Affecte value à la propriété propertyStr
   *
   * toggleModelProperty('display.cartView');
   * est équivalent à :
   * this.model.display.cartView = !this.model.display.cartView;
   *
   * Intérêt : plus compact et un message d'erreur est envoyé si le nom de la proprité est incorrecte
   * ou si les types sont différents.
   *
   * @param {string} propertyStr
   * @param {any}    value
   */
  toggleModelProperty(propertyStr) {
    const root = "model";
    const path = propertyStr.split(".");
    let val = this[root];
    let pathNames = ["this", root];
    path.some((v, i, a) => {
      pathNames.push(v);
      if (val[v] === undefined) {
        console.error(
          `toggleModelProperty(${propertyStr}) : ${pathNames.join(".")} is undefined`
        );
        return true;
      }
      if (i < a.length - 1) {
        val = val[v];
      } else {
        if (typeof val[v] != undefined && typeof val[v] != "boolean") {
          console.error(
            `toggleModelProperty(${propertyStr}) : ${pathNames.join(
              "."
            )} is not a boolean`
          );
          return true;
        }
        val[v] = !val[v];
      }
    });
  },
  /**
   * Cadeau : Transforme une propriété booléenne en son opposée (true -> false, false -> true)
   *
   * this.assignerModele('artiPart1', data.artiPart1);
   * est équivalent à :
   * this.model.artiPart1 = data.artiPart1;
   *
   * Intérêt : un message d'erreur est envoyé si le nom de la proprité est incorrecte
   * ou si elle n'est pas de type booléen.
   *
   * @param {string} propertyStr
   */
  assignerModele(propertyStr, value) {
    const root = "model";
    const path = propertyStr.split(".");
    let val = this[root];
    let pathNames = ["this", root];
    path.some((v, i, a) => {
      pathNames.push(v);
      if (val[v] === undefined) {
        console.error(
          `toggleModelProperty(${propertyStr}) : ${pathNames.join(".")} is undefined`
        );
        return true;
      }
      if (i < a.length - 1) {
        val = val[v];
      } else {
        if (typeof val[v] != undefined && typeof val[v] !== typeof value) {
          console.error(
            `toggleModelProperty(${propertyStr}) : ${pathNames.join(".")} (${typeof val[
              v
            ]}) is not of the same type of ${value} (${typeof value})`
          );
          return true;
        }
        val[v] = value;
      }
    });
  },

  /**
   * fonction à passer en paramete à Array.sort() pour trier un tableau d'objets
   * selon leur nom, et leur prix s'il ont le même nom.
   *
   * @param {Object} a
   * @param {Object} b
   * @returns -1 or 0 or 1
   */
  sortArticles(a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    if (a.price < b.price) return -1;
    if (a.price > b.price) return 1;
    return 0;
  },

  /**
   * Création des articles à partir des deux fichiers de données (ArtiPart1 et ArtiPart2).
   *
   * Ce sont ces articles que l'interface graphique va représenter.
   */
  creerArticles() {
    const artiPart1 = this.model.artiPart1;
    const artiPart2 = this.model.artiPart2;

    let articleId = 0;

    const articles = artiPart1.map((a1) => {
      const articlesTmp = artiPart2
        .filter((a) => a.id == a1.id)
        .map((a2) => {
          const article = {
            id: articleId, // création d'un identifiant unique pour chaque article
            // from artiPart2
            name: a2.name,
            category: a2.category,
            pictures: a2.pictures,
            // from artiPart1
            origin: a1.origin,
            price: a1.price,
            unit: a1.unit,
            quantity: a1.quantity,
            inCart: a1.inCart,
          };
          articleId++;

          return article;
        });
      return articlesTmp[0];
    });
    this.model.articles.values = articles.sort(this.sortArticles); // articles triés
    this.model.articles.hasChanged = true;
  },

  /**
   * Pour un tri par ordre alphabétique
   *
   */
  alphaSort(a, b) {
    if (a.toLowerCase() < b.toLowerCase()) return -1;
    if (a.toLowerCase() > b.toLowerCase()) return 1;
    return 0;
  },

  /**
   * Extraction :
   * - des catégories présentes dans la liste d'articles    --> model.categories
   * - du nombre d'articles appartenant à chaque catégories --> model.filters.categories.count
   *      model.filters.categories.count['fruits'] === 5
   * - du tableau de booléens pour l'état du filtre sur les catégories --> model.filters.categories.booleans
   *      model.filters.categories.booleans['fruits'] === true
   *
   * Les catégories sont triées par ordre alphabétique
   */
  extraireCategories() {
    const articles = this.model.articles.values;
    const categories = [];
    const catsCount = {};
    const catsFilter = {};

    // Extraction des catégories uniques et décompte
    articles.forEach((article) => {
      if (!categories.includes(article.category)) {
        categories.push(article.category);
        catsCount[article.category] = 1;
        catsFilter[article.category] = true;
      } else {
        catsCount[article.category]++;
      }
    });

    // Tri alphabétique
    categories.sort(this.alphaSort);

    // Mise à jour du modèle
    this.model.categories = categories;
    this.model.filters.categories.count = catsCount;
    this.model.filters.categories.booleans = {
      toutes: true, // Ajout de "toutes" activé par défaut
      ...catsFilter,
    };
  },

  extractOrigins() {
    const articles = this.model.articles.values;
    const origins = [];
    const originsCount = {};
    const originsFilter = {};

    articles.forEach((article) => {
      if (!origins.includes(article.origin)) {
        origins.push(article.origin);
        originsCount[article.origin] = 1;
        originsFilter[article.origin] = true;
      } else {
        originsCount[article.origin]++;
      }
    });

    origins.sort(this.alphaSort);

    this.model.origins = origins;
    this.model.filters.origins.count = originsCount;
    this.model.filters.origins.booleans = {
      toutes: true, // Ajout de "toutes" activé par défaut
      ...originsFilter,
    };
  },
};
//-------------------------------------------------------------------- State ---
// État de l'application avant affichage
//

const initialState = {
  filteredArticles: {
    // articles filtrés
    values: [],
    hasChanged: true,
    representation: "", // représentation pour ne pas avoir à la recalculer si n'a pas changé
  },

  filters: {
    categories: {
      booleans: {}, // avec une propriété 'toutes' en plus qui vaut true si toutes les autres sont 'true'
      hasChanged: true,
      representation: "",
    },
    origins: {
      booleans: {}, // avec une propriété 'toutes' aussi
      hasChanged: true,
      representation: "",
    },
    search: {
      global: false,
      text: "",
      hasChanged: true,
      representation: "",
    },
  },
  display: {
    cartView: {
      value: true,
      hasChanged: true,
    },
    articlesView: {
      value: "",
      hasChanged: true,
    },
  },
  pagination: {
    // Toutes ces valeurs sont calculées dans mettreAJourPagination()
    grid: {
      currentPage: undefined,
      linesPerPage: undefined,
      linesPerPageOptions: undefined,

      maxArticlesPerLine: undefined,
      numberOfPages: undefined,
      hasPrevPage: undefined,
      hasNextPage: undefined,
    },
    list: {
      currentPage: undefined,
      linesPerPage: undefined,
      linesPerPageOptions: undefined,

      maxArticlesPerLine: undefined,
      numberOfPages: undefined,
      hasPrevPage: undefined,
      hasNextPage: undefined,
    },
  },

  cart: {
    values: [], // le panier rassemble tous les articles dont inCart==true
    total: 0, // valeur totale du panier
    hasChanged: true,
    representation: "",
  },
  cartSort: {
    // pour le tri des articles du panier
    property: "name",
    ascending: {
      name: true,
      quantity: true,
      total: true,
    },
    hasChanged: true,
  },
};

samState = {
  state: initialState,

  updateState(model) {
    this.mettreAJourFiltre(model.filters.categories, this.state.filters.categories);
    this.mettreAJourFiltre(model.filters.origins, this.state.filters.origins);
    this.mettreAJourRecherche(model.filters.search);
    this.filtrerArticles(model.articles, this.state.filters);
    this.mettreAJourAffichage(model.display);
    this.mettreAJourPagination(model.pagination);
    this.mettreAJourTriPanier(model.cartSort);
    this.mettreAJourPanier(model);

    this.representerGAE(model);

    this.state.filteredArticles.hasChanged = false;
    this.state.filters.categories.hasChanged = false;
    this.state.filters.origins.hasChanged = false;
    this.state.filters.search.hasChanged = false;
    this.state.display.cartView.hasChanged = false;
    this.state.display.articlesView.hasChanged = false;
    this.state.cartSort.hasChanged = false;
    this.state.cart.hasChanged = false;
  },

  /**
   * recopie les filtres du model dans le state
   * ajoute la propriété 'toutes' au tableau booleans
   */
  mettreAJourFiltre(modelFilter, stateFilter) {
    // Copie des filtres du modèle
    stateFilter.booleans = { ...modelFilter.booleans };

    // Si "toutes" est activé, activer tous les filtres
    if (stateFilter.booleans.toutes) {
      Object.keys(stateFilter.booleans).forEach(
        (key) => (stateFilter.booleans[key] = true)
      );
    }

    stateFilter.hasChanged = true;
  },

  mettreAJourRecherche(modelSearch) {
    const stateSearch = this.state.filters.search;
    const globalHasChanged = modelSearch.global != stateSearch.global;
    const textHasChanged = modelSearch.text != stateSearch.text;
    stateSearch.hasChanged = globalHasChanged || textHasChanged;
    stateSearch.global = modelSearch.global;
    stateSearch.text = modelSearch.text;
  },

  filtrerArticles(articles, filters) {
    if (
      articles.hasChanged ||
      filters.categories.hasChanged ||
      filters.origins.hasChanged ||
      filters.search.hasChanged
    ) {
      // Commencer avec tous les articles du modèle
      let filteredValues = [...articles.values];

      // Appliquer la recherche textuelle globale sur tous les articles
      if (filters.search.text.length > 0 && filters.search.global) {
        const searchText = filters.search.text.toLowerCase();
        filteredValues = articles.values.filter(
          (article) =>
            article.name.toLowerCase().includes(searchText) ||
            article.category.toLowerCase().includes(searchText) ||
            article.origin.toLowerCase().includes(searchText)
        );
      }

      // Appliquer les filtres de catégories
      if (!filters.categories.booleans.toutes) {
        filteredValues = filteredValues.filter(
          (article) => filters.categories.booleans[article.category]
        );
      }

      // Appliquer les filtres d'origines
      if (!filters.origins.booleans.toutes) {
        filteredValues = filteredValues.filter(
          (article) => filters.origins.booleans[article.origin]
        );
      }

      // Appliquer la recherche textuelle en dernier si recherche non globale
      if (filters.search.text.length > 0 && !filters.search.global) {
        const searchText = filters.search.text.toLowerCase();
        filteredValues = filteredValues.filter(
          (article) =>
            article.name.toLowerCase().includes(searchText) ||
            article.category.toLowerCase().includes(searchText) ||
            article.origin.toLowerCase().includes(searchText)
        );
      }

      // Mettre à jour le state
      this.state.filteredArticles.values = filteredValues;
      this.state.filteredArticles.hasChanged = true;
    }
  },

  mettreAJourAffichage(display) {
    const cartView = this.state.display.cartView;
    if (cartView.value != display.cartView) {
      cartView.value = display.cartView;
      cartView.hasChanged = true;
    }
    const articlesView = this.state.display.articlesView;
    if (articlesView.value != display.articlesView) {
      articlesView.value = display.articlesView;
      articlesView.hasChanged = true;
    }
  },

  mettreAJourPagination(pagination) {
    const statePagination = this.state.pagination;
    const articlesView = this.state.display.articlesView.value;
    const articleGrid = document.getElementById("articleWidth");
    const articleWidth = articleGrid.clientWidth;
    const minCardWidth = 200;

    // Calcul du nombre d'articles par ligne selon la vue
    const maxArticlesPerLine =
      articlesView === "grid" ? Math.floor(articleWidth / minCardWidth) : 1;

    // Récupération du nombre de lignes par page
    const linesPerPage = pagination[articlesView].linesPerPage;

    // Calcul du nombre total de pages
    const numberOfArticles = this.state.filteredArticles.values.length;
    const articlesPerPage = maxArticlesPerLine * linesPerPage;
    const numberOfPages = Math.ceil(numberOfArticles / articlesPerPage);

    // Mise à jour du state
    statePagination[articlesView].currentPage =
      pagination[articlesView].currentPage;
    statePagination[articlesView].linesPerPage = linesPerPage;
    statePagination[articlesView].linesPerPageOptions =
      pagination[articlesView].linesPerPageOptions;
    statePagination[articlesView].maxArticlesPerLine = maxArticlesPerLine;
    statePagination[articlesView].numberOfPages = numberOfPages;
    statePagination[articlesView].hasPrevPage =
      pagination[articlesView].currentPage > 1;
    statePagination[articlesView].hasNextPage =
      pagination[articlesView].currentPage < numberOfPages;
  },

  mettreAJourTriPanier(cartSort) {
    if (cartSort.hasChanged) {
      this.state.cartSort.property = cartSort.property;
      this.state.cartSort.ascending = cartSort.ascending;
      this.state.cartSort.hasChanged = true;
    }
  },

  /**
   * Remplit le panier avec tous les articles dont inCart == true
   * et calcule le prix total du panier
   */
  mettreAJourPanier(model) {
    // Récupérer les articles du panier
    const cartArticles = model.articles.values.filter(
      (article) => article.inCart
    );

    // Appliquer le tri
    const sort = model.cartSort;
    cartArticles.sort((a, b) => {
      let comparison;
      switch (sort.property) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "quantity":
          comparison = a.quantity - b.quantity;
          break;
        case "total":
          comparison = a.price * a.quantity - b.price * b.quantity;
          break;
        default:
          comparison = 0;
      }
      return sort.ascending[sort.property] ? comparison : -comparison;
    });

    // Calculer le total
    const total = cartArticles.reduce((sum, article) => {
      return sum + article.price * article.quantity;
    }, 0);

    // Mettre à jour le state
    this.state.cart.values = cartArticles;
    this.state.cart.total = total;
    this.state.cart.hasChanged = true;
  },

  // Met à jour l'état de l'application, construit le code HTML correspondant,
  // et demande son affichage.
  representerGAE(model) {
    this.mettreAJourFiltreUI(model, this.state, "categories");
    this.mettreAJourFiltreUI(model, this.state, "origins");
    this.mettreAJourRechercheUI(model, this.state);
    this.updateArticlesUI(model, this.state);
    this.mettreAJourPanierUI(model, this.state);

    //Settings

    const representation = samView.mainUI(model, this.state);

    //Appel l'affichage du HTML généré.
    samView.samDisplay(representation);
  },

  mettreAJourFiltreUI(model, state, filterName) {
    const filter = state.filters[filterName];
    if (filter.hasChanged) {
      filter.representation = samView.filterUI(model, state, filterName);
      filter.hasChanged = false;
    }
  },

  mettreAJourRechercheUI(model, state) {
    const filter = state.filters.search;
    filter.representation = samView.searchUI(model, state);
    filter.hasChanged = false;
  },

  updateArticlesUI(model, state) {
    const filteredArticles = state.filteredArticles;
    const articlesView = state.display.articlesView;
    if (filteredArticles.hasChanged || articlesView.hasChanged) {
      filteredArticles.representation =
        articlesView.value == "grid"
          ? samView.articlesGridUI(model, state)
          : samView.renderArticlesList(model, state);
      filteredArticles.hasChanged = false;
      articlesView.hasChanged = false;
    }
  },

  mettreAJourPanierUI(model, state) {
    const cart = state.cart;
    const cartView = state.display.cartView;
    const cartSort = state.cartSort;
    if (cart.hasChanged || cartView.hasChanged || cartSort.hasChanged) {
      cart.representation = samView.renderCartUI(model, state);
      cart.hasChanged = false;
      cartView.hasChanged = false;
      cartSort.hasChanged = false;
    }
  },

  updateThemeUI(model, state) {
    const settings = state.settings;
    if (settings.darkThemeHasChanged) {
      samView.darkThemeUI(state);
      settings.darkThemeHasChanged = false;
    }
  },
};
//--------------------------------------------------------------------- View ---
// Génération de portions en HTML et affichage
//
samView = {
  // Injecte le HTML dans une balise de la page Web.
  samDisplay: function (representation) {
    const app = document.getElementById("app");
    app.innerHTML = representation;
  },

  // Astuce : Pour avoir la coloration syntaxique du HTML avec l'extension lit-html dans VSCode
  // https://marketplace.visualstudio.com/items?itemName=bierner.lit-html
  // utiliser this.html`<h1>Hello World</h1>` en remplacement de `<h1>Hello World</h1>`
  html([str, ...strs], ...vals) {
    return strs.reduce((acc, v, i) => acc + vals[i] + v, str);
  },

  mainUI(model, state) {
    this.darkThemeUI(model);

    const cartClass = model.display.cartView ? "border" : "";

    return this.html` y 
    <div class="row small-margin">
    <!-- ___________________________________________________________ Entête -->
    <div class="row middle-align no-margin">
      <div class="col s8 m9 l10">
        <h4 class="center-align"> Commande de fruits et légumes</h4>
      </div>
      <div class="col s4 m3 l2">
        <nav class="right-align small-margin">
          <button onclick="samActions.executeAction({do:'viewCartToggle'})" class="no-marin ${cartClass}">
            <i class="large">shopping_basket</i>
          </button>
          <button class="no-margin" data-ui="#dropdown3_">
            <i class="large">account_circle</i>
            <div id="dropdown3_" data-ui="#dropdown3_" class="dropdown left no-wrap">
              <a>Auteur : <b>ARRIM Youssef</b></a>
            </div>
          </button>
        </nav>
      </div>
    </div>
    <div class="row">
      <div class="col s3 m2 l2" style="position:sticky; top: 10px;">
        <!-- ______________________________________________________ Filtres -->
      
        <aside>
          <h5>Filtres</h5>
          <h6>Catégories</h6>          
          <div>
            ${state.filters.categories.representation}
          </div>
          <div class="small-space"></div>
          <h6>Origines</h6>
          <div>
            ${state.filters.origins.representation}
          </div>
          <div class="small-space"></div>
          <h6>Recherche</h6>
          ${state.filters.search.representation}
          <div class="small-space"></div>          
          <h5>Paramètres</h5>
          ${this.settingsUI(model, state)}
          
        </aside>

      </div>
      <div class=" col s9 m10 l10">
        <!-- ___________________________________ Récap filtres et recherche -->
        
        
        <div class="row top-align no-margin">
          <nav class="col s8 wrap no-margin">
            ${this.filtersSearchTagsUI(model, state)}
            <!-- ${state.filteredArticles.representation}   -->
          </nav>
          <nav class="col s4 right-align no-margin">
            ${this.articlesViewUI(model, state)}
          </nav>
        </div>
        
        <!-- _____________________________________________________ Articles -->
        
        ${state.filteredArticles.representation}  
      
        <!-- ___________________________________________________ Pagination -->
        ${this.paginationUI(model, state)}
        
        
      </div>
    </div>
  </div>
  <!-- ______________________________________________________________Panier -->
  ${state.cart.representation}
  `;
  },

  darkThemeUI(model) {
    const bodyclass = document.body.classList;
    if (model.settings.darkTheme) bodyclass.add("is-dark");
    else bodyclass.remove("is-dark");
  },

  filterUI(model, state, filterName) {
    const filters = model.filters[filterName];
    const stateFilters = state.filters[filterName].booleans;

    // Ajout du tag "Toutes" en premier
    let filterItems = this.html`
      <div>
        <label class="checkbox">
          <input type="checkbox" ${
            stateFilters.toutes ? 'checked="checked"' : ""
          }
                 onclick="samActions.executeAction({do:'filterToggle', type:'${filterName}', value:'toutes'})" />
          <span class="capitalize">Toutes</span>
        </label>
      </div>
    `;

    // Génération des autres filtres
    filterItems += Object.keys(filters.booleans)
      .filter((key) => key !== "toutes")
      .map((key) => {
        const checked = stateFilters[key] ? 'checked="checked"' : "";
        const count = filters.count[key] || 0;

        return this.html`
          <div>
            <label class="checkbox">
              <input type="checkbox" ${checked}
                     onclick="samActions.executeAction({do:'filterToggle', type:'${filterName}', value:'${key}'})" />
              <span class="capitalize">${key}</span>
              <a><span class="badge circle right color-2-text color-2a">${count}</span></a>
            </label>
          </div>
        `;
      })
      .join("");

    return filterItems;
  },

  searchUI(model, state) {
    const search = model.filters.search;
    const globalChecked = search.global ? 'checked="checked"' : "";

    return this.html`
      <div>
        <div class="middle-align small-margin">
          <label class="switch">
            <input type="checkbox" ${globalChecked}
                  onclick="samActions.executeAction({do:'searchToggleGlobal'})" />
            <span>Globale</span>
          </label>
        </div>
        <div class="field prefix round fill border small">
          <i>search</i>
          <input type="text" 
                 class="align-middle"
                 value="${search.text}"
                 onchange="samActions.executeAction({
                   do:'searchSetText',
                   value: this.value
                 })" />
        </div>
      </div>
    `;
  },

  settingsUI(model, state) {
    const withImageChecked = model.settings.articleImages
      ? 'checked="checked"'
      : "";
    const darkThemeChecked = model.settings.darkTheme
      ? 'checked="checked"'
      : "";
    const animationsChecked = model.settings.animations
      ? 'checked="checked"'
      : "";

    return this.html`
      <div class="middle-align small-margin">
        <label class="switch">
          <input type="checkbox" onclick="samActions.executeAction({do:'imagesToggle'})" ${withImageChecked} />
          <span>Articles <br />avec images</span>
        </label>
      </div>
      <div class="middle-align small-margin">
        <label class="switch">
          <input type="checkbox" onclick="samActions.executeAction({do:'animationsToggle'})" ${animationsChecked} />
          <span>Animations</span>
        </label>
      </div>          
      <div class="middle-align small-margin">
        <label class="switch">
          <input type="checkbox" onclick="samActions.executeAction({do:'darkThemeToggle'})" ${darkThemeChecked} />
          <span>Thème <br /> sombre</span>
        </label>
      </div>          
          `;
  },

  filtersSearchTagsUI(model, state) {
    const articles = state.filteredArticles.values;
    let tags = [];

    // Catégories actives
    Object.entries(model.filters.categories.booleans).forEach(
      ([category, active]) => {
        if (active && category !== "toutes") {
          tags.push(this.html`
          <span class="chip small no-margin capitalize" 
                onclick="samActions.executeAction({
                  do:'filterToggle', 
                  type:'categories',
                  value:'${category}'
                })">
            ${category}
            <i class="small">close</i>
          </span>
        `);
        }
      }
    );

    // Pour les origines:
    Object.entries(model.filters.origins.booleans).forEach(
      ([origin, active]) => {
        if (active && origin !== "toutes") {
          tags.push(this.html`
          <span class="chip small no-margin capitalize"
                onclick="samActions.executeAction({
                  do:'filterToggle',
                  type:'origins',
                  value:'${origin}'
                })">
            ${origin} 
            <i class="small">close</i>
          </span>
        `);
        }
      }
    );

    // Pour la recherche:
    if (model.filters.search.text) {
      tags.push(this.html`
        <span class="chip small no-margin"
              onclick="samActions.executeAction({
                do:'searchSetText',
                value:''
              })">
          Rech: "${model.filters.search.text}"
          <i class="small">close</i>
        </span>
      `);
    }

    return this.html`
        <label class="medium-text color-2-text">
          ${articles.length} articles${tags.length ? " -" : ""}
        </label>
        ${tags.join("")}
      `;
  },

  articlesViewUI(model, state) {
    const gridOn = state.display.articlesView.value == "grid";
    const gridViewClass = gridOn ? "disabled" : "";
    const gridViewDisabled = gridOn ? 'disabled="disabled"' : "";
    const listViewClass = gridOn ? "" : "disabled";
    const listViewDisabled = gridOn ? "" : 'disabled="disabled"';

    return this.html`
      <button onclick="samActions.executeAction({do:'gridListView', view:'list'})" class="small no-margin ${listViewClass}" ${listViewDisabled}>
        <i>view_list</i></button>
      <button onclick="samActions.executeAction({do:'gridListView', view:'grid'})" class="small           ${gridViewClass}" ${gridViewDisabled}>
        <i>grid_view</i></button>
    `;
  },

  inEuro(number) {
    const numString = number + 0.0001 + "";
    const dotIndex = numString.indexOf(".");
    return numString.substring(0, dotIndex + 3) + " €";
  },

  articlesGridUI(model, state) {
    const articles = state.filteredArticles.values;

    if (articles.length === 0) {
      return this.articlesEmptyUI(model, state);
    }

    // Pagination
    const pagination = state.pagination.grid;
    const maxArticlesPerLine = pagination.maxArticlesPerLine;
    const linesPerPage = pagination.linesPerPage;
    const articlesPerPage = maxArticlesPerLine * linesPerPage;
    const startIndex = (pagination.currentPage - 1) * articlesPerPage;
    const endIndex = startIndex + articlesPerPage;
    const visibleArticles = articles.slice(startIndex, endIndex);

    const articlesHtml = visibleArticles
      .map((article) => {
        return this.html`
          <div class="card no-padding small-margin">            
            ${
              model.settings.articleImages
                ? `<div class="card-image center-align">
                    <img src="./images/${article.pictures[0]}" class="responsive" />
                  </div>`
                : ""
            }            
            <div class="small-padding">
              <h6 class="no-margin">${article.name}</h6>
              <div class="small-margin">
                <label>Origine : </label>${article.origin}
              </div>
              <div class="chip large">
                <label>Prix: </label>
                <span class="large-text">${this.inEuro(article.price)} / 
                  <span class="avoidwrap">${article.unit}</span>
                </span>
              </div>
              <div class="row no-margin">
                <div class="col s8 field round fill border center-align">
                  <input type="text" 
                        class="center-align ${
                          article.inCart ? "" : "color-orange-light3"
                        }"
                        onchange="samActions.executeAction({
                          do: ${
                            article.inCart ? "'mettreAJourPanierItem'" : "'addToCart'"
                          },
                          articleId: ${article.id},
                          quantity: this.value
                        })"
                        value="${article.quantity || ""}" />
                  <label>Quantité</label>
                </div>
                <div class="col s4">
                  <button class="circle no-margin ${
                    !article.quantity ? "disabled" : ""
                  }"
                          ${!article.quantity ? 'disabled="disabled"' : ""}
                          onclick="(() => {
                            const input = this.parentNode.parentNode.querySelector('input');
                            samActions.executeAction({
                              do: '${
                                article.inCart ? "mettreAJourPanierItem" : "addToCart"
                              }',
                              articleId: ${article.id},
                              quantity: parseInt(input.value)
                            });
                          })()">
                    <i>${article.inCart ? "edit" : "add"}</i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join("\n");

    return this.html`
      <article class="small-margin grid-view" 
               style="grid-template-columns: repeat(${maxArticlesPerLine}, 1fr);">
        ${articlesHtml}
      </article>
    `;
  },

  renderArticlesList(model, state) {
    const articles = state.filteredArticles.values;

    if (articles.length === 0) {
      return this.articlesEmptyUI(model, state);
    }

    // Pagination
    const pagination = state.pagination.list;
    const startIndex = (pagination.currentPage - 1) * pagination.linesPerPage;
    const endIndex = startIndex + pagination.linesPerPage;
    const visibleArticles = articles.slice(startIndex, endIndex);

    const articlesHtml = visibleArticles
      .map((article) => {
        return this.html`
        <nav class="row card divider no-wrap">            
          ${
            model.settings.articleImages
              ? `<div class="col min">
               <img src="./images/${article.pictures[0]}" class="circle tiny" />
             </div>`
              : ""
          }
          <div class="col">
            <h6>${article.name}</h6>
            <label>${article.origin}</label>
          </div>
          <div class="col min chip no-margin">
            <label>Prix : </label>
            <span class="large-text">${this.inEuro(article.price)} / ${
          article.unit
        }</span>
          </div>
            <div class="col min field round fill small border center-align no-margin">
              <label>Qté : </label>
              <input type="text" 
                    class="center-align ${
                      article.inCart ? "" : "color-orange-light3"
                    }"
                    onchange="samActions.executeAction({
                      do: ${
                        article.inCart ? "'mettreAJourPanierItem'" : "'addToCart'"
                      },
                      articleId: ${article.id},
                      quantity: this.value
                    })"
                    value="${article.quantity || ""}" />
            </div>
          <div class="col min">
            <button class="circle no-margin ${
              !article.quantity ? "disabled" : ""
            }"
                    ${!article.quantity ? 'disabled="disabled"' : ""}
                    onclick="(() => {
                      const input = this.parentNode.parentNode.querySelector('input');
                      samActions.executeAction({
                        do: '${
                          article.inCart ? "mettreAJourPanierItem" : "addToCart"
                        }',
                        articleId: ${article.id},
                        quantity: parseInt(input.value)
                      });
                    })()">
              <i>${article.inCart ? "edit" : "add"}</i>
            </button>
          </div>
        </nav>
      `;
      })
      .join("\n");

    return this.html`
      <article class="large-margin list-view">
        ${articlesHtml}
      </article>
    `;
  },

  articlesEmptyUI(model, state) {
    return this.html`
      <div class="row">
        <div class="col s12 medium-padding fond">
          <img src="./images/fond.png" class="" />
        </div>
      </div>
    `;
  },

  // Dans samView
  paginationUI(model, state) {
    const view = state.display.articlesView.value;
    const pagination = state.pagination[view];

    // Génération boutons de pages
    let pageButtons = "";
    for (let i = 1; i <= pagination.numberOfPages; i++) {
      const isCurrent = i === pagination.currentPage;
      const borderClass = isCurrent ? "border" : "";
      pageButtons += this.html`
        <button class="square no-margin ${borderClass}" 
                onclick="samActions.executeAction({do:'paginationSetPage', page:${i}})">
          ${i}
        </button>`;
    }

    // Génération options lignes par page
    const linesOptions = pagination.linesPerPageOptions
      .map(
        (lines) =>
          this.html`<option value="${lines}" 
        ${lines === pagination.linesPerPage ? 'selected="selected"' : ""}>
        ${lines} ligne${lines > 1 ? "s" : ""} par page
      </option>`
      )
      .join("\n");

    // Template final
    return this.html`
      <nav class="center-align">
        <button class="square ${pagination.hasPrevPage ? "" : "disabled"}" 
                ${pagination.hasPrevPage ? "" : 'disabled="disabled"'}
                onclick="samActions.executeAction({do:'paginationPrevPage'})">
          <i>navigate_before</i>
        </button>     
        ${pageButtons}      
        <button class="square ${pagination.hasNextPage ? "" : "disabled"}" 
                ${pagination.hasNextPage ? "" : 'disabled="disabled"'}
                onclick="samActions.executeAction({do:'paginationNextPage'})">
          <i>navigate_next</i>
        </button>
        <div class="field suffix small">
          <select onchange="samActions.executeAction({
            do:'paginationSetLinesPerPage', 
            lines:this.value
          })">
            ${linesOptions}
          </select>
          <i>arrow_drop_down</i>
        </div>
      </nav>
    `;
  },

  renderCartUI(model, state) {
    // Si panier caché, ne rien afficher
    if (!model.display.cartView) return "";

    const cart = state.cart;

    return this.html`
      <div class="panier row small-margin">
        <div class="col s0 m1 l2"></div>
        <section class="col s12 m10 l8">
          <div class="card">
            <h4>Panier</h4>
            <div>
              <table border="0" class="right-align large-text">
                <thead>
                  <tr>
                    <th class="center-align">
                      <a onclick="samActions.executeAction({do:'cartSort',property:'name'})">
                        Articles 
                        <i class="small">${
                          model.cartSort.property === "name"
                            ? model.cartSort.ascending.name
                              ? "arrow_upward"
                              : "arrow_downward"
                            : "unfold_more"
                        }</i>
                      </a>
                    </th>
                    <th class="center-align">
                      <a onclick="samActions.executeAction({do:'cartSort',property:'quantity'})">
                        Qté
                        <i class="small">${
                          model.cartSort.property === "quantity"
                            ? model.cartSort.ascending.quantity
                              ? "arrow_upward"
                              : "arrow_downward"
                            : "unfold_more"
                        }</i>
                      </a>
                    </th>
                    <th class="center-align">Unit</th>
                    <th class="center-align">P.U.</th>
                    <th class="center-align">
                      <a onclick="samActions.executeAction({do:'cartSort',property:'total'})">
                        Prix
                        <i class="small">${
                          model.cartSort.property === "total"
                            ? model.cartSort.ascending.total
                              ? "arrow_upward"
                              : "arrow_downward"
                            : "unfold_more"
                        }</i>
                      </a>
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${cart.values
                    .map(
                      (article) => this.html`
                    <tr>
                      <td class="left-align">${article.name}</td>
                      <td class="center-align">
                        <div class="field round fill small border center-align">
                          <input type="text" class="center-align"
                                 value="${article.quantity}"
                                 onchange="samActions.executeAction({
                                   do:'mettreAJourPanierItem',
                                   articleId: ${article.id},
                                   quantity: this.value
                                 })" />
                        </div>
                      </td>
                      <td class="center-align">${article.unit}</td>
                      <td>${this.inEuro(article.price)}</td>
                      <td>${this.inEuro(article.price * article.quantity)}</td>
                      <td>
                        <button class="circle small" 
                                onclick="samActions.executeAction({
                                  do:'mettreAJourPanierItem',
                                  articleId: ${article.id},
                                  quantity: 0
                                })">
                          <i>delete</i>
                        </button>
                      </td>
                    </tr>
                  `
                    )
                    .join("\n")}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" class="right-align">Total :</td>
                    <td>${this.inEuro(cart.total)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>
        <div class="col s0 m1 l2"></div>
      </div>
    `;
  },
};

function sendOrderEmail(client) {
  const cartArticles = this.state.cart.values;
  const total = this.state.cart.total;

  let email = "commandes@fruits-legumes.com";
  let sujet = "Commande de " + client;
  let corps = `
Commande de fruits et légumes

Voici les articles commandés pour un montant de ${samView.inEuro(total)} :

${cartArticles
  .map((article) => `- ${article.name} (${article.quantity} ${article.unit})`)
  .join("\n")}
  `;

  email = encodeURIComponent(email);
  sujet = encodeURIComponent(sujet);
  corps = encodeURIComponent(corps);

  const uri = "mailto:" + email + "?subject=" + sujet + "&body=" + corps;
  window.open(uri);
}