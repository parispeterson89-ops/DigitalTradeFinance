import relative from '../relativeURL';
import applicationDetails from '../pages/application-details';
import automaticCover from '../pages/automatic-cover';
import applicationSubmission from '../pages/application-submission';
import CREDENTIALS from '../../fixtures/credentials.json';
import applicationPreview from '../pages/application-preview';
import returnToMaker from '../pages/return-to-maker';

const applicationIds = [];
context('Submit application to UKEF', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        body.items.forEach((item) => {
          applicationIds.push(item._id);
        });
      });
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
  });

  describe('DTFS2-4698 MakerChecker should not be able to submit own edited deals', () => {
    it('does not allow a maker/checker to submit own edited deals', () => {
      // login as a maker and submit
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${applicationIds[2]}`));

      // Make the deal an Automatic Inclusion Application
      applicationDetails.automaticCoverDetailsLink().click();
      automaticCover.automaticCoverTerm().each(($el, index) => {
        $el.find('[data-cy="automatic-cover-true"]').trigger('click');
      });
      automaticCover.saveAndReturnButton().click();

      // submit the deal
      applicationDetails.submitButton().click();
      applicationSubmission.commentsField().type('DTFS2-4698 Comments from original maker');
      applicationSubmission.submitButton().click();
      applicationSubmission.confirmation();

      // login as a maker/checker and return to the maker with a comment.
      cy.login(CREDENTIALS.MAKER_CHECKER);
      cy.visit(relative(`/gef/application-details/${applicationIds[2]}`));
      applicationPreview.returnButton().click();
      returnToMaker.comment().type('nope');
      returnToMaker.submitButton().click();
      cy.location('pathname').should('contain', 'dashboard');
      cy.visit(relative(`/gef/application-details/${applicationIds[2]}`));

      applicationDetails.editRefNameLink().should('have.text', 'HSBC 123');

      // could update the application as the maker/checker
      applicationDetails.addCashFacilityButton();
      applicationDetails.addContingentFacilityButton();

      // it displays the comments from the checker
      applicationPreview.task();
      applicationPreview.comments();
      applicationPreview.comments().contains('nope');

      // it allows the maker/checker to submit to be checked at the bank
      // submit the application to be checked again
      applicationDetails.submitButton().click();

      // it allows the maker to optionally add additional comments
      applicationSubmission.commentsField().type('Hello');
      applicationSubmission.submitButton().click();
      applicationSubmission.confirmation();

      // it changes the status to Ready for Checker's approval
      // view the application as the maker/checker
      cy.visit(relative(`/gef/application-details/${applicationIds[2]}`));
      applicationPreview.status().contains("Ready for Checker's approval");

      // the ability to return the application or submit to ukef should not be visible
      applicationPreview.submitButton().should('not.exist');
      applicationPreview.returnButton().should('not.exist');
    });
  });
});