/**
 * @jest-environment jsdom
 */
// Cette ligne indique à Jest d'utiliser un environnement de simulation DOM (Document Object Model) pour les tests.

import {screen, waitFor, fireEvent} from "@testing-library/dom"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js";
import { ROUTES_PATH, ROUTES} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js";
import BillsUI from "../views/BillsUI.js";
jest.mock("../app/store", () => mockStore)

// Les imports des modules nécessaires pour les tests, y compris les outils pour simuler des événements (fireEvent) et interroger le DOM (screen, waitFor),
// les données de factures simulées (bills), le composant à tester (Bills), les constantes de routes (ROUTES_PATH, ROUTES),
// une simulation de localStorage (localStorageMock), une simulation du store (mockStore), le routeur (router),
// et l'interface utilisateur des factures (BillsUI). La ligne jest.mock() remplace les imports du store réel par mockStore pour les tests.

describe("Given I am connected as an employee", () => {
  // Début d'une suite de tests qui vérifie le comportement lorsque l'utilisateur est connecté en tant qu'employé.

  describe("When I am on Bills Page", () => {
    // Sous-suite de tests qui vérifie le comportement lorsque l'utilisateur est sur la page des factures.

    test("Then window icon in vertical layout should be highlighted", async () => {
      // Test pour vérifier que l'icône de la fenêtre dans la mise en page verticale est mise en surbrillance.

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // Redéfinition de la propriété 'localStorage' de l'objet 'window' avec la simulation de localStorage.

      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      // Simulation de la connexion de l'utilisateur en tant qu'employé en définissant un objet utilisateur dans le localStorage.

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      // Création et ajout d'un élément div avec l'id "root" au body.

      router()
      // Initialisation du routeur.

      window.onNavigate(ROUTES_PATH.Bills)
      // Navigation vers la page des factures.

      await waitFor(() => screen.getByTestId('icon-window'))
      // Attente que l'élément avec l'attribut data-testid 'icon-window' soit présent dans le DOM.

      const windowIcon = screen.getByTestId('icon-window')
      // Récupération de l'élément icône de la fenêtre par son attribut data-testid.

      expect(windowIcon).toBeTruthy()
      // Vérification que l'élément icône de la fenêtre est présent dans le DOM.
    })

    test("Then bills should be ordered from latest to earliest", () => {
      // Test pour vérifier que les factures sont triées de la plus récente à la plus ancienne.

      const billsSorted = [...bills].sort((a, b) => {
        return new Date(a.date) < new Date(b.date) ? 1 : -1;
      });
      // Tri des factures de la plus récente à la plus ancienne.

      const storeMock = {
        bills: () => {
          return {
            list: () => {
              return {
                then: (fn) => fn(bills),
              };
            },
          };
        },
      };
      // Simulation de l'objet store avec une méthode bills qui renvoie une méthode list,
      // qui à son tour renvoie un objet avec une méthode then qui appelle une fonction avec les factures.

      const billsObject = new Bills({
        document,
        onNavigate: {},
        store: storeMock,
        localStorage: {},
      });
      // Création d'une instance du composant Bills avec les paramètres requis, y compris la simulation de store.

      const testBillsSorted = billsObject.getBills();
      // Appel de la méthode getBills pour obtenir les factures triées.

      expect(testBillsSorted.map((bill) => bill.id)).toEqual(
        billsSorted.map((bill) => bill.id)
      );
      // Vérification que les factures obtenues sont triées correctement en comparant les IDs.
    })

    test('That user is redirected to newBill page when he clicks on newBill button', () => {
      // Test pour vérifier que l'utilisateur est redirigé vers la page de nouvelle facture lorsqu'il clique sur le bouton de nouvelle facture.

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // Redéfinition de la propriété 'localStorage' de l'objet 'window' avec la simulation de localStorage.

      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      // Simulation de la connexion de l'utilisateur en tant qu'employé en définissant un objet utilisateur dans le localStorage.

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      // Définition d'une fonction onNavigate qui met à jour le contenu du body du document en fonction du chemin de la route.

      document.body.innerHTML = BillsUI({bills})
      // Insertion de l'interface utilisateur des factures dans le body du document.

      const billsObjet = new Bills({ document, onNavigate, store : {}, localStorage : localStorageMock});
      // Création d'une instance du composant Bills avec les paramètres requis.

      const handleClick = jest.fn(billsObjet.handleClickNewBill)
      // Création d'une fonction factice (mock) pour handleClick qui appelle la méthode handleClickNewBill du composant.

      const buttonNewBill = screen.getByTestId('btn-new-bill')
      // Récupération de l'élément bouton de nouvelle facture par son attribut data-testid.

      buttonNewBill.addEventListener('click', handleClick)
      // Ajout d'un écouteur d'événement 'click' sur le bouton de nouvelle facture qui utilise la fonction factice handleClick.

      fireEvent.click(buttonNewBill)
      // Simulation d'un événement 'click' sur le bouton de nouvelle facture.

      expect(handleClick).toHaveBeenCalled()
      // Vérification que la fonction handleClick a bien été appelée.
    })

    test("call to handleClickIconEye should work properly", () => {
      // Test pour vérifier que l'appel à handleClickIconEye fonctionne correctement.

      const myMock = jest.fn()
      // Création d'une fonction factice (mock).

      global.$.fn.modal = () => true;
      // Simulation de la méthode modal de jQuery.

      global.$.fn.find = () => {
        return {
          html: myMock
        }
      }
      // Simulation de la méthode find de jQuery qui renvoie un objet avec une méthode html utilisant la fonction factice myMock.

      const storeMock = {
        bills: () => {
          return {
            list: () => {
              return {
                then: (fn) => fn(bills),
              };
            },
          };
        },
      };
      // Simulation de l'objet store avec une méthode bills qui renvoie une méthode list,
      // qui à son tour renvoie un objet avec une méthode then qui appelle une fonction avec les factures.

      const billsObject = new Bills({
        document,
        onNavigate: {},
        store: storeMock,
        localStorage: {},
      });
      // Création d'une instance du composant Bills avec les paramètres requis, y compris la simulation de store.

      billsObject.handleClickIconEye({getAttribute: () => 'lsfjklqjfhqkfh'})
      // Appel de la méthode handleClickIconEye du composant avec un objet qui a une méthode getAttribute renvoyant une chaîne de caractères.

      const myTest = myMock.mock.calls[0][0].includes('lsfjklqjfhqkfh');
      // Vérification que la fonction factice myMock a été appelée avec l'argument contenant la chaîne de caractères 'lsfjklqjfhqkfh'.

      expect(myTest).toEqual(true);
      // Vérification que l'appel à la fonction factice myMock est correct.
    })

    describe("When an error occurs on API", () => {
    // Sous-suite de tests qui vérifie le comportement lorsque des erreurs se produisent avec l'API.

    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      // Espionne la méthode bills de mockStore pour vérifier son utilisation.

      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      // Redéfinition de la propriété 'localStorage' de l'objet 'window' avec la simulation de localStorage.

      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      // Simulation de la connexion de l'utilisateur en tant qu'employé en définissant un objet utilisateur dans le localStorage.

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      // Création et ajout d'un élément div avec l'id "root" au body.

      router()
      // Initialisation du routeur.
    })

    test("fetches bills from an API and fails with 404 message error", async () => {
      // Test pour vérifier que la récupération des factures depuis l'API échoue avec une erreur 404.

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      // Simulation de la méthode bills de mockStore pour renvoyer une erreur 404 lors de l'appel de la méthode list.

      window.onNavigate(ROUTES_PATH.Bills)
      // Navigation vers la page des factures.

      await new Promise(process.nextTick);
      // Attente que toutes les tâches en file d'attente soient exécutées.

      const message = screen.getByText(/Erreur 404/)
      // Recherche d'un élément avec le texte "Erreur 404" dans le DOM.

      expect(message).toBeTruthy()
      // Vérification que l'élément avec le texte "Erreur 404" est présent dans le DOM.
    })

    test("fetches messages from an API and fails with 500 message error", async () => {
      // Test pour vérifier que la récupération des messages depuis l'API échoue avec une erreur 500.

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
      // Simulation de la méthode bills de mockStore pour renvoyer une erreur 500 lors de l'appel de la méthode list.

      window.onNavigate(ROUTES_PATH.Bills)
      // Navigation vers la page des factures.

      await new Promise(process.nextTick);
      // Attente que toutes les tâches en file d'attente soient exécutées.

      const message = screen.getByText(/Erreur 500/)
      // Recherche d'un élément avec le texte "Erreur 500" dans le DOM.

      expect(message).toBeTruthy()
      // Vérification que l'élément avec le texte "Erreur 500" est présent dans le DOM.
    })
  })
  })
})