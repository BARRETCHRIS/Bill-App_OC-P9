/**
 * @jest-environment jsdom
 */
// Cette ligne indique à Jest d'utiliser un environnement de simulation DOM (Document Object Model) pour les tests.

import NewBill from "../containers/NewBill";
import NewBillUI from "../views/NewBillUI";
import { localStorageMock } from "../__mocks__/localStorage";
import { fireEvent, screen } from "@testing-library/dom";
import { ROUTES } from "../constants/routes";
import router from "../app/Router";

// Les imports des modules nécessaires pour les tests, y compris le composant à tester (NewBill), l'interface utilisateur (NewBillUI),
// une simulation de localStorage (localStorageMock), des outils pour simuler des événements (fireEvent) et interroger le DOM (screen),
// les constantes de routes (ROUTES) et le routeur (router).

describe('Given i am connected as an employee', () => {
  // Début d'une suite de tests qui vérifie le comportement lorsque l'utilisateur est connecté en tant qu'employé.

  describe('When i am on new bill page', () => {
    // Sous-suite de tests qui vérifie le comportement lorsque l'utilisateur est sur la page de création de nouvelles notes de frais.

    test('That handleChangeFile() function is callable when change event is triggered', () => {
      // Test pour vérifier que la fonction handleChangeFile() est appelée lorsque l'événement 'change' est déclenché sur l'élément input de fichier.

      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      // Redéfinition de la propriété 'localStorage' de l'objet 'window' avec la simulation de localStorage.

      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
      // Simulation de la connexion de l'utilisateur en tant qu'employé en définissant un objet utilisateur dans le localStorage.

      document.body.innerHTML = NewBillUI();
      // Insertion de l'interface utilisateur de la nouvelle note de frais dans le body du document.

      const newBillObjet = new NewBill({ document, onNavigate: {}, store: {}, localStorage: {} });
      // Création d'une instance du composant NewBill avec les paramètres requis.

      const handleChange = jest.fn((e) => newBillObjet.handleChangeFile(e));
      // Création d'une fonction factice (mock) pour handleChange qui appelle la méthode handleChangeFile du composant.

      const inputFile = screen.getByTestId('file');
      // Récupération de l'élément input de fichier par son attribut data-testid.

      inputFile.addEventListener('change', handleChange);
      // Ajout d'un écouteur d'événement 'change' sur l'input de fichier qui utilise la fonction factice handleChange.

      fireEvent.change(inputFile);
      // Simulation d'un événement 'change' sur l'input de fichier.

      expect(handleChange).toHaveBeenCalled();
      // Vérification que la fonction handleChange a bien été appelée.
    });
  });

  describe('When i am on new bill page, i do fill fields in correct format and i click submit button', () => {
    // Sous-suite de tests qui vérifie le comportement lorsque les champs sont correctement remplis et que le bouton de soumission est cliqué.

    test('POST new bill', () => {
      // Test pour vérifier que la soumission d'une nouvelle note de frais fonctionne correctement.

      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      // Redéfinition de la propriété 'localStorage' de l'objet 'window' avec la simulation de localStorage.

      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
      // Simulation de la connexion de l'utilisateur en tant qu'employé en définissant un objet utilisateur dans le localStorage.

      document.body.innerHTML = NewBillUI();
      // Insertion de l'interface utilisateur de la nouvelle note de frais dans le body du document.

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      // Définition d'une fonction onNavigate qui met à jour le contenu du body du document en fonction du chemin de la route.

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      // Création et ajout d'un élément div avec l'id "root" au body, puis initialisation du routeur.

      const storeMock = {
        bills: () => {
          return {
            update: function(bill) {
              return {
                then: function (fn) {
                  return { catch: () => {} };
                }
              };
            }
          };
        },
      };
      // Simulation de l'objet store avec une méthode bills qui renvoie un objet avec une méthode update,
      // qui à son tour renvoie un objet avec une méthode then et une méthode catch vide.

      const newBillObjet = new NewBill({ document, onNavigate, store: storeMock, localStorage: window.localStorage });
      // Création d'une instance du composant NewBill avec les paramètres requis, y compris la simulation de store.

      const form = screen.getByTestId("form-new-bill");
      // Récupération de l'élément formulaire par son attribut data-testid.

      const handleSubmit = jest.fn((e) => newBillObjet.handleSubmit(e));
      // Création d'une fonction factice (mock) pour handleSubmit qui appelle la méthode handleSubmit du composant.

      form.addEventListener("submit", handleSubmit);
      // Ajout d'un écouteur d'événement 'submit' sur le formulaire qui utilise la fonction factice handleSubmit.

      fireEvent.submit(form);
      // Simulation d'un événement 'submit' sur le formulaire.

      expect(handleSubmit).toHaveBeenCalled();
      // Vérification que la fonction handleSubmit a bien été appelée.

      const titleBills = screen.queryByText("Mes notes de frais");
      // Recherche d'un élément avec le texte "Mes notes de frais" dans le DOM.

      expect(titleBills).toBeTruthy();
      // Vérification que l'élément avec le texte "Mes notes de frais" est présent dans le DOM.
    });
  });
});