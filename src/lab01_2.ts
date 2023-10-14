// USING PROMISES

import * as fs from 'node:fs/promises';

import * as readLineSync from 'readline-sync';

const FILENAME = 'debts02.txt';

function isNumber(amount: number | string) {
  return !Number.isNaN(amount);
}

function writeFile() {
  return new Promise((resolve: Function, reject: Function) => {
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
      const name: string = inputArr[0];
      const amount: number = Number(inputArr[1]);

      if (!isNumber(Number(name)) && isNumber(amount)) {
        fs.writeFile(FILENAME, input + '\n', { flag: 'a+' })
          .then(() => {
            promptInput();
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        console.log('Invalid input. Please try again.');
        promptInput();
      }
    }

    promptInput();
  });
}

function readFile() {
  return new Promise<string>((resolve, reject) => {
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
