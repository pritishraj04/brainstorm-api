import Coupon from "../models/Coupon.js";

const applyCoupon = async (couponCode, orderTotal) => {
  const coupon = await Coupon.findOne({ code: couponCode, isActive: true });

  if (!coupon) {
    throw new Error("Invalid or inactive coupon code: " + couponCode);
  }
  if (coupon.expirationDate && coupon.expirationDate < Date.now()) {
    throw new Error("Coupon has expired: " + couponCode);
  }
  if (coupon.usageLimit <= 0) {
    throw new Error("Coupon usage limit reached: " + couponCode);
  }
  const discountAmount = (orderTotal * coupon.discount) / 100;
  const finalDiscount = Math.min(discountAmount, coupon.discountPriceLimit);

  return {
    discountAmount: finalDiscount,
    newTotal: orderTotal - finalDiscount,
  };
};

export default applyCoupon;
