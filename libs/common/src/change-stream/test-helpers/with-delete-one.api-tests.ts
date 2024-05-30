import { ClientSession, Collection, ObjectId, WithoutId } from 'mongodb';
import { when } from 'jest-when';
import { MongoDbClient } from '../../mongo-db-client';
import { AuditDatabaseRecord, DeletionAuditLog, MongoDbCollectionName } from '../../types';
import { changeStreamConfig } from '../config';

type Params = {
  makeRequest: () => Promise<void>;
  collectionName: MongoDbCollectionName;
  auditRecord: AuditDatabaseRecord;
  getDeletedDocumentId: () => ObjectId;
};

export const withDeleteOneTests = ({ makeRequest, collectionName, auditRecord, getDeletedDocumentId }: Params) => {
  describe(`when deleting a document from ${collectionName}`, () => {
    let mongoDbClient: MongoDbClient;
    let deletionAuditLogsCollection: Collection<WithoutId<DeletionAuditLog>>;
    const mockDeleteOne = jest.spyOn(Collection.prototype, 'deleteOne');
    const mockInsertOne = jest.spyOn(Collection.prototype, 'insertOne');

    beforeAll(async () => {
      mongoDbClient = new MongoDbClient({
        dbName: process.env.MONGO_INITDB_DATABASE as string,
        dbConnectionString: process.env.MONGODB_URI as string,
      });

      deletionAuditLogsCollection = await mongoDbClient.getCollection('deletion-audit-logs');
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    afterAll(async () => {
      await mongoDbClient.close();
      mockDeleteOne.mockRestore();
      mockInsertOne.mockRestore();
    });

    if (changeStreamConfig.CHANGE_STREAM_ENABLED === 'true') {
      describe('when the service is working normally', () => {
        it('should add a deletion audit log', async () => {
          await makeRequest();

          const deletionAuditLogs = await deletionAuditLogsCollection
            .find({ collectionName: { $eq: collectionName }, deletedDocumentId: { $eq: getDeletedDocumentId() } })
            .toArray();

          expect(deletionAuditLogs).toEqual([
            {
              _id: expect.any(ObjectId) as ObjectId,
              collectionName,
              deletedDocumentId: new ObjectId(getDeletedDocumentId()),
              auditRecord,
              expireAt: expect.any(Date) as Date,
            },
          ]);
        });

        it('should delete the document', async () => {
          await makeRequest();

          const collection = await mongoDbClient.getCollection(collectionName);
          const deletedDocument = await collection.findOne({ _id: { $eq: getDeletedDocumentId() } });

          expect(deletedDocument).toBe(null);
        });
      });

      describe('when deleting the document is not acknowledged', () => {
        beforeEach(() => {
          when(mockDeleteOne)
            .calledWith({ _id: { $eq: getDeletedDocumentId() } }, { session: expect.any(ClientSession) as ClientSession })
            .mockImplementationOnce(() => ({
              acknowledged: false,
            }));
        });

        itDoesNotUpdateTheDatabase();
      });

      describe('when no document is deleted', () => {
        beforeEach(() => {
          when(mockDeleteOne)
            .calledWith({ _id: { $eq: getDeletedDocumentId() } }, { session: expect.any(ClientSession) as ClientSession })
            .mockImplementationOnce(() => ({
              acknowledged: true,
              deletedCount: 0,
            }));
        });

        itDoesNotUpdateTheDatabase();
      });

      describe('when deleting the document throws an error', () => {
        beforeEach(() => {
          when(mockDeleteOne)
            .calledWith({ _id: { $eq: getDeletedDocumentId() } }, { session: expect.any(ClientSession) as ClientSession })
            .mockImplementationOnce(() => {
              throw new Error();
            });
        });

        itDoesNotUpdateTheDatabase();
      });

      describe('when inserting the deletion log is not acknowledged', () => {
        beforeEach(() => {
          when(mockInsertOne)
            // @ts-ignore
            .calledWith(
              {
                collectionName,
                deletedDocumentId: getDeletedDocumentId(),
                auditRecord,
                expireAt: expect.any(Date) as Date,
              },
              { session: expect.any(ClientSession) as ClientSession },
            )
            .mockImplementationOnce(() => ({
              acknowledged: false,
            }));
        });

        itDoesNotUpdateTheDatabase();
      });

      describe('when inserting the deletion log throws an error', () => {
        beforeEach(() => {
          when(mockInsertOne)
            // @ts-ignore
            .calledWith(
              {
                collectionName,
                deletedDocumentId: getDeletedDocumentId(),
                auditRecord,
                expireAt: expect.any(Date) as Date,
              },
              { session: expect.any(ClientSession) as ClientSession },
            )
            .mockImplementationOnce(() => {
              throw new Error();
            });
        });

        itDoesNotUpdateTheDatabase();
      });
    } else {
      it('should delete the document', async () => {
        await makeRequest();

        const collection = await mongoDbClient.getCollection(collectionName);
        const deletedDocument = await collection.findOne({ _id: { $eq: getDeletedDocumentId() } });

        expect(deletedDocument).toBe(null);
      });
    }

    function itDoesNotUpdateTheDatabase() {
      it('should not add a deletion audit log', async () => {
        await makeRequest();

        const deletionAuditLogs = await deletionAuditLogsCollection
          .find({ collectionName: { $eq: collectionName }, deletedDocumentId: { $eq: getDeletedDocumentId() } })
          .toArray();
        expect(deletionAuditLogs).toEqual([]);
      });

      it('should not delete the document', async () => {
        await makeRequest();

        const collection = await mongoDbClient.getCollection(collectionName);
        const document = await collection.findOne({ _id: { $eq: getDeletedDocumentId() } });

        expect(document).toBeTruthy();
      });
    }
  });
};