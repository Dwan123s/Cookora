import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Recipe } from '@cookora/contracts';
import { budgetResult, recipeCost, isPriceBook } from '../frontend/src/meal-cost';
import { leftoverStatus, isLeftovers, type Leftover } from '../frontend/src/food-storage';
const recipe = { baseServings:2, ingredients:[{ingredientId:'tomato',name:'Cà chua',quantity:'0.3',unit:'kg',optional:false},{ingredientId:'tomato',name:'Cà chua',quantity:'100',unit:'g',optional:false},{ingredientId:'optional',quantity:'3',unit:'g',optional:true}] } as Recipe;
const prices = [{ingredientId:'tomato',quantity:1,unit:'kg',price:30000,updatedAt:'2026-11-02T00:00:00Z'}];
test('weekly/day budgets and invalid input',()=>{
 assert.deepEqual(budgetResult(300000,'week',7,1,2),{total:300000,daily:300000/7,meals:14,perMeal:300000/14});
 assert.equal(budgetResult(50000,'day',3,2,2)?.total,150000);
 assert.equal(budgetResult(50000,'day',3,2,2)?.perMeal,12500);
 for(const args of [[0,7,1,2],[NaN,7,1,2],[100,0,1,2],[100,1,0,2],[100,1,1,0],[100,1.5,1,2],[100000001,7,1,2]]) assert.equal(budgetResult(args[0],'week',args[1],args[2],args[3]),null);
});
test('ingredient costs normalize units, merge duplicates, distinguish usage and whole packs',()=>{
 const result=recipeCost(recipe,2,prices);
 assert.equal(result.lines.length,1); assert.equal(result.usedTotal,12000);assert.equal(result.purchaseTotal,30000);assert.equal(result.perPerson,6000);
 assert.equal(recipeCost(recipe,4,prices).usedTotal,24000);
 assert.equal(recipeCost(recipe,6,prices).purchaseTotal,60000);
});
test('missing price/quantity/unit never confirms a budget match',()=>{
 assert.equal(recipeCost(recipe,2,[]).perPerson,null);
 assert.equal(recipeCost({...recipe,ingredients:[{...recipe.ingredients[0],quantity:null}]},2,prices).perPerson,null);
 assert.equal(recipeCost(recipe,2,[{...prices[0],unit:'ml'}]).perPerson,null);
 assert.equal(isPriceBook([{...prices[0],quantity:0}]),false);
 assert.equal(isPriceBook(prices),true);
});
const cooked=Date.parse('2026-11-02T02:00:00Z');
const item:Leftover={id:'test',name:'Món kiểm thử',quantity:200,unit:'g',group:'poultry',cookedAt:new Date(cooked).toISOString(),storedAt:new Date(cooked+1800000).toISOString(),environment:'fridge',condition:'correct',heat:'normal',riceNotReheated:false};
test('reference windows progress from current to near to past, without resetting from stored time',()=>{
 assert.equal(leftoverStatus(item,cooked+3600000).kind,'ok');
 assert.equal(leftoverStatus(item,cooked+49*3600000).kind,'soon');
 assert.equal(leftoverStatus(item,cooked+72*3600000).kind,'expired');
 assert.equal(leftoverStatus(item,cooked+72*3600000).eligible,false);
});
test('unknown conditions, broken cold chain, hot weather and late cooling block suggestions',()=>{
 for(const change of [{condition:'unknown'},{condition:'broken'},{heat:'unknown'},{group:'other'},{environment:'freezer'},{storedAt:new Date(cooked+3*3600000).toISOString()},{heat:'hot',storedAt:new Date(cooked+90*60000).toISOString()}]) assert.equal(leftoverStatus({...item,...change} as Leftover,cooked+6*3600000).eligible,false);
 assert.equal(leftoverStatus(item,cooked-1).kind,'unknown');
});
test('rice has its own 24-hour window and is not suggested after reheating or late cooling',()=>{
 const rice={...item,group:'rice' as const,riceNotReheated:true};
 assert.equal(leftoverStatus(rice,cooked+2*3600000).eligible,true);
 assert.equal(leftoverStatus(rice,cooked+24*3600000).kind,'expired');
 assert.equal(leftoverStatus({...rice,riceNotReheated:false},cooked+3600000).eligible,false);
 assert.equal(leftoverStatus({...rice,storedAt:new Date(cooked+61*60000).toISOString()},cooked+2*3600000).eligible,false);
 assert.equal(isLeftovers([item]),true);assert.equal(isLeftovers([{...item,quantity:-1}]),false);
});
