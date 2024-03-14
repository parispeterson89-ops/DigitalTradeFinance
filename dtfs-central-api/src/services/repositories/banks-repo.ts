import db from '../../drivers/db-client';
import { DB_COLLECTIONS } from '../../constants';
import { Bank } from '../../types/db-models/banks';

export const getAllBanks = async (): Promise<Bank[]> => {
  const banksCollection = await db.getCollection(DB_COLLECTIONS.BANKS);
  return await banksCollection.find().toArray();
};

export const getBankNameById = async (bankId: string) => {
  const banksCollection = await db.getCollection(DB_COLLECTIONS.BANKS);
  const bank = await banksCollection.findOne({ id: { $eq: bankId } });
  return bank?.name;
};