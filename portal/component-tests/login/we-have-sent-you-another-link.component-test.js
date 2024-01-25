const pageRenderer = require('../pageRenderer');

const page = 'login/we-have-sent-you-another-link.njk';
const render = pageRenderer(page);

describe(page, () => {
  const obscuredSignInLinkTargetEmailAddress = 'u**r@example.com';
  const regexForTextContainingTargetEmailAddress = /u\*\*r@example\.com/;
  let wrapper;

  beforeEach(() => {
    wrapper = render({ obscuredSignInLinkTargetEmailAddress });
  });

  it('should render email link to contact DTFS team', () => {
    wrapper.expectText('[data-cy="dtfs-email-link"]').toRead('DigitalService.TradeFinance@ukexportfinance.gov.uk');
  });

  it('should render the email address the sign in link has been sent to', () => {
    wrapper.expectText('[data-cy="obscured-sign-in-link-target-email-address"]').toMatch(regexForTextContainingTargetEmailAddress);
  });
});