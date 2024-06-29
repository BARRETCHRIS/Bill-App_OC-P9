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

describe('Given I am connected as an employee', () => {
  // Début d'une suite de tests qui vérifie le comportement lorsque l'utilisateur est connecté en tant qu'employé.

  describe('When I am on new bill page', () => {
    // Sous-suite de tests qui vérifie le comportement lorsque l'utilisateur est sur la page de création de nouvelles notes de frais.

    beforeEach(() => {
      // Configuration commune à tous les tests de cette suite
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
      document.body.innerHTML = NewBillUI();
    });

    test('handleChangeFile() should be called when file input changes', () => {
      // Test pour vérifier que la fonction handleChangeFile() est appelée lorsque l'événement 'change' est déclenché sur l'élément input de fichier.

      const newBillObject = new NewBill({ document, onNavigate: {}, store: {}, localStorage: {} });
      const handleChange = jest.fn(newBillObject.handleChangeFile);
      const inputFile = screen.getByTestId('file');

      inputFile.addEventListener('change', handleChange);

      // Simulation d'un changement de fichier
      fireEvent.change(inputFile);

      // Vérification que handleChangeFile a été appelée
      expect(handleChange).toHaveBeenCalled();
    });

    test('handleClickDashboardBills() should be called when dashboard icon is clicked', () => {
      // Test pour vérifier que la fonction handleClickDashboardBills() est appelée lorsque l'élément avec data-testid="icon-window" est cliqué.

      const onNavigate = jest.fn();
      const newBillObject = new NewBill({ document, onNavigate, store: {}, localStorage: {} });
      const handleClickDashboardBills = jest.spyOn(newBillObject, 'handleClickDashboardBills');
      const iconWindow = screen.getByTestId('icon-window');

      iconWindow.addEventListener('click', newBillObject.handleClickDashboardBills);

      // Simulation d'un clic sur l'icône du tableau de bord
      fireEvent.click(iconWindow);

      // Vérification que handleClickDashboardBills a été appelée
      expect(handleClickDashboardBills).toHaveBeenCalled();
    });
  });

  describe('When I am on new bill page, fill fields correctly, and click submit', () => {
    // Sous-suite de tests qui vérifie le comportement lorsque les champs sont correctement remplis et que le bouton de soumission est cliqué.

    beforeEach(() => {
      // Configuration commune à tous les tests de cette suite
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
      document.body.innerHTML = NewBillUI();
    });

    test('should submit the form and navigate to Bills page', () => {
      // Test pour vérifier que la soumission d'une nouvelle note de frais fonctionne correctement.

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();

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

      const newBillObject = new NewBill({ document, onNavigate, store: storeMock, localStorage: window.localStorage });
      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn(newBillObject.handleSubmit);

      form.addEventListener("submit", handleSubmit);

      // Simulation de la soumission du formulaire
      fireEvent.submit(form);

      // Vérification que handleSubmit a bien été appelée
      expect(handleSubmit).toHaveBeenCalled();

      // Vérification que l'utilisateur est redirigé vers la page des notes de frais
      const titleBills = screen.queryByText("Mes notes de frais");
      expect(titleBills).toBeTruthy();
    });

    test('handleSubmit should return a non-empty object', () => {
      // Test pour vérifier que handleSubmit renvoie un objet non vide.

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();

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

      const newBillObject = new NewBill({ document, onNavigate, store: storeMock, localStorage: window.localStorage });
      const form = screen.getByTestId("form-new-bill");

      const handleSubmit = jest.fn((e) => {
        e.preventDefault();
        const bill = newBillObject.handleSubmit(e);
        expect(bill).not.toEqual({});
        return bill;
      });

      form.addEventListener("submit", handleSubmit);

      // Simulation de la soumission du formulaire
      fireEvent.submit(form);

      // Vérification que handleSubmit a bien été appelée
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});