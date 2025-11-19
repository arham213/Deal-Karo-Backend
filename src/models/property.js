import mongoose from "mongoose";

const { Schema } = mongoose;

const PropertySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  propertyType: { type: String, required: true, enum: ['plot', 'house', 'commercial plot'], index: true },
  listingType: { type: String, required: true, enum: ['cash', 'rent', 'installments'], index: true },
  phase: { type: String, required: true, index: true },
  block: { type: String, required: true, index: true },
  area: { type: String, required: true, index: true },
  additionalArea: { type: String },
  price: { type: Number, index: true },
  description: { type: String },
  // features: [{ type: String }],
  forContact: { type: String, required: true }
}, { 
  discriminatorKey: 'propertyType',
  collection: 'properties',
  timestamps: true
});

// Compound indexes for common search queries
PropertySchema.index({ propertyType: 1, listingType: 1 });
PropertySchema.index({ phase: 1, block: 1 });
PropertySchema.index({ price: 1, propertyType: 1 });
PropertySchema.index({ area: 1, propertyType: 1 });
// PropertySchema.index({ features: 1 }); // Index for features array filtering
// Text index for simple search
PropertySchema.index({ description: 'text', phase: 'text', block: 'text', area: 'text' });

const PropertyModel = mongoose.model('Property', PropertySchema);

const PlotModel = PropertyModel.discriminator('plot', new Schema({
  plotNo: { type: Number, index: true },
  pricePerMarla: Number,
  installment: {
    perMonth: Number,
    halfYearly: Number,
  }
}));

const HouseModel = PropertyModel.discriminator('house', new Schema({
  houseNo: { type: Number, index: true },
  // rentPerMonth: Number,
  // installment: {
  //   perMonth: Number,
  //   halfYearly: Number
  // }
}));

const CommercialPlotModel = PropertyModel.discriminator('commercial plot', new Schema({
  plotNo: { type: Number, unique: true, index: true },
  pricePerMarla: Number,
  installment: {
    perMonth: Number,
    halfYearly: Number
  }
}));

export { PropertyModel, PlotModel, HouseModel, CommercialPlotModel };