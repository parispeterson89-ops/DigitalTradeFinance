// eslint-disable-next-line import/no-unresolved
import gql from 'graphql-tag';

const dealQuery = gql`
query DealsLight($searchString: String, $sortBy: DealsSortBy, $start: Int, $pagesize: Int){
  dealsLight(params: {searchString: $searchString, sortBy: $sortBy, start: $start, pagesize: $pagesize}) {
    count
    deals {
      _id
      tfm {
        product
        stage
        dateReceived
      }
      dealSnapshot {
        details {
          ukefDealId
          submissionType
          owningBank {
            name
          }
        }
        submissionDetails {
          supplierName
          buyerName
        }
      }
    }
  }
}
`;

export default dealQuery;