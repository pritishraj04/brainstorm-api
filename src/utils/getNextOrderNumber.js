import Counter from "../models/Counter.js";

const getNextOrderNumber = async () => {
  const orderNumber = await Counter.findByIdAndDelete(
    { _id: "orderNumber" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return `ORD${orderNumber.seq.toString().padStart(6, "0")}`;
};

export default getNextOrderNumber;
