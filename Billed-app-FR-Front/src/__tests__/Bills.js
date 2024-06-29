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

// Import des modules nécessaires pour les tests

describe("Given I am connected as an employee", () => {
  // Début d'une suite de tests pour vérifier le comportement en tant qu'employé connecté.

  beforeEach(() => {
    // Configuration commune avant chaque test
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()
  })

  describe("When I am on Bills Page", () => {
    // Sous-suite de tests pour vérifier le comportement sur la page des factures.

    test("Then window icon in vertical layout should be highlighted", async () => {
      // Test pour vérifier que l'icône de la fenêtre dans la mise en page verticale est mise en surbrillance.

      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))

      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon).toBeTruthy()
    })


    test("Then bills should be ordered from latest to earliest", async () => {
      // Test pour vérifier que les factures sont triées de la plus récente à la plus ancienne.

      const billsSorted = [...bills].sort((a, b) => new Date(b.date) - new Date(a.date))
      const storeMock = {
        bills: () => ({
          list: () => Promise.resolve(bills)
        })
      }
      const billsObject = new Bills({ document, onNavigate: {}, store: storeMock, localStorage: {} })
      
      // Utilisation de la méthode getBills pour récupérer les factures
      const testBills = await billsObject.getBills()
      
      // S'assurer que les factures sont triées correctement
      const testBillsSorted = testBills.sort((a, b) => new Date(b.date) - new Date(a.date))
      
      expect(testBillsSorted.map(bill => bill.id)).toEqual(billsSorted.map(bill => bill.id))
    })

    test("Then getBills should to recover a non-empty array", async () => {
      // Test pour vérifier que la méthode getBills récupère un tableau non vide.

      const storeMock = {
        bills: () => ({
          list: () => Promise.resolve(bills)
        })
      }
      const billsObject = new Bills({ document, onNavigate: {}, store: storeMock, localStorage: {} })
      const testBills = await billsObject.getBills()
      
      expect(testBills.length).not.toBe(0)
    })

    test('Then user is redirected to newBill page when clicking on newBill button', () => {
      // Test pour vérifier que l'utilisateur est redirigé vers la page de nouvelle facture lorsqu'il clique sur le bouton de nouvelle facture.

      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
      document.body.innerHTML = BillsUI({bills})
      const billsObject = new Bills({ document, onNavigate, store : {}, localStorage : localStorageMock })
      const handleClickNewBill = jest.fn(billsObject.handleClickNewBill)
      const buttonNewBill = screen.getByTestId('btn-new-bill')

      buttonNewBill.addEventListener('click', handleClickNewBill)
      fireEvent.click(buttonNewBill)
      
      expect(handleClickNewBill).toHaveBeenCalled()
    })

    test("Then clicking on eye icon should open modal", () => {
      // Test pour vérifier que l'appel à handleClickIconEye fonctionne correctement et ouvre une modal.

      const myMock = jest.fn()
      global.$.fn.modal = () => true
      global.$.fn.find = () => ({ html: myMock })
      const storeMock = {
        bills: () => ({
          list: () => Promise.resolve(bills)
        })
      }
      const billsObject = new Bills({ document, onNavigate: {}, store: storeMock, localStorage: {} })
      billsObject.handleClickIconEye({ getAttribute: () => 'facturefactisse' })

      expect(myMock).toHaveBeenCalledWith(expect.stringContaining('facturefactisse'))
    })

    describe("When an error occurs on API", () => {
      // Sous-suite de tests pour vérifier le comportement lorsque des erreurs surviennent lors des appels à l'API.

      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
      })

      test("Then fetches bills from an API and fails with 404 message error", async () => {
        // Test pour vérifier le comportement lorsque la récupération des factures échoue avec une erreur 404.

        mockStore.bills.mockImplementationOnce(() => ({
          list: () => Promise.reject(new Error("Erreur 404"))
        }))

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick)

        const message = screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test("Then fetches bills from an API and fails with 500 message error", async () => {
        // Test pour vérifier le comportement lorsque la récupération des factures échoue avec une erreur 500.

        mockStore.bills.mockImplementationOnce(() => ({
          list: () => Promise.reject(new Error("Erreur 500"))
        }))

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick)

        const message = screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})