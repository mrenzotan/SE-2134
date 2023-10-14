"use strict";
// USING ASYNC AWAIT
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("node:fs/promises"));
const readLineSync = __importStar(require("readline-sync"));
const FILENAME = 'debts03.txt';
function isNumber(amount) {
    return !Number.isNaN(amount);
}
function displayDebtors() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('\n' + '-'.repeat(100) + '\nHere is the list of debtors: ');
            const readFile = yield fs.readFile(FILENAME, { encoding: 'utf-8', flag: 'r' });
            console.log(readFile);
        }
        catch (error) {
            console.log('Something went wrong while reading file: \n', error);
        }
    });
}
function promptInput() {
    return __awaiter(this, void 0, void 0, function* () {
        const input = readLineSync.question();
        if (input === 'end') {
            return displayDebtors();
        }
        if (!input.includes(' ')) {
            console.log('Invalid input format.');
            return promptInput();
        }
        const inputArr = input.split(' ');
        const name = inputArr[0];
        const amount = Number(inputArr[1]);
        if (!isNumber(Number(name)) && isNumber(amount)) {
            try {
                yield fs.writeFile(FILENAME, input + '\n', { flag: 'a+' });
                return promptInput();
            }
            catch (error) {
                console.log('Something went wrong while writing file: \n', error);
            }
        }
        else {
            console.log('Invalid input. Please try again.');
            return promptInput();
        }
    });
}
console.log('Please input debtor NAME and debtor AMOUNT:');
console.log('Type "end" to stop the program.');
console.log('-'.repeat(100));
promptInput();
