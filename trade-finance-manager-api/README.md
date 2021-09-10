# Trade Finance Manager API

Also known as TFM, TFM API is primarily responsible for handling deal submission to UKEF.

Once TFM has successfully received a deal, graphQL is used to query and mutate TFM data.

## Prerequisite

Make sure you have an `.env`. Use `.env.sample` as a base. Some sensitive variables need to be shared from the team.

## Running locally

```shell
docker-compose up
```

Alternatively, every service can be started from the root directory (`docker-compose up`).

## Testing

In a second terminal, run:

```shell
npm run api-test
```

Test coverage will be generated.

### **Run a single API test**

```shell
npm run api-test-file "**/*/deals-party-db.api-test.js"
```

## What this API does

When a deal is submitted to UKEF from the Portal, the deal is sent to TFM API. TFM API has 4 responsibilities:

- Accept submitted deals
- Trigger a status update for the Portal (from 'Submitted' to e.g 'Acknowledged')
- Call external UKEF APIs to populate more data (e.g currency conversions)
- Thereafter allowing TFM users to complete necessary updates to the deal (triggered by TFM UI)

:warning: In TFM, a deal is known as a 'Case'. A Case will have one deal with facilities and tasks for the users's to complete in order to process the case.

## What happens when a deal is sent to TFM

In essence:

1) Get the deal from the database by deal ID
2) Create a snapshot of the deal and facilities
3) Add the snapshots to TFM collections
4) Map all fields into a generic format
5) Update the deal status in Portal to 'Acknowledged' or 'In progress'
6) Make calls to external UKEF APIs. Add all data to tfm object in the deal and facilities
7) Generate a list of tasks for the deal
8) Send emails for acknowledgment and 'tasks are ready to start'

All of this starts from the deal submission controller: `/src/v1/controllers/deal.submit.controller.js`

## Snapshots and data structure

When a deal is sent to TFM, the structure will be something like this (very simple example):

```js
{
  _id: '1234',
  submissionType: 'Automatic Inclusion Notice',
  ...
}
```

When TFM creates a snapshot (and adds to the TFM collections) for it's own consumption, the deal structure becomes:

```js
{
  _id: '1234',
  dealSnapshot: {
    _id: '1234',
    submissionType: 'Automatic Inclusion Notice',
    ...
  },
  tfm: {
    dateReceived: '12-12-2021',
    tasks: [],
    history: [],
    ...
  },
}
```

:warning: **The snapshot should not be changed by TFM.** TFM updates are stored in the tfm object.

This is exactly the same for facilities - just replace `dealSnapshot` with `facilitySnapshot`.

The only exception for updating the snapshot is when TFM changes the `submissionType`. The alternative would be to send an update to Portal and then Portal re-submits to TFM; which is not performant.

## Different product types and data

There are currently 2 types of deals and 4 types of facilities that TFM receives:

- BSS and EWCS (bond and loan facilities for a BSS deal)
- CASH and CONTINGENT (facilities for a GEF deal)

More info in the [glossary](https://ukef-dtfs.atlassian.net/wiki/spaces/DS/pages/7471490/DTFS+-+glossary)

At the time of writing, BSS has a very different structure to GEF. GEF is a lot cleaner.

Eventually, BSS will be redesigned and become aligned with the GEF data structure. Both products have a lot of similarities, but currently does not have a generic, shared structure.

Therefore in TFM, we currently need to deal with 2 different data structures for BSS and GEF.

### BSS deal structure example

```js
{
  _id: '1',
  dealType: 'BSS/EWCS',
  details: {
    submissionType: 'Automatic Inclusion Notice',
    submissionDate: '1606900616651',
  },
  submissionDetails: {
    'supplier-name': 'Test'
  },
  facilities: [ '1', '2' ],
  ...
}
```

### GEF deal structure example

```js
{
  _id: '2',
  dealType: 'GEF',
  submissionType: 'Automatic Inclusion Notice',
  submissionDate: '1606900616651',
  exporter: {
    companyName: 'Test'
  },
  ...
}
```

### BSS facility structure example

```js
{
  _id: '100',
  facilityType: 'bond',
  requestedCoverStartDate: '1606900616652',
  coveredPercentage: '20',
  ...
}
```

### GEF facility structure example

```js
{
  _id: '200',
  type: 'CASH',
  coverStartDate: '2021-12-12T00:00:00.000Z',
  coverPercentage: 12,
  ...
}
```

## Mapping different product types and data

We map the data when:

1) Deal is submitted to TFM
    - Create a flat, generic structure for all deal and facility types.
    - Use the generic structure to call external UKEF APIs.
    - Only the fields required for API calls are mapped.
    - This is only referenced locally in the submit controller: `/src/v1/controllers/deal.submit.controller.js`. It is not stored or referenced anywhere else.
    - See map-submitted-deal: `/src/v1/mappings/map-submitted-deal`

2) The deal or facility is queried from the UI (after submission)
    - Maps all deals and facilities into the BSS structure.
    - A GEF deal/facility will get mapped into the BSS structure.
    - See GraphQL reducer mappings: `/src/graphql/reducers`

When BSS is redesigned, it should share a generic data structure with GEF. TFM should then be refactored to query and render data based on the generic data structure, instead of BSS. The submission mapping is a step towards this.
