import  { Schema, model } from 'mongoose';
import { TpolicyModel } from "../utils/types"


const policySchema = new Schema<TpolicyModel>(
  {
    data: Object,
    provider_link: String,
    user_email: String,
    tab_id:String
  },
  {
    timestamps: true,
  }
);

export const policyModel = model<TpolicyModel>('policy', policySchema);