import crypto from "crypto"

const order_id = "order_REdXYnUd0kcIWu";
const payment_id = "pay_N9t1xk6Phxxxx";
const secret = "wMigRsLfjrl3yDznnbAUGo6N";

const sign = crypto
    .createHmac("sha256", secret)
    .update(order_id + "|" + payment_id)
    .digest("hex");

console.log(sign); 
