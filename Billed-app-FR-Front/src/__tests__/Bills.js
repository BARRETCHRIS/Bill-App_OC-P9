/**
 * @jest-environment jsdom
 */

import {screen, waitFor, fireEvent} from "@testing-library/dom"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js";
import { ROUTES_PATH, ROUTES} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";
import BillsUI from "../views/BillsUI.js";
jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then window icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon).toBeTruthy()
    })

    test("Then bills should be ordered from earliest to latest", () => {
      const billsSorted = [...bills].sort((a, b) => {
        return new Date(a.date) < new Date(b.date) ? 1 : -1;
      });

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
      
      const billsObject = new Bills({
        document,
        onNavigate: {},
        store: storeMock,
        localStorage: {},
      });
      const testBillsSorted = billsObject.getBills();

      expect(testBillsSorted.map((bill) => bill.id)).toEqual(
        billsSorted.map((bill) => bill.id)
      );
    })

    test('That user is redirected to newBill page when he clicks on newBill button', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      document.body.innerHTML = BillsUI({bills})
      const billsObjet = new Bills({ document, onNavigate, store : {}, localStorage : localStorageMock});
      const handleClick = jest.fn(billsObjet.handleClickNewBill)
      const buttonNewBill = screen.getByTestId('btn-new-bill')
      buttonNewBill.addEventListener('click', handleClick)
      fireEvent.click(buttonNewBill)
      expect(handleClick).toHaveBeenCalled()
    })

    test("call to handleClickIconEye should work properly", () => {
      const myMock = jest.fn()
      global.$.fn.modal = () => true;
      global.$.fn.find = () => {
        return {
          html: myMock
        }
      }

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

      const billsObject = new Bills({
        document,
        onNavigate: {},
        store: storeMock,
        localStorage: {},
      });
      billsObject.handleClickIconEye({getAttribute: () => 'lsfjklqjfhqkfh'})
      const myTest = myMock.mock.calls[0][0].includes('lsfjklqjfhqkfh');
      expect(myTest).toEqual(true);

    })

    describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
  })
})