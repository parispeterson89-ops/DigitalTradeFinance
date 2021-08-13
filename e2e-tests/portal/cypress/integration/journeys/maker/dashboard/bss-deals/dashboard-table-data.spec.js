/* eslint-disable no-undef */
const { dashboard } = require('../../../../pages');
const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
// slight oddity- this test seems to need a straight 'maker'; so filtering slightly more than in other tests..
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.roles.length === 1));

const regexDateTime = /\d?\d \w\w\w \d\d\d\d/;

context('View a deal', () => {
  context('no checker', () => {
    let deal;
    const dummyDeal = {
      details: {
        bankSupplyContractID: 'abc-1-def',
        bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      },
    };

    beforeEach(() => {
      // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
      cy.on('uncaught:exception', (err) => {
        console.log(err.stack);
        return false;
      });

      // clear down our test users old deals, and insert new ones - updating our deal object
      cy.deleteDeals(MAKER_LOGIN);
      cy.insertOneDeal(dummyDeal, MAKER_LOGIN)
        .then((insertedDeal) => { deal = insertedDeal; });
    });

    it('A created BSS deal appears on the dashboard', () => {
      // login and go to dashboard
      cy.login(MAKER_LOGIN);
      dashboard.visit();

      const id = deal._id;

      const {
        bankRef, product, status, updated, link,
      } = dashboard.row;

      bankRef(id).invoke('text').then((text) => {
        expect(text.trim()).equal('Tibettan submarine acquisition scheme');
      });

      product(id).invoke('text').then((text) => {
        expect(text.trim()).equal('BSS/EWCS');
      });

      status(id).invoke('text').then((text) => {
        expect(text.trim()).equal('Draft');
      });

      updated(id).invoke('text').then((text) => {
        expect(text.trim()).to.match(regexDateTime);
      });

      link(id).click();

      cy.url().should('eq', relative(`/contract/${id}`));
    });
  });
});