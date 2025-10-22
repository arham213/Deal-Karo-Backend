import mongoose from "mongoose";

const { Schema } = mongoose;

const PropertySchema = new Schema({
  dealerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true, enum: ['plot', 'house'] },
  category: { type: String, required: true, enum: ['sale', 'rent', 'installments'] },
  title: { type: String, required: true },
  location: { type: String, required: true },
  area: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  moreOptions: { type: String },
  forContact: { type: String, required: true }
}, { 
  discriminatorKey: 'type',
  collection: 'properties',
  timestamps: true
});

const PropertyModel = mongoose.model('Property', PropertySchema);

const PlotModel = PropertyModel.discriminator('plot', new Schema({
  plotNumber: String,
  installment: {
    perMonth: Number,
    quarterly: Number
  }
}));

const HouseModel = PropertyModel.discriminator('house', new Schema({
  rentPerMonth: Number,
  installment: {
    perMonth: Number,
    quarterly: Number
  }
}));

export { PropertyModel, PlotModel, HouseModel };