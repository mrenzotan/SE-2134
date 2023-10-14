"use strict";
// USING PROMISES
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
const fs = __importStar(require("node:fs/promises"));
const readLineSync = __importStar(require("readline-sync"));
const FILENAME = 'debts02.txt';
function isNumber(amount) {
    return !Number.isNaN(amount);
}
function writeFile() {
    return new Promise((resolve, reject) => {
        function promptInput() {
            const input = readLineSync.question();
            if (input === 'end') {
                resolve();
                return;
            }
            if (!input.includes(' ')) {
                console.log('Invalid input format.');
                promptInput();
                return;
            }
            const inputArr = input.split(' ');
            const name = inputArr[0];
            const amount = Number(inputArr[1]);
            if (!isNumber(Number(name)) && isNumber(amount)) {
                fs.writeFile(FILENAME, input + '\n', { flag: 'a+' })
                    .then(() => {
                    promptInput();
                })
                    .catch((error) => {
                    reject(error);
                });
            }
            else {
                console.log('Invalid input. Please try again.');
                promptInput();
            }
        }
        promptInput();
    });
}
function readFile() {
    return new Promise((resolve, reject) => {
        fs.readFile(FILENAME, 'utf-8')
            .then((filecontent) => {
            resolve(filecontent);
        })
            .catch((error) => {
            reject(error);
        });
    });
}
console.log('Please input debtor NAME and debtor AMOUNT:');
console.log('Type "end" to stop the program.');
console.log('-'.repeat(100));
writeFile()
    .then(() => {
    console.log('File written successfully.');
    return readFile();
})
    .then((filecontent) => {
    console.log('-'.repeat(100));
    console.log('List of Debtors and their Debts:');
    console.log(filecontent);
})
    .catch((error) => {
    console.log('There was an error: \n', error);
});
