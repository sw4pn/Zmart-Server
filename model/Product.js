import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Brand",
    },
    sold: {
      type: Number,
      default: 0,
    },
    // features: {
    //   type: Array,
    //   default: [],
    // },
    // tags: {
    //   type: Array,
    //   default: [],
    // },
    color: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Color",
        required: false,
      },
    ],
    thumbnail: {
      public_id: String,
      url: String,
    },
    images: [
      {
        public_id: String,
        url: String,
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        star: Number,
        review: String,
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        date: Date,
      },
    ],
    type: {
      type: String,
    },
    variant: [
      {
        id: Number,
        title: String,
      },
    ],
    specification: {
      model: {
        type: { number: String, name: String },
      },
      os: String,
      processor: String,
      processorSpeed: String,
      ram: String,
      storageIn: String,
      resolution: String,
      display: String,
      displayType: String,
      simType: String,
      simSize: String,
      network: String,
      bluetooth: String,
      wifi: String,
      cameraPrimary: String,
      cameraSecondary: String,
      batteryCapacity: String,
      batteryType: String,
      height: String,
      weight: String,
      warranty: String,
      frequency: String,
      audioType: String,
      brightness: String,
      size: String,
      audioJack: String,
      extra: [
        {
          name: String,
          feature: String,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// productSchema.plugin(mongooseSequence(mongoose), {
//   inc_field: "pid",
//   start_seq: 1000,
// });

export default mongoose.model("Product", productSchema);
