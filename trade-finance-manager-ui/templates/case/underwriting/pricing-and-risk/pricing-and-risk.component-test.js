const pageRenderer = require('../../../../component-tests/pageRenderer');
const page = '../templates/case/underwriting/pricing-and-risk/pricing-and-risk.njk'

const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  let params = {
    dealId: '1234',
    deal: {
      submissionDetails: {
        supplierName: 'The Supplier Name',
      },
    },
  };

  it('should render underwriting heading', () => {
    const wrapper = render(params);
    wrapper.expectText('[data-cy="underwriting-heading"]').toRead('Underwriting');
  });

  it('should render Pricing and risk heading', () => {
    const wrapper = render(params);
    wrapper.expectText('[data-cy="pricing-and-risk-heading"]').toRead('Pricing and risk');
  });

  it('should render Exporter heading', () => {
    const wrapper = render(params);
    wrapper.expectText('[data-cy="exporter-heading"]').toRead('Exporter');
  });

  it('should render link to add credit rating', () => {
    const wrapper = render(params);
    wrapper.expectLink('[data-cy="add-credit-rating-link"]')
      .toLinkTo(`/case/${params.dealId}/underwriting/pricing-and-risk/edit`, `Add a credit rating for ${params.deal.submissionDetails.supplierName}`);
  });

  describe('with params.exporterCreditRating', () => {
    it('should NOT render link to add credit rating', () => {
      params = {
        ...params,
        tfm: {
          exporterCreditRating: 'Good (BB-)',
        },
      };

      const wrapper = render(params);
      wrapper.expectElement('[data-cy="add-credit-rating-link"]').notToExist();
    });

    it('should render credit rating table', () => {
      params = {
        ...params,
        tfm: {
          exporterCreditRating: 'Good (BB-)',
        },
      };

      const wrapper = render(params);
      wrapper.expectElement('[data-cy="credit-rating-table"]').toExist();
    });
  });
});