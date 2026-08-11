import test from "node:test";import assert from "node:assert/strict";import { statusProgress, orderStatusLabel } from "../src/lib/order-status";
test("entrega concluída chega a 100%",()=>{assert.equal(statusProgress.DELIVERED,100);assert.equal(orderStatusLabel.DELIVERED,"Entregue")});
test("cancelado tem rótulo",()=>assert.equal(orderStatusLabel.CANCELED,"Cancelado"));
