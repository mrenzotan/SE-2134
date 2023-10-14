"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("node:fs"));
const readLineSync = __importStar(require("readline-sync"));
const FILENAME = 'debts01.txt';
function isNumber(amount) {
    return !Number.isNaN(amount);
}
function callAfterWritingFile(error) {
    if (error) {
        console.log('Something wrong occured while writing file \n');
        throw error;
    }
}
function callAfterReadingFile(error, file) {
    if (error) {
        console.log('Something wrong occurred while reading file \n');
        throw error;
    }
    console.log(file.toString());
}
function displayDebtors() {
    console.log('-'.repeat(100));
    console.log('List of Debtors and their respective Debts:');
    fs.readFile(FILENAME, callAfterReadingFile);
}
console.log('Type: "end" to end program');
console.log('-'.repeat(100));
console.log('Please input name and amount of debtor: ');
while (true) {
    const input = readLineSync.question();
    if (input === 'end') {
        break;
    }
    if (!input.includes(' ')) {
        console.log('Invalid input, please follow proper format: NAME *space* AMOUNT');
        continue;
    }
    const inputArr = input.split(' ');
    const amount = Number(inputArr[1]);
    const name = inputArr[0];
    if (!isNumber(name) && isNumber(amount)) {
        fs.writeFile(FILENAME, `${name} - ${amount} \n`, { flag: 'a+' }, callAfterWritingFile);
    }
    if (!isNumber(amount)) {
        console.log('Invalid amount input. Please ensure amount is in number format.');
        continue;
    }
    if (isNumber(name)) {
        console.log('Invalid name input. Please enter a valid name.');
        continue;
    }
    displayDebtors();
}
