import test from "node:test";
import assert from "node:assert/strict";
import { calculateOrder } from "../src/lib/pricing";

test("calcula subtotal, taxas e total",()=>{const r=calculateOrder({items:[{quantity:2,unitPrice:10},{quantity:1,unitPrice:20}],collectionFee:7.9,deliveryFee:7.9});assert.equal(r.subtotal,40);assert.equal(r.discount,0);assert.equal(r.total,55.8)});
test("aplica cupom percentual somente sobre serviços",()=>{const r=calculateOrder({items:[{quantity:2,unitPrice:50}],collectionFee:10,deliveryFee:10,coupon:{type:"PERCENT",value:10}});assert.equal(r.discount,10);assert.equal(r.total,110)});
test("limita desconto fixo ao subtotal",()=>{const r=calculateOrder({items:[{quantity:1,unitPrice:20}],coupon:{type:"FIXED",value:50}});assert.equal(r.discount,20);assert.equal(r.total,0)});
test("limita percentual em 100%",()=>{const r=calculateOrder({items:[{quantity:1,unitPrice:100}],coupon:{type:"PERCENT",value:500}});assert.equal(r.discount,100);assert.equal(r.total,0)});
