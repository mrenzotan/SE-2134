import * as fs from 'node:fs';

import * as readLineSync from 'readline-sync';

const FILENAME = 'debts01.txt';

function isNumber(amount: number | string) {
  return !Number.isNaN(amount);
}

function callAfterWritingFile(error: NodeJS.ErrnoException | null) {
  if (error) {
    console.log('Something wrong occured while writing file \n');
    throw error;
  }
}

function callAfterReadingFile(error: NodeJS.ErrnoException | null, file: Buffer) {
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
  const amount: number = Number(inputArr[1]);
  const name: string | number = inputArr[0];

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
